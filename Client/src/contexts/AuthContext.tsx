// src/contexts/AuthContext.tsx
import { useRouter, useSegments } from "expo-router";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { verifyToken, signOutUser, getStoredUser, verifyOTP as authVerifyOTP, sendOTP as authSendOTP, resendOTP as authResendOTP } from "@/utils/auth";
import { User, tokenManager, userApi, UserProfileUpdate } from "@/services/apiService";
import { clearProfileCache } from "@/contexts/UserProfileContext";
import { setupPushNotifications } from "@/utils/pushNotifications";
import { useLanguageStore } from "@/stores/languageStore";


export interface OnboardingData {
  personalDetails?: {
    name?: string;
    age?: number;
    gender?: string;
    fathersName?: string;
    mothersName?: string;
    educationalQualification?: string;
    sonsMarried?: number;
    sonsUnmarried?: number;
    daughtersMarried?: number;
    daughtersUnmarried?: number;
    otherFamilyMembers?: number;
    village?: string;
    gramPanchayat?: string;
    nyayPanchayat?: string;
    postOffice?: string;
    tehsil?: string;
    block?: string;
    district?: string;
    pinCode?: string;
    state?: string;
  };
  landDetails?: {
    totalLandArea?: number;
    crops?: string[];
  };
  livestockDetails?: {
    [type: string]: number;
  };
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  needsOnboarding: boolean;
  isAdmin: boolean;
  loginAsAdmin: (token: string, userData: User) => Promise<void>;
  signIn: (phoneNumber: string, otp: string, isLoginMode?: boolean) => Promise<{ user: User; isNewUser: boolean }>;
  signOut: () => Promise<void>;
  sendOTP: (phoneNumber: string) => Promise<string>;
  resendOTP: (phoneNumber: string) => Promise<string>;
  refreshUser: () => Promise<void>;
  completeOnboarding: (data?: OnboardingData) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  needsOnboarding: false,
  isAdmin: false,
  loginAsAdmin: async () => { },
  signIn: async () => {
    throw new Error("AuthContext not initialized");
  },
  signOut: async () => { },
  sendOTP: async () => "",
  resendOTP: async () => "",
  refreshUser: async () => { },
  completeOnboarding: async () => { },
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const router = useRouter();
  const segments = useSegments();
  const { currentLanguage } = useLanguageStore();
  // Map app language to MSG91 WhatsApp template language code
  const waLanguage = currentLanguage === 'hi' ? 'hi' : 'en';

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // First check if we have a stored token
        const token = await tokenManager.getToken();

        if (token) {
          // Try to verify token with backend, but fall back to cached user
          // if the server is unreachable (e.g. Render free-tier sleeping)
          try {
            const userData = await verifyToken();
            if (userData) {
              setUser(userData);
              setIsAuthenticated(true);
              setNeedsOnboarding(userData.is_new_user === true);
              // Register/refresh push token on each app open while authenticated
              setupPushNotifications().catch(() => { });
            } else {
              // Backend explicitly rejected the token — clear and re-auth
              await tokenManager.clearAll();
              setIsAuthenticated(false);
              setUser(null);
              setNeedsOnboarding(false);
            }
          } catch (networkError) {
            // Network/server error — keep user logged in using cached data
            console.warn("Token verification failed (server unreachable), using cached user:", networkError);
            const cachedUser = await getStoredUser();
            if (cachedUser) {
              setUser(cachedUser);
              setIsAuthenticated(true);
              setNeedsOnboarding(cachedUser.is_new_user === true);
            } else {
              // No cached user either — force re-auth
              setIsAuthenticated(false);
              setUser(null);
              setNeedsOnboarding(false);
            }
          }
        } else {
          // No token at all — user must log in
          setIsAuthenticated(false);
          setUser(null);
          setNeedsOnboarding(false);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        setIsAuthenticated(false);
        setUser(null);
        setNeedsOnboarding(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Navigation guard effect
  useEffect(() => {
    if (isLoading) return;

    if (isAdmin) {
      if (segments[0] !== "(admin)") {
        router.replace("/(admin)/dashboard" as any);
      }
      return;
    }

    const inAuthGroup = segments[0] === "(auth)";

    // Screens that belong exclusively to the onboarding flow.
    // A user with needsOnboarding=true must be allowed to stay on these.
    const onboardingScreens = ["personal-details", "location-picker", "land-details", "livestock-details", "onboarding"];
    const onCurrentOnboardingScreen = inAuthGroup && onboardingScreens.includes(segments[1] as string);

    if (!isAuthenticated && !inAuthGroup) {
      // Redirect to auth if not authenticated and not in auth screens
      router.replace("/(auth)/" as any);
    } else if (isAuthenticated && needsOnboarding && onCurrentOnboardingScreen) {
      // ✅ User is authenticated AND still needs onboarding AND is already on an
      // onboarding screen — let the onboarding flow manage its own navigation.
      // DO NOT redirect. This was the crash trigger: the guard was firing during
      // the async location-permission dialog, unmounting the map screen mid-operation.
      return;
    } else if (isAuthenticated && !needsOnboarding && (inAuthGroup || onCurrentOnboardingScreen)) {
      // Authenticated user who completed onboarding — skip to tabs.
      // Also blocks login users (needsOnboarding=false) from landing on onboarding screens.
      router.replace("/(tab)/" as any);
    }
  }, [isAuthenticated, isAdmin, segments, isLoading, needsOnboarding, router]);

  // Send OTP function
  const sendOTP = useCallback(async (phoneNumber: string): Promise<string> => {
    return authSendOTP(phoneNumber, waLanguage);
  }, [waLanguage]);

  // Resend OTP function
  const resendOTP = useCallback(
    async (phoneNumber: string): Promise<string> => {
      return authResendOTP(phoneNumber, waLanguage);
    },
    [waLanguage]
  );

  const loginAsAdmin = useCallback(async (token: string, userData: User) => {
    setIsAdmin(true);
    setIsAuthenticated(true);
    setNeedsOnboarding(false);
    setUser(userData);
    await tokenManager.setToken(token);
    await tokenManager.setUser(userData);
    router.replace("/(admin)/dashboard" as any);
  }, [router]);

  // Sign in function - now returns isNewUser flag
  const signIn = useCallback(
    async (phoneNumber: string, otp: string, isLoginMode = false): Promise<{ user: User; isNewUser: boolean }> => {
      const userData = await authVerifyOTP(phoneNumber, otp);
      setUser(userData);
      setIsAuthenticated(true);
      const isNewUser = isLoginMode ? false : userData.is_new_user === true;
      setNeedsOnboarding(isNewUser);
      // Register push token now that user is authenticated
      setupPushNotifications().catch(() => { });
      return { user: userData, isNewUser };
    },
    []
  );

  // Complete onboarding - syncs collected data to backend, then navigates
  const completeOnboarding = useCallback(async (data?: OnboardingData) => {
    try {
      // Build the profile update payload from onboarding data
      if (data?.personalDetails) {
        const pd = data.personalDetails;
        const profilePayload: Partial<UserProfileUpdate> = {
          name: pd.name || undefined,
          age: pd.age || undefined,
          gender: pd.gender || undefined,
          photo_url: (pd as any).photoUrl || undefined,
          fathers_name: pd.fathersName || undefined,
          mothers_name: pd.mothersName || undefined,
          educational_qualification: pd.educationalQualification || undefined,
          sons_married: pd.sonsMarried,
          sons_unmarried: pd.sonsUnmarried,
          daughters_married: pd.daughtersMarried,
          daughters_unmarried: pd.daughtersUnmarried,
          other_family_members: pd.otherFamilyMembers,
          village: pd.village || undefined,
          gram_panchayat: pd.gramPanchayat || undefined,
          nyay_panchayat: pd.nyayPanchayat || undefined,
          post_office: pd.postOffice || undefined,
          tehsil: pd.tehsil || undefined,
          block: pd.block || undefined,
          district: pd.district || undefined,
          pin_code: pd.pinCode || undefined,
          state: pd.state || undefined,
        };

        // Add land details if present
        if (data.landDetails) {
          profilePayload.land_details = {
            total_land_area: data.landDetails.totalLandArea,
            rabi_crop: data.landDetails.crops?.join(", "),
          };
        }

        // Add livestock details if present
        if (data.livestockDetails) {
          profilePayload.livestock_details = {
            cow: data.livestockDetails.cow || 0,
            buffalo: data.livestockDetails.buffalo || 0,
            goat: data.livestockDetails.goat || 0,
            sheep: data.livestockDetails.sheep || 0,
            pig: data.livestockDetails.pig || 0,
            poultry: data.livestockDetails.poultry || 0,
            others: data.livestockDetails.others || 0,
          };
        }

        console.log("📝 Syncing onboarding data to backend:", JSON.stringify(profilePayload).slice(0, 300));
        await userApi.updateProfile(profilePayload);

        // ─── Immediately update local auth user with onboarding data ───
        // This prevents "New User" from flashing on the home/profile screens
        if (user) {
          const updatedUser = {
            ...user,
            is_new_user: false,
            isNewUser: false,
            name: pd.name || user.name || user.name,
            age: pd.age || user.age,
            gender: pd.gender || user.gender,
            village: pd.village || user.village,
            district: pd.district || user.district,
            state: pd.state || user.state,
            fathers_name: pd.fathersName || user.fathers_name,
            fathersName: pd.fathersName || user.fathersName,
            mothers_name: pd.mothersName || user.mothers_name,
            mothersName: pd.mothersName || user.mothersName,
          };
          setUser(updatedUser);
          tokenManager.setUser(updatedUser);
        }

        // ─── Refresh from backend to get the canonical data ───
        try {
          const freshUser = await verifyToken();
          if (freshUser) {
            const completeUser = { ...freshUser, is_new_user: false };
            setUser(completeUser);
            tokenManager.setUser(completeUser);
          }
        } catch (refreshErr) {
          console.warn("Could not refresh user after onboarding:", refreshErr);
          // Non-fatal — optimistic local data is already set above
        }
      }
    } catch (error) {
      console.error("Failed to sync onboarding data:", error);
      // Still mark onboarding as done — data is saved locally, can be synced later
      if (user) {
        const updatedUser = { ...user, is_new_user: false };
        setUser(updatedUser);
        tokenManager.setUser(updatedUser);
      }
    }

    setNeedsOnboarding(false);
    router.replace("/(tab)/" as any);
  }, [user, router]);

  const signOut = useCallback(async () => {
    try {
      await signOutUser();
      await clearProfileCache();
      setIsAuthenticated(false);
      setIsAdmin(false);
      setUser(null);
      setNeedsOnboarding(false);
      router.replace("/(auth)/welcome");
    } catch (error) {
      console.error("Sign out error:", error);
      throw error;
    }
  }, [router]);

  // Refresh user data — also syncs isAuthenticated so callers like the
  // password login flow can trigger the navigation guard without a full re-mount.
  const refreshUser = useCallback(async () => {
    try {
      const userData = await verifyToken();
      if (userData) {
        setUser(userData);
        setIsAuthenticated(true);
        setNeedsOnboarding(userData.is_new_user === true);
      }
    } catch (error) {
      console.error("Failed to refresh user:", error);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        user,
        needsOnboarding,
        isAdmin,
        loginAsAdmin,
        signIn,
        signOut,
        sendOTP,
        resendOTP,
        refreshUser,
        completeOnboarding,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// src/contexts/AuthContext.tsx
import { useRouter, useSegments } from "expo-router";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  verifyToken,
  signOutUser,
  getStoredUser,
  verifyOTP as authVerifyOTP,
  sendOTP as authSendOTP,
  resendOTP as authResendOTP,
} from "@/utils/auth";
import { User, tokenManager, userApi, UserProfileUpdate } from "@/services/apiService";

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
  signIn: (phoneNumber: string, otp: string) => Promise<{ user: User; isNewUser: boolean }>;
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
  signIn: async () => {
    throw new Error("AuthContext not initialized");
  },
  signOut: async () => {},
  sendOTP: async () => "",
  resendOTP: async () => "",
  refreshUser: async () => {},
  completeOnboarding: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const router = useRouter();
  const segments = useSegments();

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // First check if we have a stored token
        const token = await tokenManager.getToken();

        if (token) {
          // Verify token with backend
          const userData = await verifyToken();

          if (userData) {
            setUser(userData);
            setIsAuthenticated(true);
            // Check if user needs onboarding
            setNeedsOnboarding(userData.is_new_user === true);
          } else {
            // Token invalid, clear everything
            await tokenManager.clearAll();
            setIsAuthenticated(false);
            setUser(null);
            setNeedsOnboarding(false);
          }
        } else {
          // No token, check for stored user (offline mode)
          const storedUser = await getStoredUser();
          if (storedUser) {
            // We have user data but no valid token - needs re-auth
            setIsAuthenticated(false);
            setUser(null);
          }
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

    const inAuthGroup = segments[0] === "(auth)";

    if (!isAuthenticated && !inAuthGroup) {
      // Redirect to auth if not authenticated and not in auth screens
      router.replace("/(auth)/" as any);
    } else if (isAuthenticated && inAuthGroup && !needsOnboarding) {
      // Authenticated user who doesn't need onboarding — skip auth stack
      router.replace("/(tab)/" as any);
    }
  }, [isAuthenticated, segments, isLoading, needsOnboarding]);

  // Send OTP function
  const sendOTP = useCallback(async (phoneNumber: string): Promise<string> => {
    return authSendOTP(phoneNumber);
  }, []);

  // Resend OTP function
  const resendOTP = useCallback(
    async (phoneNumber: string): Promise<string> => {
      return authResendOTP(phoneNumber);
    },
    []
  );

  // Sign in function - now returns isNewUser flag
  const signIn = useCallback(
    async (phoneNumber: string, otp: string): Promise<{ user: User; isNewUser: boolean }> => {
      const userData = await authVerifyOTP(phoneNumber, otp);
      setUser(userData);
      setIsAuthenticated(true);
      const isNewUser = userData.is_new_user === true;
      setNeedsOnboarding(isNewUser);
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
          name: pd.fathersName || pd.name || undefined, // onboarding uses fathersName for full name
          age: pd.age || undefined,
          gender: pd.gender || undefined,
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
      }
    } catch (error) {
      console.error("Failed to sync onboarding data:", error);
      // Continue anyway — data is saved locally, can be synced later
    }

    setNeedsOnboarding(false);
    // Update user locally to reflect onboarding is complete
    if (user) {
      const updatedUser = { ...user, is_new_user: false };
      setUser(updatedUser);
      tokenManager.setUser(updatedUser);
    }
    router.replace("/(tab)/");
  }, [user, router]);

  // Sign out function
  const signOut = useCallback(async () => {
    try {
      await signOutUser();
      setIsAuthenticated(false);
      setUser(null);
      setNeedsOnboarding(false);
      router.replace("/(auth)/welcome");
    } catch (error) {
      console.error("Sign out error:", error);
      throw error;
    }
  }, [router]);

  // Refresh user data
  const refreshUser = useCallback(async () => {
    try {
      const userData = await verifyToken();
      if (userData) {
        setUser(userData);
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

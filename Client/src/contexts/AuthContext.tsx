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
import { User, tokenManager } from "@/services/apiService";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  needsOnboarding: boolean;
  isGuestMode: boolean;
  signIn: (phoneNumber: string, otp: string) => Promise<{ user: User; isNewUser: boolean }>;
  signOut: () => Promise<void>;
  sendOTP: (phoneNumber: string) => Promise<string>;
  resendOTP: (phoneNumber: string) => Promise<string>;
  refreshUser: () => Promise<void>;
  completeOnboarding: () => void;
  skipAuth: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  needsOnboarding: false,
  isGuestMode: false,
  signIn: async () => {
    throw new Error("AuthContext not initialized");
  },
  signOut: async () => {},
  sendOTP: async () => "",
  resendOTP: async () => "",
  refreshUser: async () => {},
  completeOnboarding: () => {},
  skipAuth: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [isGuestMode, setIsGuestMode] = useState(false);
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
    const currentScreen = segments[1];
    // Allow onboarding-related screens
    const inOnboardingFlow = ["onboarding", "personal-details", "land-details", "livestock-details"].includes(currentScreen);

    if (!isAuthenticated && !isGuestMode && !inAuthGroup) {
      // Redirect to auth if not authenticated, not in guest mode, and not in auth screens
      router.replace("/(auth)/welcome");
    } else if (isAuthenticated && inAuthGroup && !inOnboardingFlow) {
      // If authenticated but in auth screens (except onboarding flow), redirect appropriately
      if (needsOnboarding) {
        router.replace("/(auth)/personal-details");
      } else {
        router.replace("/(tab)/");
      }
    }
  }, [isAuthenticated, segments, isLoading, needsOnboarding, isGuestMode]);

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

  // Complete onboarding - called after user finishes onboarding
  const completeOnboarding = useCallback(() => {
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
      setIsGuestMode(false);
      router.replace("/(auth)/welcome");
    } catch (error) {
      console.error("Sign out error:", error);
      throw error;
    }
  }, [router]);

  // Skip authentication - enter guest mode
  const skipAuth = useCallback(() => {
    setIsGuestMode(true);
    router.replace("/(tab)/");
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
        isGuestMode,
        signIn,
        signOut,
        sendOTP,
        resendOTP,
        refreshUser,
        completeOnboarding,
        skipAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// src/contexts/AuthContext.tsx
import { useRouter, useSegments } from "expo-router";
import React, { createContext, useContext, useEffect, useState } from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: () => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  signIn: () => {},
  signOut: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    // Check if user is authenticated (you can check AsyncStorage here)
    const checkAuth = async () => {
      try {
        // For demo purposes, check if onboarding is complete
        // In production, check AsyncStorage or SecureStore
        const isOnboardingComplete = false; // Replace with actual check
        setIsAuthenticated(isOnboardingComplete);
      } catch (error) {
        console.error("Auth check failed:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";
    const inTabGroup = segments[0] === "(tab)";

    if (!isAuthenticated && !inAuthGroup) {
      // Redirect to auth if not authenticated and not in auth screens
      router.replace("/(auth)/welcome");
    } else if (isAuthenticated && inAuthGroup) {
      // Redirect to home if authenticated and in auth screens
      router.replace("/(tab)/");
    }
  }, [isAuthenticated, segments, isLoading]);

  const signIn = () => {
    setIsAuthenticated(true);
  };

  const signOut = () => {
    setIsAuthenticated(false);
    router.replace("/(auth)/welcome");
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

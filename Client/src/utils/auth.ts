// src/utils/auth.ts
// Real authentication utilities connecting to backend API

import { authApi, tokenManager, ApiError, User } from "@/services/apiService";

/**
 * Send OTP to the given phone number
 * @param phoneNumber - 10-digit Indian mobile number (with or without +91 prefix)
 * @returns Phone number that OTP was sent to
 */
export const sendOTP = async (phoneNumber: string): Promise<string> => {
  // Clean the phone number - remove +91 prefix if present
  const cleanedNumber = phoneNumber.replace(/^\+91/, "").replace(/\D/g, "");

  try {
    const response = await authApi.sendOTP(cleanedNumber);

    if (response.status === "success" && response.data) {
      // In development mode, log the OTP for testing
      if (response.data.otp) {
        console.log(`📱 Development OTP: ${response.data.otp}`);
      }

      return response.data.mobile_number;
    }

    throw new Error(response.message || "Failed to send OTP");
  } catch (error) {
    if (error instanceof ApiError) {
      throw new Error(error.message);
    }
    throw error;
  }
};

/**
 * Verify OTP and authenticate user
 * @param phoneNumber - Phone number that received OTP
 * @param otpCode - 6-digit OTP code
 * @returns Authenticated user data
 */
export const verifyOTP = async (
  phoneNumber: string,
  otpCode: string
): Promise<User> => {
  // Clean the phone number
  const cleanedNumber = phoneNumber.replace(/^\+91/, "").replace(/\D/g, "");

  try {
    const response = await authApi.verifyOTP(cleanedNumber, otpCode);

    if (response.status === "success" && response.data) {
      // Store the token and user data
      await tokenManager.setToken(response.data.token);
      await tokenManager.setUser(response.data.user);

      return response.data.user;
    }

    throw new Error(response.message || "Invalid OTP");
  } catch (error) {
    if (error instanceof ApiError) {
      throw new Error(error.message);
    }
    throw error;
  }
};

/**
 * Resend OTP to phone number
 * @param phoneNumber - Phone number to resend OTP to
 * @returns Phone number that OTP was sent to
 */
export const resendOTP = async (phoneNumber: string): Promise<string> => {
  const cleanedNumber = phoneNumber.replace(/^\+91/, "").replace(/\D/g, "");

  try {
    const response = await authApi.resendOTP(cleanedNumber);

    if (response.status === "success" && response.data) {
      if (response.data.otp) {
        console.log(`📱 Development OTP (resent): ${response.data.otp}`);
      }

      return response.data.mobile_number;
    }

    throw new Error(response.message || "Failed to resend OTP");
  } catch (error) {
    if (error instanceof ApiError) {
      throw new Error(error.message);
    }
    throw error;
  }
};

/**
 * Verify if the current token is valid
 * @returns User data if token is valid, null otherwise
 */
export const verifyToken = async (): Promise<User | null> => {
  try {
    const token = await tokenManager.getToken();

    if (!token) {
      return null;
    }

    const response = await authApi.verifyToken();

    if (response.status === "success" && response.data) {
      // Update stored user data
      await tokenManager.setUser(response.data.user);
      return response.data.user;
    }

    // Token invalid, clear storage
    await tokenManager.clearAll();
    return null;
  } catch (error) {
    console.error("Token verification failed:", error);
    // On error, clear auth data
    await tokenManager.clearAll();
    return null;
  }
};

/**
 * Sign out the current user
 */
export const signOutUser = async (): Promise<void> => {
  await tokenManager.clearAll();
};

/**
 * Get stored user data
 */
export const getStoredUser = async (): Promise<User | null> => {
  return tokenManager.getUser();
};

/**
 * Check if user is authenticated (has valid token)
 */
export const isAuthenticated = async (): Promise<boolean> => {
  const token = await tokenManager.getToken();
  return !!token;
};

/**
 * Sync user profile to backend (called after onboarding)
 * @param userData - User profile data to sync
 */
export const syncUserProfile = async (
  userData: Partial<User>
): Promise<User> => {
  try {
    const { userApi } = await import("@/services/apiService");
    const response = await userApi.updateProfile(userData);

    if (response.status === "success" && response.data) {
      await tokenManager.setUser(response.data.user);
      return response.data.user;
    }

    throw new Error(response.message || "Failed to sync user profile");
  } catch (error) {
    if (error instanceof ApiError) {
      throw new Error(error.message);
    }
    throw error;
  }
};

// src/utils/auth.ts
// Static/dummy auth utilities - no actual API calls

// Static OTP for demo
export const STATIC_OTP = "000000";

/**
 * Dummy sendOTP function - doesn't actually send OTP
 * Returns a dummy verification ID
 */
export const sendOTP = async (
  phoneNumber: string,
  _recaptchaVerifier: any,
): Promise<string> => {
  // Simulate a short delay like a real API call
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Return a dummy verification ID
  return `dummy-verification-${Date.now()}`;
};

/**
 * Dummy verifyOTP function - only accepts "000000" as valid OTP
 */
export const verifyOTP = async (
  _verificationId: string,
  otpCode: string,
): Promise<{ uid: string; phoneNumber: string }> => {
  // Simulate a short delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Check if OTP matches the static OTP
  if (otpCode !== STATIC_OTP) {
    throw new Error("Invalid OTP. Please use 000000 for demo.");
  }

  // Return a dummy user object
  return {
    uid: `demo-user-${Date.now()}`,
    phoneNumber: "+91XXXXXXXXXX",
  };
};

/**
 * Dummy syncUser function - doesn't sync to any backend
 */
export const syncUser = async (user: {
  uid: string;
  phoneNumber: string;
}): Promise<void> => {
  // Simulate a short delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  // In a real app, this would sync user data to backend
  console.log("Demo mode: User synced (no actual backend call)", user);
};

// src/data/interfaces/auth.d.ts

export interface LanguageOption {
  code: string;
  label: string;
  nativeLabel: string;
  symbol: string;
}

export interface AuthState {
  phoneNumber: string;
  verificationId: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface OTPInputState {
  otp: string[];
  activeIndex: number;
  isVerifying: boolean;
  countdown: number;
  canResend: boolean;
}

export type TranslationFn = (
  key: string,
  params?: Record<string, string | number>,
) => string;

const EXACT_MESSAGE_KEYS: Record<string, string> = {
  "Mobile number is required": "validation.mobileRequired",
  "Mobile number must be exactly 10 digits": "validation.mobileTenDigits",
  "Mobile number must start with 6, 7, 8, or 9": "validation.mobileStartDigit",
  "OTP is required": "validation.otpRequired",
  "OTP must be exactly 6 digits": "validation.otpSixDigits",
  "Aadhaar number must be exactly 12 digits": "validation.aadhaarInvalid",
  "Land area must be a number": "validation.landAreaNumeric",
  "Land area cannot be negative": "validation.landAreaNegative",
  "Land area seems too large. Please verify.": "validation.landAreaTooLarge",
  "Land area is required": "validation.landAreaRequired",
  "Land area must be greater than 0": "validation.landAreaPositive",
  "Land unit is required": "validation.landUnitRequired",
  "At least one crop must be selected": "validation.cropRequired",
  "Animal type is required": "validation.animalTypeRequired",
  "Animal count is required": "validation.animalCountRequired",
  "Animal count must be greater than 0": "validation.animalCountPositive",
  "Count must be a number": "validation.countNumeric",
  "Count cannot be negative": "validation.countNegative",
  "Count must be a whole number": "validation.countWholeNumber",
  "Count seems too large. Please verify.": "validation.countTooLarge",
  "Invalid OTP": "auth.invalidOtp",
  "OTP has expired": "auth.otpExpired",
  "OTP already used": "auth.otpAlreadyUsed",
  "Invalid mobile number or password": "auth.invalidCredentials",
  "Failed to send OTP. Please try again.": "auth.otpSendFailed",
  "Failed to resend OTP": "auth.resendOtpFailed",
  "Failed to verify OTP. Please try again.": "auth.invalidOtp",
  "Failed to set password": "auth.setPassword.failedMessage",
  "Password must be at least 6 characters": "validation.passwordMinLength",
  "No password set for this account. Please use OTP to log in and set a password.":
    "auth.noPasswordMessage",
};

const FIELD_LABEL_KEYS: Record<string, string> = {
  Name: "onboarding.fullName",
  "Father's name": "onboarding.fathersName",
  "Mother's name": "onboarding.mothersName",
};

const translateOrFallback = (
  t: TranslationFn,
  key: string,
  fallback: string,
  params?: Record<string, string | number>,
) => {
  const translated = t(key, params);
  return translated === key ? fallback : translated;
};

const translateFieldLabel = (field: string, t: TranslationFn) => {
  const key = FIELD_LABEL_KEYS[field];
  return key ? translateOrFallback(t, key, field) : field;
};

export const translateKnownError = (
  message: string | undefined,
  t: TranslationFn,
): string | undefined => {
  if (!message) return message;

  const exactKey = EXACT_MESSAGE_KEYS[message];
  if (exactKey) {
    return translateOrFallback(t, exactKey, message);
  }

  const requiredMatch = message.match(/^(.+) is required$/);
  if (requiredMatch) {
    return translateOrFallback(t, "validation.fieldRequired", message, {
      field: translateFieldLabel(requiredMatch[1], t),
    });
  }

  const minMatch = message.match(/^(.+) must be at least (\d+) characters$/);
  if (minMatch) {
    return translateOrFallback(t, "validation.fieldMinLength", message, {
      field: translateFieldLabel(minMatch[1], t),
      min: minMatch[2],
    });
  }

  const maxMatch = message.match(/^(.+) must not exceed (\d+) characters$/);
  if (maxMatch) {
    return translateOrFallback(t, "validation.fieldMaxLength", message, {
      field: translateFieldLabel(maxMatch[1], t),
      max: maxMatch[2],
    });
  }

  const lettersMatch = message.match(/^(.+) should only contain letters and spaces$/);
  if (lettersMatch) {
    return translateOrFallback(t, "validation.fieldLettersOnly", message, {
      field: translateFieldLabel(lettersMatch[1], t),
    });
  }

  return message;
};

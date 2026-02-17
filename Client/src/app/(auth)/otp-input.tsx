// src/app/(auth)/otp-input.tsx
import AppText from "@/components/atoms/AppText";
import Button from "@/components/atoms/Button";
import AuthVideoBackground from "@/components/molecules/AuthVideoBackground";
import { useTranslation } from "@/i18n";
import { useAuth } from "@/contexts/AuthContext";
import { validateOTP, validateMobileNumber } from "@/utils/validation";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const OTP_LENGTH = 6;

const OTPInput = () => {
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const router = useRouter();
  const { phoneNumber } = useLocalSearchParams<{
    phoneNumber: string;
  }>();
  const { t } = useTranslation();
  const { signIn, resendOTP } = useAuth();

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  // Focus first input on mount
  useEffect(() => {
    setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 100);
  }, []);

  const handleOtpChange = (value: string, index: number) => {
    // Only allow numeric input
    if (value && !/^\d+$/.test(value)) return;

    const newOtp = [...otp];

    // Handle paste (multiple digits)
    if (value.length > 1) {
      const digits = value.slice(0, OTP_LENGTH - index).split("");
      digits.forEach((digit, i) => {
        if (index + i < OTP_LENGTH) {
          newOtp[index + i] = digit;
        }
      });
      setOtp(newOtp);
      // Focus on the next empty field or last field
      const nextIndex = Math.min(index + digits.length, OTP_LENGTH - 1);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    // Handle single digit
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async () => {
    const otpString = otp.join("");
    
    // Validate OTP format
    const otpValidation = validateOTP(otpString);
    if (!otpValidation.isValid) {
      setValidationError(otpValidation.errors[0]);
      Alert.alert(t("common.error") || "Error", otpValidation.errors[0]);
      return;
    }

    // Validate phone number exists
    if (!phoneNumber) {
      const error = "Phone number not found. Please go back and try again.";
      setValidationError(error);
      Alert.alert(t("common.error") || "Error", error);
      return;
    }
    
    // Validate phone number format
    const cleanedNumber = phoneNumber.replace(/^\+91/, "");
    const phoneValidation = validateMobileNumber(cleanedNumber);
    if (!phoneValidation.isValid) {
      setValidationError(phoneValidation.errors[0]);
      Alert.alert(t("common.error") || "Error", phoneValidation.errors[0]);
      return;
    }

    setValidationError(null);
    setLoading(true);
    try {
      // Call backend API to verify OTP and sign in
      const { isNewUser } = await signIn(phoneNumber, otpString);
      // Navigate based on user status
      if (isNewUser) {
        router.replace("/(auth)/personal-details");
      } else {
        router.replace("/(tab)");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Invalid OTP";
      setValidationError(errorMessage);
      Alert.alert(
        t("common.error") || "Error",
        errorMessage,
      );
      // Clear OTP on error
      setOtp(Array(OTP_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!phoneNumber) {
      Alert.alert("Error", "Phone number not found");
      return;
    }

    try {
      await resendOTP(phoneNumber);
      setCountdown(30);
      setCanResend(false);
      setOtp(Array(OTP_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
      Alert.alert("OTP Sent", "A new OTP has been sent to your phone. Check backend console for OTP.");
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to resend OTP",
      );
    }
  };

  const handleChangeNumber = () => {
    router.back();
  };

  // Mask phone number for display
  const maskedPhone = phoneNumber
    ? `${phoneNumber.slice(0, 6)}${"*".repeat(4)}${phoneNumber.slice(-2)}`
    : "";

  return (
    <KeyboardAvoidingView
      style={s.root}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Video Background */}
      <View style={s.videoBg}>
        <AuthVideoBackground />
      </View>

      {/* OTP Input Card */}
      <View style={s.card}>
        {/* Title */}
        <AppText
          variant="h2"
          style={s.title}
        >
          {t("auth.enterOTP")}
        </AppText>

        {/* Subtitle with masked phone */}
        <Text style={s.subtitle}>
          {t("auth.otpSentTo")} {maskedPhone}
        </Text>

        {/* Demo hint */}
        <Text style={s.demoHint}>
          Test Mode: Check backend console for OTP
        </Text>

        {/* OTP Input Fields */}
        <View style={s.otpRow}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => {
                inputRefs.current[index] = ref;
              }}
              style={{
                width: 44,
                height: 52,
                borderWidth: 2,
                borderRadius: 12,
                textAlign: "center",
                fontSize: 22,
                fontWeight: "bold",
                borderColor: validationError ? "#EF4444" : digit ? "#386641" : "#E5E7EB",
                backgroundColor: digit ? "rgba(56, 102, 65, 0.05)" : "#F9FAFB",
              }}
              value={digit}
              onChangeText={(value) => {
                handleOtpChange(value, index);
                if (validationError) setValidationError(null);
              }}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
              editable={!loading}
            />
          ))}
        </View>
        
        {/* Validation Error */}
        {validationError && (
          <Text style={s.errorText}>{validationError}</Text>
        )}
        {!validationError && <View style={{ marginBottom: 16 }} />}

        {/* Resend OTP */}
        <View style={s.resendRow}>
          {canResend ? (
            <TouchableOpacity onPress={handleResendOTP}>
              <Text style={s.resendLink}>
                {t("auth.resendOTP")}
              </Text>
            </TouchableOpacity>
          ) : (
            <Text style={s.resendTimer}>
              {t("auth.didntReceiveOtp")}{" "}
              <Text style={s.resendLink}>
                {t("auth.resendOtpIn")} {countdown}s
              </Text>
            </Text>
          )}
        </View>

        {/* Verify Button */}
        <Button
          variant="primary"
          onPress={handleVerifyOTP}
          disabled={loading || otp.join("").length !== OTP_LENGTH}
          style={{ width: "100%", paddingVertical: 16, marginBottom: 16 }}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={s.btnText}>
              {t("auth.verifyOTP")}
            </Text>
          )}
        </Button>

        {/* Change Number Link */}
        <TouchableOpacity onPress={handleChangeNumber}>
          <Text style={s.changeNumber}>
            {t("auth.changeNumber")}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default OTPInput;

const s = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "flex-end",
  },
  videoBg: {
    flex: 1,
    height: "55%",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    textAlign: "center",
    color: "#212121",
    fontWeight: "700",
    marginBottom: 8,
  },
  subtitle: {
    textAlign: "center",
    color: "#616161",
    fontSize: 14,
    marginBottom: 8,
  },
  demoHint: {
    textAlign: "center",
    color: "#386641",
    fontSize: 12,
    marginBottom: 16,
    fontWeight: "500",
  },
  otpRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginBottom: 8,
  },
  errorText: {
    color: "#EF4444",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 16,
  },
  resendRow: {
    alignItems: "center",
    marginBottom: 24,
  },
  resendLink: {
    color: "#386641",
    fontWeight: "500",
  },
  resendTimer: {
    color: "#616161",
    fontSize: 14,
  },
  btnText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontWeight: "600",
    fontSize: 16,
  },
  changeNumber: {
    textAlign: "center",
    color: "#616161",
  },
});

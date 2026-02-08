// src/app/(auth)/otp-input.tsx
import AppText from "@/components/atoms/AppText";
import Button from "@/components/atoms/Button";
import AuthVideoBackground from "@/components/molecules/AuthVideoBackground";
import { useTranslation } from "@/i18n";
import { useAuth } from "@/contexts/AuthContext";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
    if (otpString.length !== OTP_LENGTH) {
      Alert.alert("Error", "Please enter a valid 6-digit OTP");
      return;
    }

    if (!phoneNumber) {
      Alert.alert("Error", "Phone number not found. Please go back and try again.");
      return;
    }

    setLoading(true);
    try {
      // Call backend API to verify OTP and sign in
      await signIn(phoneNumber, otpString);
      // Navigate to onboarding after successful auth
      router.replace("/(auth)/onboarding");
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Invalid OTP",
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
    <View className="flex-1 justify-end">
      {/* Video Background */}
      <View className="flex h-[55vh]">
        <AuthVideoBackground />
      </View>

      {/* OTP Input Card */}
      <View className="bg-white rounded-t-3xl p-6 shadow-lg">
        {/* Title */}
        <AppText
          variant="h2"
          className="text-center text-neutral-textDark font-bold mb-2"
        >
          {t("auth.enterOTP")}
        </AppText>

        {/* Subtitle with masked phone */}
        <Text className="text-center text-neutral-textMedium text-sm mb-2">
          {t("auth.otpSentTo")} {maskedPhone}
        </Text>

        {/* Demo hint */}
        <Text className="text-center text-primary text-xs mb-4 font-medium">
          Test Mode: Check backend console for OTP
        </Text>

        {/* OTP Input Fields */}
        <View className="flex-row justify-center gap-2 mb-6">
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
                borderColor: digit ? "#386641" : "#E5E7EB",
                backgroundColor: digit ? "rgba(56, 102, 65, 0.05)" : "#F9FAFB",
              }}
              value={digit}
              onChangeText={(value) => handleOtpChange(value, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
              editable={!loading}
            />
          ))}
        </View>

        {/* Resend OTP */}
        <View className="items-center mb-6">
          {canResend ? (
            <TouchableOpacity onPress={handleResendOTP}>
              <Text className="text-primary font-medium">
                {t("auth.resendOTP")}
              </Text>
            </TouchableOpacity>
          ) : (
            <Text className="text-neutral-textMedium text-sm">
              {t("auth.didntReceiveOtp")}{" "}
              <Text className="text-primary font-medium">
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
          className="w-full py-4 mb-4"
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white text-center font-semibold text-base">
              {t("auth.verifyOTP")}
            </Text>
          )}
        </Button>

        {/* Change Number Link */}
        <TouchableOpacity onPress={handleChangeNumber}>
          <Text className="text-center text-neutral-textMedium">
            {t("auth.changeNumber")}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default OTPInput;

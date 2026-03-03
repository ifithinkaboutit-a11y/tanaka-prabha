// src/app/(auth)/otp-input.tsx
import AppText from "@/components/atoms/AppText";
import Button from "@/components/atoms/Button";
import AuthVideoBackground from "@/components/molecules/AuthVideoBackground";
import { useTranslation } from "@/i18n";
import { useAuth } from "@/contexts/AuthContext";
import { validateOTP, validateMobileNumber } from "@/utils/validation";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
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
  const { phoneNumber, mode } = useLocalSearchParams<{
    phoneNumber: string;
    mode?: string;
  }>();
  const { t } = useTranslation();
  const { signIn, resendOTP } = useAuth();
  const isLogin = mode === "login";

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
    const timer = setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 100);
    return () => clearTimeout(timer); // FIX: clean up focus timer to prevent memory leak
  }, []);

  const handleOtpChange = (value: string, index: number) => {
    if (value && !/^\d+$/.test(value)) return;

    const newOtp = [...otp];

    if (value.length > 1) {
      const digits = value.slice(0, OTP_LENGTH - index).split("");
      digits.forEach((digit, i) => {
        if (index + i < OTP_LENGTH) {
          newOtp[index + i] = digit;
        }
      });
      setOtp(newOtp);
      const nextIndex = Math.min(index + digits.length, OTP_LENGTH - 1);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    newOtp[index] = value;
    setOtp(newOtp);

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

    const otpValidation = validateOTP(otpString);
    if (!otpValidation.isValid) {
      setValidationError(otpValidation.errors[0]);
      Alert.alert(t("common.error") || "Error", otpValidation.errors[0]);
      return;
    }

    if (!phoneNumber) {
      const error = "Phone number not found. Please go back and try again.";
      setValidationError(error);
      Alert.alert(t("common.error") || "Error", error);
      return;
    }

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
      const { isNewUser: serverIsNewUser } = await signIn(phoneNumber, otpString, mode === "login");
      // If mode is 'login', bypass onboarding regardless of server response
      const isNewUser = mode === "login" ? false : serverIsNewUser;
      if (isNewUser) {
        router.replace("/(auth)/personal-details");
      } else {
        router.replace("/(tab)");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Invalid OTP";
      setValidationError(errorMessage);
      Alert.alert(t("common.error") || "Error", errorMessage);
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
      Alert.alert("✅ OTP Sent", "A new OTP has been sent to your number.");
    } catch (error) {
      Alert.alert("Error", error instanceof Error ? error.message : "Failed to resend OTP");
    }
  };

  const handleChangeNumber = () => {
    router.back();
  };

  const maskedPhone = phoneNumber
    ? `+91 ${phoneNumber.replace(/^\+91/, "").slice(0, 5)} *****`
    : "";

  const filledCount = otp.filter(Boolean).length;

  return (
    <KeyboardAvoidingView
      style={s.root}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Image Background */}
      <View className="h-[45vh]">
        <AuthVideoBackground />
      </View>

      {/* FIX: ScrollView should only control scroll behavior.
          Layout/visual styles (borderRadius, padding, shadow, alignItems)
          must live on a child View, not on ScrollView's style prop. */}
      <ScrollView
        bounces={false}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        style={s.scrollView}
        contentContainerStyle={s.scrollContent}
      >
        <View style={s.card}>
          {/* Icon + Title */}
          <View style={s.iconCircle}>
            <Ionicons name="shield-checkmark-outline" size={28} color="#386641" />
          </View>

          <AppText variant="h2" style={s.title}>
            {t("auth.enterOTP")}
          </AppText>

          <Text style={s.subtitle}>
            {t("auth.otpSentTo")}
          </Text>
          <Text style={s.phoneDisplay}>{maskedPhone}</Text>

          {/* OTP Input Fields */}
          <View style={s.otpRow}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => { inputRefs.current[index] = ref; }}
                style={[
                  s.otpBox,
                  digit ? s.otpBoxFilled : null,
                  validationError ? s.otpBoxError : null,
                ]}
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
          {validationError ? (
            <View style={s.errorRow}>
              <Ionicons name="alert-circle-outline" size={14} color="#EF4444" />
              <Text style={s.errorText}>{validationError}</Text>
            </View>
          ) : (
            <View style={{ marginBottom: 16 }} />
          )}

          {/* Verify Button */}
          <Button
            variant="primary"
            onPress={handleVerifyOTP}
            disabled={loading || filledCount !== OTP_LENGTH}
            style={s.verifyBtn}
          >
            {loading ? (
              <View style={s.loadingRow}>
                <ActivityIndicator color="white" size="small" />
                <Text style={[s.btnText, { marginLeft: 8 }]}>Verifying...</Text>
              </View>
            ) : (
              <Text style={s.btnText}>{t("auth.verifyOTP")}</Text>
            )}
          </Button>

          {/* Resend + Change Number */}
          <View style={s.footerRow}>
            {canResend ? (
              <TouchableOpacity onPress={handleResendOTP} style={s.footerBtn}>
                <Ionicons name="refresh-outline" size={14} color="#386641" />
                <Text style={s.resendLink}> {t("auth.resendOTP")}</Text>
              </TouchableOpacity>
            ) : (
              <Text style={s.resendTimer}>
                {t("auth.resendOtpIn")} {countdown}s
              </Text>
            )}

            <View style={s.dot} />

            <TouchableOpacity onPress={handleChangeNumber} style={s.footerBtn}>
              <Ionicons name="arrow-back-outline" size={14} color="#616161" />
              <Text style={s.changeNumber}> {t("auth.changeNumber")}</Text>
            </TouchableOpacity>
          </View>

          {/* Mode badge */}
          <View style={s.modeBadge}>
            <Ionicons
              name={isLogin ? "log-in-outline" : "person-add-outline"}
              size={12}
              color={isLogin ? "#2563EB" : "#7C3AED"}
            />
            <Text style={[s.modeBadgeText, { color: isLogin ? "#2563EB" : "#7C3AED" }]}>
              {isLogin ? "Logging in to existing account" : "Creating new account"}
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default OTPInput;

const s = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "#FFFFFF",
  },
  // FIX: ScrollView gets only flex/positional styles
  scrollView: {
    flex: 1,
    marginTop: -32,
  },
  // FIX: flexGrow + justifyContent ensure card sits at bottom when content is short
  scrollContent: {
    flexGrow: 1,
    justifyContent: "flex-end",
  },
  // FIX: visual/layout styles moved here, onto a real View
  card: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 28,
    paddingBottom: 40,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 12,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(56, 102, 65, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(56, 102, 65, 0.2)",
  },
  title: {
    textAlign: "center",
    color: "#111827",
    fontWeight: "700",
    fontSize: 24,
    marginBottom: 6,
  },
  subtitle: {
    textAlign: "center",
    color: "#6B7280",
    fontSize: 14,
    marginBottom: 2,
  },
  phoneDisplay: {
    textAlign: "center",
    color: "#111827",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 28,
    letterSpacing: 0.5,
  },
  // FIX: replaced `gap` with marginHorizontal on otpBox for broader RN compatibility
  otpRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 12,
  },
  otpBox: {
    width: 46,
    height: 56,
    borderWidth: 2,
    borderRadius: 14,
    textAlign: "center",
    fontSize: 22,
    fontWeight: "700",
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
    color: "#111827",
    marginHorizontal: 5, // FIX: replaces `gap: 10` on parent
  },
  otpBoxFilled: {
    borderColor: "#386641",
    backgroundColor: "rgba(56, 102, 65, 0.06)",
    color: "#386641",
  },
  otpBoxError: {
    borderColor: "#EF4444",
    backgroundColor: "rgba(239, 68, 68, 0.05)",
  },
  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  errorText: {
    color: "#EF4444",
    fontSize: 13,
    textAlign: "center",
    flex: 1,
    marginLeft: 4, // FIX: replaces `gap: 4` on parent
  },
  verifyBtn: {
    width: "100%",
    paddingVertical: 16,
    marginBottom: 20,
    borderRadius: 14,
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  btnText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 0.3,
  },
  // FIX: replaced `gap` with margins on children for broader RN compatibility
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  footerBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 6, // FIX: replaces `gap: 12` on parent
  },
  resendLink: {
    color: "#386641",
    fontWeight: "600",
    fontSize: 14,
  },
  resendTimer: {
    color: "#9CA3AF",
    fontSize: 13,
    marginHorizontal: 6, // FIX: consistent spacing alongside footerBtn margins
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#D1D5DB",
  },
  changeNumber: {
    color: "#6B7280",
    fontSize: 13,
  },
  modeBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
  },
  modeBadgeText: {
    fontSize: 11,
    fontWeight: "500",
    marginLeft: 5, // FIX: replaces `gap: 5` on parent
  },
});
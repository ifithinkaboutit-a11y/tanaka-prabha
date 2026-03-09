// src/app/(auth)/otp-input.tsx
import AppText from "@/components/atoms/AppText";
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
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
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
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const router = useRouter();
  const { phoneNumber, mode } = useLocalSearchParams<{ phoneNumber: string; mode?: string }>();
  const { t } = useTranslation();
  const { signIn, resendOTP } = useAuth();
  const isLogin = mode === "login";

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
    setCanResend(true);
  }, [countdown]);

  // Auto-focus first box
  useEffect(() => {
    const timer = setTimeout(() => inputRefs.current[0]?.focus(), 150);
    return () => clearTimeout(timer);
  }, []);

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 7, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -7, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 45, useNativeDriver: true }),
    ]).start();
  };

  const handleOtpChange = (value: string, index: number) => {
    if (value && !/^\d+$/.test(value)) return;
    const newOtp = [...otp];

    if (value.length > 1) {
      // Paste handling
      const digits = value.slice(0, OTP_LENGTH - index).split("");
      digits.forEach((digit, i) => {
        if (index + i < OTP_LENGTH) newOtp[index + i] = digit;
      });
      setOtp(newOtp);
      const nextIndex = Math.min(index + digits.length, OTP_LENGTH - 1);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    newOtp[index] = value;
    setOtp(newOtp);
    if (validationError) setValidationError(null);
    if (value && index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus();
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
      shake();
      Alert.alert(t("common.error") || "Error", otpValidation.errors[0]);
      return;
    }

    if (!phoneNumber) {
      const error = "Phone number not found. Please go back and try again.";
      setValidationError(error);
      shake();
      Alert.alert(t("common.error") || "Error", error);
      return;
    }

    const cleanedNumber = phoneNumber.replace(/^\+91/, "");
    const phoneValidation = validateMobileNumber(cleanedNumber);
    if (!phoneValidation.isValid) {
      setValidationError(phoneValidation.errors[0]);
      shake();
      Alert.alert(t("common.error") || "Error", phoneValidation.errors[0]);
      return;
    }

    setValidationError(null);
    setLoading(true);
    try {
      const { isNewUser: serverIsNewUser } = await signIn(phoneNumber, otpString, mode === "login");
      const isNewUser = mode === "login" ? false : serverIsNewUser;

      if (mode === "forgot-password") {
        // Go to set-password in reset mode
        router.replace({
          pathname: "/(auth)/set-password" as any,
          params: { phoneNumber, mode: "reset" },
        });
      } else if (isNewUser) {
        // New signup → set password first, then onboard
        router.replace({
          pathname: "/(auth)/set-password" as any,
          params: { phoneNumber, mode: "signup" },
        });
      } else {
        router.replace("/(tab)");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Invalid OTP";
      setValidationError(errorMessage);
      shake();
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

  // "98765 *****"
  const maskedPhone = phoneNumber
    ? `+91 ${phoneNumber.replace(/^\+91/, "").slice(0, 5)} *****`
    : "";

  const filledCount = otp.filter(Boolean).length;
  const isComplete = filledCount === OTP_LENGTH;

  return (
    <KeyboardAvoidingView
      style={s.root}
      behavior={Platform.OS === "ios" ? "padding" : "padding"}
      keyboardVerticalOffset={0}
    >
      <StatusBar translucent barStyle="light-content" backgroundColor="transparent" />
      <ScrollView
        bounces={false}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        {/* Video — same height as phone-input */}
        <View className="h-[52vh]">
          <AuthVideoBackground />
        </View>

        {/* Card — mirrors phone-input card exactly */}
        <View style={s.card}>
          {/* Title — same as cardLabel in phone-input */}
          <AppText variant="h2" style={s.cardLabel}>
            {t("auth.enterOTP") || "Verify Number"}
          </AppText>

          {/* Subtitle — same videoSubtitle style */}
          <Text style={s.videoSubtitle}>
            {t("auth.otpSentTo") || "OTP sent to"}{" "}
            <Text style={s.phoneHighlight}>{maskedPhone}</Text>
          </Text>

          {/* Input label — same as phone-input */}
          <Text style={s.inputLabel}>Enter 6-digit OTP</Text>

          {/* OTP boxes — animated, shake on error */}
          <Animated.View
            style={[s.otpRow, { transform: [{ translateX: shakeAnim }] }]}
          >
            {otp.map((digit, index) => (
              <View
                key={index}
                style={[
                  s.otpBoxOuter,
                  digit ? s.otpBoxOuterFilled : null,
                  validationError ? s.otpBoxOuterError : null,
                ]}
              >
                <TextInput
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
                  maxLength={OTP_LENGTH}
                  selectTextOnFocus
                  editable={!loading}
                />
              </View>
            ))}
          </Animated.View>

          {/* Helper / error — mirrors phone-input helperRow */}
          <View style={s.helperRow}>
            {validationError ? (
              <View style={s.errorRow}>
                <Ionicons name="alert-circle-outline" size={13} color="#EF4444" />
                <Text style={s.errorText}>{validationError}</Text>
              </View>
            ) : (
              <Text style={s.charCount}>
                {filledCount}/{OTP_LENGTH} digits entered
                {!canResend && (
                  <Text style={s.countdownInline}>{`  ·  Expires in ${countdown}s`}</Text>
                )}
              </Text>
            )}
          </View>

          {/* Verify CTA — same as phone-input ctaBtn */}
          <Pressable
            onPress={handleVerifyOTP}
            disabled={!isComplete || loading}
            style={[
              s.ctaBtn,
              (!isComplete || loading) && s.ctaBtnDisabled,
            ]}
          >
            {loading ? (
              <View style={s.loadingRow}>
                <ActivityIndicator color="white" size="small" />
                <Text style={[s.ctaText, { marginLeft: 8 }]}>Verifying…</Text>
              </View>
            ) : (
              <View style={s.loadingRow}>
                <Text style={s.ctaText}>{t("auth.verifyOTP") || "Verify OTP"}</Text>
                <Ionicons name="arrow-forward" size={18} color="#fff" style={{ marginLeft: 6 }} />
              </View>
            )}
          </Pressable>

          {/* Resend + Change number — mirrors switchRow */}
          <View style={s.footerRow}>
            {canResend ? (
              <TouchableOpacity
                onPress={handleResendOTP}
                style={s.footerBtn}
                activeOpacity={0.65}
              >
                <Ionicons name="refresh-outline" size={14} color="#386641" />
                <Text style={s.switchLink}>{" "}{t("auth.resendOTP") || "Resend OTP"}</Text>
              </TouchableOpacity>
            ) : (
              <Text style={s.charCount}>
                Resend in <Text style={s.countdownInline}>{countdown}s</Text>
              </Text>
            )}

            <View style={s.footerDot} />

            <TouchableOpacity
              onPress={() => router.back()}
              style={s.footerBtn}
              activeOpacity={0.65}
            >
              <Ionicons name="arrow-back-outline" size={14} color="#6B7280" />
              <Text style={s.switchText}>{" "}{t("auth.changeNumber") || "Change Number"}</Text>
            </TouchableOpacity>
          </View>

          {/* Security note — mirrors phone-input securityRow */}
          <View style={s.securityRow}>
            <Ionicons name="lock-closed-outline" size={12} color="#9CA3AF" />
            <Text style={s.securityText}>OTP is valid for 10 minutes only</Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default OTPInput;

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fff" },

  // ── Card — identical to phone-input ──
  card: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -32,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: Platform.OS === "ios" ? 48 : 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 16,
  },

  // ── Typography — identical to phone-input ──
  cardLabel: {
    color: "#374151",
    fontSize: 22,
    fontWeight: "900",
    marginBottom: 2,
    letterSpacing: 0.1,
    textTransform: "uppercase",
  },
  videoSubtitle: {
    color: "#6B7280",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  phoneHighlight: {
    color: "#386641",
    fontWeight: "700",
  },
  inputLabel: {
    color: "#374151",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 10,
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },

  // ── OTP boxes ──
  otpRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 10,
  },
  otpBoxOuter: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    overflow: "hidden",
  },
  otpBoxOuterFilled: { borderColor: "#386641" },
  otpBoxOuterError: { borderColor: "#EF4444" },
  otpBox: {
    height: 58,
    textAlign: "center",
    fontSize: 22,
    fontWeight: "700",
    backgroundColor: "#F9FAFB",
    color: "#111827",
  },
  otpBoxFilled: {
    backgroundColor: "rgba(56,102,65,0.07)",
    color: "#386641",
  },
  otpBoxError: {
    backgroundColor: "rgba(239,68,68,0.05)",
    color: "#EF4444",
  },

  // ── Progress bar ──
  progressTrack: {
    width: "100%",
    height: 3,
    backgroundColor: "#F3F4F6",
    borderRadius: 2,
    marginBottom: 8,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },

  // ── Helper — identical to phone-input ──
  helperRow: { minHeight: 22, marginTop: 0, marginBottom: 18 },
  errorRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  errorText: { color: "#EF4444", fontSize: 13, flex: 1 },
  charCount: { color: "#9CA3AF", fontSize: 12 },
  countdownInline: { color: "#386641", fontWeight: "600" },

  // ── CTA button — identical to phone-input ──
  ctaBtn: {
    width: "100%",
    backgroundColor: "#386641",
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 18,
    shadowColor: "#386641",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  ctaBtnDisabled: {
    backgroundColor: "#D1D5DB",
    shadowOpacity: 0,
    elevation: 0,
  },
  loadingRow: { flexDirection: "row", alignItems: "center", justifyContent: "center" },
  ctaText: { color: "#fff", fontWeight: "700", fontSize: 16, letterSpacing: 0.3 },

  // ── Footer — mirrors phone-input switchRow ──
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    gap: 10,
  },
  footerBtn: { flexDirection: "row", alignItems: "center" },
  footerDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: "#D1D5DB" },
  switchLink: { color: "#386641", fontWeight: "700", fontSize: 14 },
  switchText: { color: "#6B7280", fontSize: 13 },

  // ── Security — identical to phone-input ──
  securityRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
  securityText: { color: "#9CA3AF", fontSize: 11 },
});
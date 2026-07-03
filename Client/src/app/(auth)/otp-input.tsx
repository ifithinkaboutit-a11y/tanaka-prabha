// src/app/(auth)/otp-input.tsx
import AppText from "@/components/atoms/AppText";
import { useTranslation } from "@/i18n";
import { useAuth } from "@/contexts/AuthContext";
import { authApi } from "@/services/apiService";
import { validateOTP, validateMobileNumber } from "@/utils/validation";
import { translateKnownError } from "@/utils/translatedErrors";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import KeyboardAwareScrollView from "@/components/atoms/KeyboardAwareScrollView";
import { theme } from "@/styles/colors";

const OTP_LENGTH = 6;

// Google Play review account — the backend accepts this fixed OTP for this
// number only, so it is shown on screen for the Play Store reviewer.
const GOOGLE_PLAY_REVIEW_PHONE = "9999999999";
const GOOGLE_PLAY_REVIEW_OTP = "123456";

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
  const isPasswordSetup = mode === "password-setup";

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
      const message = translateKnownError(otpValidation.errors[0], t) || otpValidation.errors[0];
      setValidationError(message);
      shake();
      Alert.alert(t("common.error") || "Error", message);
      return;
    }

    if (!phoneNumber) {
      const error = t("auth.phoneNotFound");
      setValidationError(error);
      shake();
      Alert.alert(t("common.error") || "Error", error);
      return;
    }

    const cleanedNumber = phoneNumber.replace(/^\+91/, "");
    const phoneValidation = validateMobileNumber(cleanedNumber);
    if (!phoneValidation.isValid) {
      const message = translateKnownError(phoneValidation.errors[0], t) || phoneValidation.errors[0];
      setValidationError(message);
      shake();
      Alert.alert(t("common.error") || "Error", message);
      return;
    }

    setValidationError(null);
    setLoading(true);
    try {
      if (mode === "forgot-password") {
        // Verify OTP without storing a session token
        const cleanedNumber = phoneNumber.replace(/^\+91/, "");
        const response = await authApi.verifyOtpOnly(cleanedNumber, otpString);
        if (response.status !== "success") {
          throw new Error(response.message || t("auth.invalidOtp"));
        }
        router.replace({
          pathname: "/(auth)/set-password" as any,
          params: { phoneNumber, mode: "reset" },
        });
        return;
      }

      const { isNewUser: serverIsNewUser } = await signIn(phoneNumber, otpString, mode === "login");
      const isNewUser = mode === "login" ? false : serverIsNewUser;

      if (isNewUser || isPasswordSetup) {
        // New signup or password bootstrap: set password before continuing.
        router.replace({
          pathname: "/(auth)/set-password" as any,
          params: { phoneNumber, mode: isNewUser ? "signup" : "setup" },
        });
      } else {
        router.replace("/(tab)");
      }
    } catch (error) {
      const errorMessage = error instanceof Error
        ? translateKnownError(error.message, t) || error.message
        : t("auth.invalidOtp");
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
      Alert.alert(t("common.error"), t("auth.phoneNotFoundShort"));
      return;
    }
    try {
      await resendOTP(phoneNumber);
      setCountdown(30);
      setCanResend(false);
      setOtp(Array(OTP_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
      Alert.alert(t("auth.otpSentTitle"), t("auth.otpSentMessage"));
    } catch (error) {
      Alert.alert(
        t("common.error"),
        error instanceof Error
          ? translateKnownError(error.message, t) || error.message
          : t("auth.resendOtpFailed")
      );
    }
  };

  // "98765 *****"
  const maskedPhone = phoneNumber
    ? `+91 ${phoneNumber.replace(/^\+91/, "").slice(0, 5)} *****`
    : "";

  const filledCount = otp.filter(Boolean).length;
  const isComplete = filledCount === OTP_LENGTH;

  const isReviewPhone =
    (phoneNumber ?? "").replace(/\D/g, "").slice(-10) === GOOGLE_PLAY_REVIEW_PHONE;

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={theme.primary.green} />
      {/* Static Header */}
      <View style={s.header}>
        <AppText variant="h2" style={s.headerTitle}>
          {t("auth.enterOTP") || "Verify Number"}
        </AppText>
        <Text style={s.headerSubtitle}>
          {t("auth.otpSentTo") || "OTP sent to"}{" "}
          <Text style={s.headerPhoneHighlight}>{maskedPhone}</Text>
        </Text>
      </View>
      <KeyboardAwareScrollView
        bounces={false}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        {/* Card */}
        <View style={s.card}>
          {/* Google Play review account only — never rendered for real users */}
          {isReviewPhone && (
            <View style={s.reviewBox}>
              <Ionicons name="information-circle-outline" size={16} color="#DC2626" />
              <Text style={s.reviewBoxText}>
                Google Play Review Mode{"\n"}Use OTP: {GOOGLE_PLAY_REVIEW_OTP}
              </Text>
            </View>
          )}

          {/* Input label */}
          <Text style={s.inputLabel}>{t("auth.otpInputLabel")}</Text>

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
                {t("auth.digitsEntered", { count: filledCount, total: OTP_LENGTH })}
                {!canResend && (
                  <Text style={s.countdownInline}>{t("auth.otpExpiresIn", { seconds: countdown })}</Text>
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
                <Text style={[s.ctaText, { marginLeft: 8 }]}>{t("auth.verifying")}</Text>
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
                <Ionicons name="refresh-outline" size={14} color={theme.primary.green} />
                <Text style={s.switchLink}>{" "}{t("auth.resendOTP") || "Resend OTP"}</Text>
              </TouchableOpacity>
            ) : (
              <Text style={s.charCount}>
                {t("auth.resendIn", { seconds: countdown })}
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
            <Text style={s.securityText}>{t("auth.otpValidityNote")}</Text>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
};

export default OTPInput;

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.background.input },

  // ── Static Header ──
  header: {
    backgroundColor: theme.primary.green,
    paddingTop: 60,
    paddingBottom: 32,
    paddingHorizontal: 24,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "900",
    letterSpacing: -0.5,
    marginBottom: 6,
    textTransform: "uppercase",
  },
  headerSubtitle: {
    color: "rgba(255,255,255,0.82)",
    fontSize: 14,
    lineHeight: 20,
  },
  headerPhoneHighlight: {
    color: "#fff",
    fontWeight: "700",
  },

  // ── Card ──
  card: {
    flex: 1,
    backgroundColor: theme.background.input,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: Platform.OS === "ios" ? 48 : 32,
  },
  // ── Google Play review box ──
  reviewBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(239,68,68,0.08)",
    borderWidth: 1.5,
    borderColor: "#DC2626",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 18,
  },
  reviewBoxText: {
    color: "#DC2626",
    fontSize: 13,
    fontWeight: "700",
    flex: 1,
    lineHeight: 18,
  },

  inputLabel: {
    color: theme.text.subtle,
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
    borderColor: theme.border.subtle,
    overflow: "hidden",
  },
  otpBoxOuterFilled: { borderColor: theme.primary.green },
  otpBoxOuterError: { borderColor: theme.semantic.errorLight },
  otpBox: {
    height: 58,
    textAlign: "center",
    fontSize: 22,
    fontWeight: "700",
    backgroundColor: theme.background.neutralSubtle,
    color: theme.text.primary,
  },
  otpBoxFilled: {
    backgroundColor: "rgba(56,102,65,0.07)",
    color: theme.primary.green,
  },
  otpBoxError: {
    backgroundColor: "rgba(239,68,68,0.05)",
    color: theme.semantic.errorLight,
  },

  // ── Progress bar ──
  progressTrack: {
    width: "100%",
    height: 3,
    backgroundColor: theme.background.screen,
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
  errorText: { color: theme.semantic.errorLight, fontSize: 13, flex: 1 },
  charCount: { color: theme.text.placeholder, fontSize: 12 },
  countdownInline: { color: theme.primary.green, fontWeight: "600" },

  // ── CTA button — identical to phone-input ──
  ctaBtn: {
    width: "100%",
    backgroundColor: theme.primary.green,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 18,
    shadowColor: theme.primary.green,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  ctaBtnDisabled: {
    backgroundColor: theme.border.card,
    shadowOpacity: 0,
    elevation: 0,
  },
  loadingRow: { flexDirection: "row", alignItems: "center", justifyContent: "center" },
  ctaText: { color: theme.text.onPrimary, fontWeight: "700", fontSize: 16, letterSpacing: 0.3 },

  // ── Footer — mirrors phone-input switchRow ──
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    gap: 10,
  },
  footerBtn: { flexDirection: "row", alignItems: "center" },
  footerDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: theme.border.card },
  switchLink: { color: theme.primary.green, fontWeight: "700", fontSize: 14 },
  switchText: { color: theme.text.muted, fontSize: 13 },

  // ── Security — identical to phone-input ──
  securityRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
  securityText: { color: theme.text.placeholder, fontSize: 11 },
});

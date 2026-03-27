// src/app/(auth)/phone-input.tsx
import AppText from "@/components/atoms/AppText";
import { useTranslation } from "@/i18n";
import { useAuth } from "@/contexts/AuthContext";
import { validateMobileNumber } from "@/utils/validation";
import { authApi, tokenManager } from "@/services/apiService";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useState, useRef } from "react";
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

const PhoneInput = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [duplicateBanner, setDuplicateBanner] = useState(false);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const router = useRouter();
  const { t } = useTranslation();
  const { sendOTP, signIn, refreshUser } = useAuth();
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const isLogin = mode === "login";

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 5, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -5, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const formatPhoneNumber = (text: string) => text.replace(/\D/g, "").slice(0, 10);

  const handlePhoneChange = (text: string) => {
    setPhoneNumber(formatPhoneNumber(text));
    if (validationError) setValidationError(null);
    if (duplicateBanner) setDuplicateBanner(false);
  };

  const isDuplicatePhoneError = (error: unknown): boolean => {
    if (!(error instanceof Error)) return false;
    const msg = error.message.toLowerCase();
    return (
      msg.includes("already registered") ||
      msg.includes("duplicate") ||
      msg.includes("already exists") ||
      msg.includes("phone number is taken") ||
      msg.includes("user already exists")
    );
  };

  const handleSendOTP = async () => {
    const validation = validateMobileNumber(phoneNumber);
    if (!validation.isValid) {
      setValidationError(validation.errors[0]);
      shake();
      Alert.alert(t("common.error") || "Error", validation.errors[0]);
      return;
    }

    setLoading(true);
    try {
      const fullPhoneNumber = `+91${phoneNumber}`;
      await sendOTP(fullPhoneNumber);
      router.push({
        pathname: "/(auth)/otp-input",
        params: { phoneNumber: fullPhoneNumber, mode: mode || "signup" },
      });
    } catch (error) {
      if (isDuplicatePhoneError(error)) {
        setDuplicateBanner(true);
      } else {
        Alert.alert("Error", error instanceof Error ? error.message : "Failed to send OTP");
      }
    } finally {
      setLoading(false);
    }
  };

  // Login with password (no OTP needed)
  const handleLoginWithPassword = async () => {
    const validation = validateMobileNumber(phoneNumber);
    if (!validation.isValid) {
      setValidationError(validation.errors[0]);
      shake();
      return;
    }
    if (!password) {
      setValidationError("Please enter your password");
      shake();
      return;
    }
    setValidationError(null);
    setLoading(true);
    try {
      const fullPhoneNumber = `+91${phoneNumber}`;
      const response = await authApi.loginWithPassword(fullPhoneNumber, password);
      if (response.data) {
        // Persist auth data to AsyncStorage
        await tokenManager.setToken(response.data.token);
        await tokenManager.setUser(response.data.user as any);
        // Sync AuthContext state so the navigation guard fires correctly
        await refreshUser();
        // Navigate based on user type
        if (response.data.is_new_user) {
          router.replace("/(auth)/personal-details" as any);
        } else {
          router.replace("/(tab)/" as any);
        }
      }
    } catch (e: any) {
      if (e?.data?.needs_password_setup) {
        Alert.alert(
          "No Password Set",
          "This account doesn't have a password yet. We'll send you an OTP to log in and set one.",
          [
            { text: "Send OTP", onPress: () => handleSendOTP() },
            { text: "Cancel", style: "cancel" },
          ]
        );
      } else {
        setValidationError(e.message || "Invalid phone number or password");
        shake();
      }
    } finally {
      setLoading(false);
    }
  };

  // Forgot password — send OTP then go to set-password screen
  const handleForgotPassword = async () => {
    const validation = validateMobileNumber(phoneNumber);
    if (!validation.isValid) {
      setValidationError("Please enter your 10-digit mobile number first.");
      shake();
      return;
    }
    setLoading(true);
    try {
      const fullPhoneNumber = `+91${phoneNumber}`;
      await authApi.forgotPassword(fullPhoneNumber);
      router.push({
        pathname: "/(auth)/otp-input" as any,
        params: { phoneNumber: fullPhoneNumber, mode: "forgot-password" },
      });
    } catch (e: any) {
      setValidationError(e.message || "Failed to send OTP. Please try again.");
      shake();
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchMode = () => {
    if (isLogin) {
      router.replace({ pathname: "/(auth)/phone-input", params: { mode: "signup" } } as any);
    } else {
      router.replace({ pathname: "/(auth)/phone-input", params: { mode: "login" } } as any);
    }
  };

  // isReady depends on mode
  const isReady = isLogin
    ? phoneNumber.length === 10 && password.length >= 6 && !loading
    : phoneNumber.length === 10 && !loading;

  // Format display: "98765 43210"
  const displayPhone = phoneNumber.length > 5
    ? `${phoneNumber.slice(0, 5)} ${phoneNumber.slice(5)}`
    : phoneNumber;

  return (
    <KeyboardAvoidingView
      style={s.root}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar barStyle="light-content" backgroundColor="#386641" />
      {/* Static Header */}
      <View style={s.header}>
        <AppText variant="h2" style={s.headerTitle}>
          {isLogin ? (t("auth.loginTitle") || "Welcome Back") : (t("auth.enterPhone") || "Get Started")}
        </AppText>
        <Text style={s.headerSubtitle}>
          {isLogin
            ? (t("auth.loginSubtitle") || "Enter your registered mobile number")
            : (t("auth.phoneSubtitle") || "We'll send an OTP to verify your number")}
        </Text>
      </View>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        bounces={false}
        showsVerticalScrollIndicator={false}
      >
        {/* Card */}
        <View style={s.card}>
          {/* Label */}
          <Text style={s.inputLabel}>{t("auth.mobileNumber") || "Mobile Number"}</Text>

          {/* Phone Row */}
          <Animated.View
            style={[
              s.inputRow,
              isFocused && s.inputRowFocused,
              validationError ? s.inputRowError : null,
              { transform: [{ translateX: shakeAnim }] },
            ]}
          >
            <View style={s.countryCode}>
              <Text style={s.flag}>🇮🇳</Text>
              <Text style={s.countryCodeText}>+91</Text>
            </View>
            <View style={s.divider} />
            <TextInput
              style={s.phoneInput}
              placeholder="00000 00000"
              placeholderTextColor="#C4C9D4"
              keyboardType="phone-pad"
              value={displayPhone}
              onChangeText={handlePhoneChange}
              maxLength={11} // 10 digits + 1 space
              editable={!loading}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
            />
            {phoneNumber.length === 10 && (
              <Ionicons name="checkmark-circle" size={22} color="#386641" style={s.checkIcon} />
            )}
            {validationError && (
              <Ionicons name="alert-circle" size={22} color="#EF4444" style={s.checkIcon} />
            )}
          </Animated.View>

          {/* Helper / error */}
          <View style={s.helperRow}>
            {validationError ? (
              <View style={s.errorRow}>
                <Ionicons name="alert-circle-outline" size={13} color="#EF4444" />
                <Text style={s.errorText}>{validationError}</Text>
              </View>
            ) : (
              <Text style={s.charCount}>
                {phoneNumber.length}/10 digits entered
              </Text>
            )}
          </View>

          {/* Duplicate phone inline banner — Requirement 4.1 */}
          {duplicateBanner && (
            <View style={s.duplicateBanner}>
              <View style={s.duplicateBannerContent}>
                <Ionicons name="warning-outline" size={18} color="#92400E" style={{ marginTop: 1 }} />
                <Text style={s.duplicateBannerText}>
                  This number is already registered. Please log in instead.
                </Text>
              </View>
              <View style={s.duplicateBannerActions}>
                <TouchableOpacity
                  onPress={() => router.replace("/(auth)/phone-input?mode=login" as any)}
                  style={s.duplicateBannerLogIn}
                  activeOpacity={0.75}
                >
                  <Text style={s.duplicateBannerLogInText}>Log In</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setDuplicateBanner(false)}
                  style={s.duplicateBannerDismiss}
                  activeOpacity={0.75}
                >
                  <Text style={s.duplicateBannerDismissText}>Dismiss</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Password field — only shown in login mode */}
          {isLogin && (
            <>
              <Text style={[s.inputLabel, { marginTop: 4 }]}>PASSWORD</Text>
              <View style={[s.inputRow, { marginBottom: 4 }]}>
                <TextInput
                  style={[s.phoneInput, { flex: 1 }]}
                  placeholder="Enter your password"
                  placeholderTextColor="#C4C9D4"
                  value={password}
                  onChangeText={(v) => { setPassword(v); setValidationError(null); }}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  returnKeyType="done"
                  onSubmitEditing={handleLoginWithPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword((p) => !p)} style={{ paddingHorizontal: 12 }}>
                  <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#6B7280" />
                </TouchableOpacity>
              </View>
              {/* Forgot Password Link */}
              <TouchableOpacity
                onPress={handleForgotPassword}
                style={{ alignSelf: "flex-end", marginBottom: 16, marginTop: 4 }}
                activeOpacity={0.65}
              >
                <Text style={[s.switchLink, { fontSize: 13 }]}>Forgot Password?</Text>
              </TouchableOpacity>
            </>
          )}

          <Pressable
            onPress={isLogin ? handleLoginWithPassword : handleSendOTP}
            disabled={!isReady}
            style={[
              s.ctaBtn,
              !isReady && s.ctaBtnDisabled,
            ]}
          >
            {loading ? (
              <View style={s.loadingRow}>
                <ActivityIndicator color="white" size="small" />
                <Text style={[s.ctaText, { marginLeft: 8 }]}>
                  {isLogin ? "Logging in…" : "Sending OTP…"}
                </Text>
              </View>
            ) : (
              <View style={s.loadingRow}>
                <Text style={s.ctaText}>
                  {isLogin ? (t("auth.login") || "Log In") : (t("auth.getOtp") || "Send OTP")}
                </Text>
                <Ionicons name="arrow-forward" size={18} color="#fff" style={{ marginLeft: 6 }} />
              </View>
            )}
          </Pressable>

          {/* Switch mode */}
          <TouchableOpacity onPress={handleSwitchMode} style={s.switchRow} activeOpacity={0.65}>
            <Text style={s.switchText}>
              {isLogin
                ? (t("auth.noAccount") || "Don't have an account? ")
                : (t("auth.alreadyRegistered") || "Already have an account? ")}
              <Text style={s.switchLink}>
                {isLogin ? (t("auth.signUp") || "Sign Up") : (t("auth.login") || "Log In")}
              </Text>
            </Text>
          </TouchableOpacity>

          {/* Security note */}
          <View style={s.securityRow}>
            <Ionicons name="lock-closed-outline" size={12} color="#9CA3AF" />
            <Text style={s.securityText}>Your number is encrypted and never shared</Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default PhoneInput;

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fff" },
  header: {
    backgroundColor: "#386641",
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
  videoContainer: {
    position: "relative",
    justifyContent: "flex-end",
  },
  modeBadge: {
    position: "absolute",
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  modeBadgeLogin: { backgroundColor: "rgba(239,246,255,0.95)" },
  modeBadgeSignup: { backgroundColor: "rgba(245,243,255,0.95)" },
  modeBadgeText: { fontSize: 12, fontWeight: "700" },
  videoTextBlock: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  videoTitle: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 28,
    letterSpacing: -0.5,
    marginBottom: 4,
  },

  // ── Card ──
  card: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: Platform.OS === "ios" ? 48 : 32,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E5E7EB",
    alignSelf: "center",
    marginBottom: 24,
  },
  inputLabel: {
    color: "#374151",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 10,
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  cardLabel: {
    color: "#374151",
    fontSize: 22,
    fontWeight: "900",
    marginBottom: 2,
    letterSpacing: 0.1,
    textTransform: "uppercase",
  },

  // ── Phone input ──
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: 16,
    backgroundColor: "#F9FAFB",
    borderColor: "#E5E7EB",
    overflow: "hidden",
  },
  inputRowFocused: {
    borderColor: "#386641",
    backgroundColor: "#fff",
    shadowColor: "#386641",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  inputRowError: { borderColor: "#EF4444" },
  countryCode: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 18,
    gap: 6,
    backgroundColor: "#F3F4F6",
  },
  flag: { fontSize: 20 },
  divider: { width: 1, height: 26, backgroundColor: "#E5E7EB" },
  countryCodeText: { color: "#374151", fontWeight: "700", fontSize: 15 },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 18,
    fontSize: 20,
    color: "#111827",
    letterSpacing: 2,
    fontWeight: "600",
  },
  checkIcon: { paddingRight: 14 },

  // ── Helper ──
  helperRow: { minHeight: 22, marginTop: 8, marginBottom: 4 },
  errorRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  errorText: { color: "#EF4444", fontSize: 13, flex: 1 },
  charCount: { color: "#9CA3AF", fontSize: 12 },

  // ── CTA button ──
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

  // ── Switch / footer ──
  switchRow: { alignItems: "center", marginBottom: 16 },
  switchText: { textAlign: "center", color: "#6B7280", fontSize: 14 },
  switchLink: { color: "#386641", fontWeight: "700" },
  securityRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
  securityText: { color: "#9CA3AF", fontSize: 11 },

  // ── Duplicate phone banner ──
  duplicateBanner: {
    backgroundColor: "#FEF3C7",
    borderWidth: 1,
    borderColor: "#FDE68A",
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  duplicateBannerContent: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 10,
  },
  duplicateBannerText: {
    flex: 1,
    color: "#92400E",
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
  },
  duplicateBannerActions: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "flex-end",
  },
  duplicateBannerLogIn: {
    backgroundColor: "#D97706",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  duplicateBannerLogInText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },
  duplicateBannerDismiss: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D97706",
  },
  duplicateBannerDismissText: {
    color: "#92400E",
    fontWeight: "600",
    fontSize: 13,
  },
});
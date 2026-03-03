// src/app/(auth)/phone-input.tsx
import AppText from "@/components/atoms/AppText";
import Button from "@/components/atoms/Button";
import AuthVideoBackground from "@/components/molecules/AuthVideoBackground";
import { useTranslation } from "@/i18n";
import { useAuth } from "@/contexts/AuthContext";
import { validateMobileNumber } from "@/utils/validation";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
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

const PhoneInput = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const router = useRouter();
  const { t } = useTranslation();
  const { sendOTP } = useAuth();
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const isLogin = mode === "login";

  const formatPhoneNumber = (text: string) => {
    const cleaned = text.replace(/\D/g, "");
    return cleaned.slice(0, 10);
  };

  const handlePhoneChange = (text: string) => {
    const formatted = formatPhoneNumber(text);
    setPhoneNumber(formatted);
    if (validationError) {
      setValidationError(null);
    }
  };

  const handleSendOTP = async () => {
    const validation = validateMobileNumber(phoneNumber);
    if (!validation.isValid) {
      setValidationError(validation.errors[0]);
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
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to send OTP",
      );
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

  const isReady = phoneNumber.length === 10 && !loading;

  return (
    <KeyboardAvoidingView
      style={s.root}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled" bounces={false}>
        {/* Image Background fills top, card overlaps it  */}
        <View style={s.videoBg}>
          <AuthVideoBackground />
        </View>

        {/* Input Card — negative marginTop pulls it over the image so no gap shows */}
        <View style={s.card}>
          {/* Mode indicator chip */}
          <View style={[s.modeChip, isLogin ? s.modeChipLogin : s.modeChipSignup]}>
            <Ionicons
              name={isLogin ? "log-in-outline" : "person-add-outline"}
              size={13}
              color={isLogin ? "#1D4ED8" : "#7C3AED"}
            />
            <Text style={[s.modeChipText, { color: isLogin ? "#1D4ED8" : "#7C3AED" }]}>
              {isLogin ? "Log In" : "Create Account"}
            </Text>
          </View>

          {/* Title */}
          <AppText variant="h2" style={s.title}>
            {isLogin
              ? (t("auth.loginTitle") || "Welcome Back")
              : (t("auth.enterPhone") || "Get Started")}
          </AppText>

          {/* Subtitle */}
          <Text style={s.subtitle}>
            {isLogin
              ? (t("auth.loginSubtitle") || "Enter your registered mobile number to log in")
              : (t("auth.phoneSubtitle") || "We'll send an OTP to verify your number")}
          </Text>

          {/* Phone Input */}
          <Text style={s.inputLabel}>{t("auth.mobileNumber")}</Text>
          <View style={[s.inputRow, isFocused && s.inputRowFocused, validationError ? s.inputRowError : null]}>
            <View style={s.countryCode}>
              <Text style={s.flag}>🇮🇳</Text>
              <Text style={s.countryCodeText}>+91</Text>
            </View>
            <View style={s.divider} />
            <TextInput
              style={s.phoneInput}
              placeholder="Enter 10-digit number"
              placeholderTextColor="#9CA3AF"
              keyboardType="phone-pad"
              value={phoneNumber}
              onChangeText={handlePhoneChange}
              maxLength={10}
              editable={!loading}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
            />
            {phoneNumber.length === 10 && (
              <View style={s.checkIcon}>
                <Ionicons name="checkmark-circle" size={20} color="#386641" />
              </View>
            )}
          </View>

          {/* Character counter */}
          <View style={s.helperRow}>
            {validationError ? (
              <View style={s.errorRow}>
                <Ionicons name="alert-circle-outline" size={13} color="#EF4444" />
                <Text style={s.errorText}>{validationError}</Text>
              </View>
            ) : (
              <Text style={s.charCount}>{phoneNumber.length}/10 digits</Text>
            )}
          </View>

          {/* Get OTP Button */}
          <Button
            variant="primary"
            onPress={handleSendOTP}
            disabled={!isReady}
            style={s.otpBtn}
          >
            {loading ? (
              <View style={s.loadingRow}>
                <ActivityIndicator color="white" size="small" />
                <Text style={[s.btnText, { marginLeft: 8 }]}>Sending OTP...</Text>
              </View>
            ) : (
              <View style={s.btnRow}>
                <Text style={s.btnText}>{t("auth.getOtp")}</Text>
                <Ionicons name="arrow-forward" size={18} color="#FFFFFF" style={{ marginLeft: 6 }} />
              </View>
            )}
          </Button>

          {/* Switch mode */}
          <TouchableOpacity onPress={handleSwitchMode} style={s.switchRow}>
            <Text style={s.switchText}>
              {isLogin
                ? (t("auth.noAccount") || "Don't have an account? ")
                : (t("auth.alreadyRegistered") || "Already have an account? ")}
              <Text style={s.switchLink}>
                {isLogin
                  ? (t("auth.signUp") || "Sign Up")
                  : (t("auth.login") || "Log In")}
              </Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default PhoneInput;

const s = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "#FFFFFF",
  },
  videoBg: {
    // Give the image section a defined height; card overlaps via negative marginTop
    height: 600,
  },
  card: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 28,
    paddingBottom: 40,
    marginTop: -32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 12,
    alignItems: "center",
  },
  modeChip: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 16,
  },
  modeChipLogin: {
    backgroundColor: "#EFF6FF",
  },
  modeChipSignup: {
    backgroundColor: "#F5F3FF",
  },
  modeChipText: {
    fontSize: 12,
    fontWeight: "600",
  },
  title: {
    textAlign: "center",
    color: "#111827",
    fontWeight: "700",
    fontSize: 24,
    marginBottom: 8,
  },
  subtitle: {
    textAlign: "center",
    color: "#6B7280",
    fontSize: 14,
    marginBottom: 24,
    lineHeight: 20,
  },
  inputLabel: {
    color: "#374151",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: 14,
    backgroundColor: "#F9FAFB",
    borderColor: "#E5E7EB",
    overflow: "hidden",
  },
  inputRowFocused: {
    borderColor: "#386641",
    backgroundColor: "#FFFFFF",
    shadowColor: "#386641",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 2,
  },
  inputRowError: {
    borderColor: "#EF4444",
  },
  countryCode: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 16,
    gap: 6,
  },
  flag: {
    fontSize: 18,
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: "#E5E7EB",
  },
  countryCodeText: {
    color: "#374151",
    fontWeight: "600",
    fontSize: 15,
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 16,
    fontSize: 17,
    color: "#111827",
    letterSpacing: 1,
  },
  checkIcon: {
    paddingRight: 12,
  },
  helperRow: {
    minHeight: 24,
    marginTop: 6,
    marginBottom: 20,
  },
  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  errorText: {
    color: "#EF4444",
    fontSize: 13,
  },
  charCount: {
    color: "#9CA3AF",
    fontSize: 12,
  },
  otpBtn: {
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
  btnRow: {
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
  switchRow: {
    alignItems: "center",
  },
  switchText: {
    textAlign: "center",
    color: "#6B7280",
    fontSize: 14,
  },
  switchLink: {
    color: "#386641",
    fontWeight: "700",
  },
});

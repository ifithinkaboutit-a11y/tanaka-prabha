// src/app/(auth)/phone-input.tsx
import AppText from "@/components/atoms/AppText";
import Button from "@/components/atoms/Button";
import AuthVideoBackground from "@/components/molecules/AuthVideoBackground";
import { useTranslation } from "@/i18n";
import { useAuth } from "@/contexts/AuthContext";
import { validateMobileNumber } from "@/utils/validation";
import { useRouter } from "expo-router";
import React, { useState } from "react";
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

const PhoneInput = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const router = useRouter();
  const { t } = useTranslation();
  const { sendOTP } = useAuth();

  const formatPhoneNumber = (text: string) => {
    // Remove non-numeric characters
    const cleaned = text.replace(/\D/g, "");
    return cleaned.slice(0, 10);
  };

  const handlePhoneChange = (text: string) => {
    const formatted = formatPhoneNumber(text);
    setPhoneNumber(formatted);
    // Clear validation error when user starts typing
    if (validationError) {
      setValidationError(null);
    }
  };

  const handleSendOTP = async () => {
    // Validate phone number
    const validation = validateMobileNumber(phoneNumber);
    if (!validation.isValid) {
      setValidationError(validation.errors[0]);
      Alert.alert(t("common.error") || "Error", validation.errors[0]);
      return;
    }

    setLoading(true);
    try {
      const fullPhoneNumber = `+91${phoneNumber}`;
      console.log("📞 handleSendOTP - Calling sendOTP with:", fullPhoneNumber);
      
      // Call the backend API to send OTP
      await sendOTP(fullPhoneNumber);
      
      console.log("📞 handleSendOTP - OTP sent successfully, navigating...");
      // Navigate to OTP input screen with phone number
      router.push({
        pathname: "/(auth)/otp-input",
        params: { phoneNumber: fullPhoneNumber },
      });
    } catch (error) {
      console.error("📞 handleSendOTP - Error:", error);
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to send OTP",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAlreadyRegistered = () => {
    // Handle already registered flow
    Alert.alert("Info", "Please enter your registered phone number to login");
  };

  return (
    <KeyboardAvoidingView
      style={s.root}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Video Background */}
      <View style={s.videoBg}>
        <AuthVideoBackground />
      </View>

      {/* Phone Input Card */}
      <View style={s.card}>
        {/* Title */}
        <AppText
          variant="h2"
          style={s.title}
        >
          {t("auth.enterPhone")}
        </AppText>

        {/* Subtitle */}
        <Text style={s.subtitle}>
          {t("auth.phoneSubtitle")}
        </Text>

        {/* Phone Input Label */}
        <Text style={s.inputLabel}>
          {t("auth.mobileNumber")}
        </Text>

        {/* Phone Input Field */}
        <View
          style={[
            s.inputRow,
            { borderColor: validationError ? "#EF4444" : "#D9D9D9" },
          ]}
        >
          {/* Country Code */}
          <View style={s.countryCode}>
            <Text style={s.countryCodeText}>+91</Text>
          </View>

          {/* Phone Number Input */}
          <TextInput
            style={s.phoneInput}
            placeholder="9555402857"
            placeholderTextColor="#9E9E9E"
            keyboardType="phone-pad"
            value={phoneNumber}
            onChangeText={handlePhoneChange}
            maxLength={10}
            editable={!loading}
          />
        </View>
        
        {/* Validation Error */}
        {validationError && (
          <Text style={s.errorText}>{validationError}</Text>
        )}
        {!validationError && <View style={{ marginBottom: 16 }} />}

        {/* Get OTP Button */}
        <Button
          variant="primary"
          onPress={handleSendOTP}
          disabled={loading || phoneNumber.length < 10}
          style={{ width: "100%", paddingVertical: 16, marginBottom: 16 }}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={s.btnText}>
              {t("auth.getOtp")}
            </Text>
          )}
        </Button>

        {/* Already Registered Link */}
        <TouchableOpacity onPress={handleAlreadyRegistered}>
          <Text style={s.alreadyText}>
            {t("auth.alreadyRegistered")}{" "}
            <Text style={s.loginLink}>{t("auth.login")}</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default PhoneInput;

const s = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "flex-end",
  },
  videoBg: {
    flex: 1,
    height: "60%",
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
    marginBottom: 24,
  },
  inputLabel: {
    color: "#616161",
    fontSize: 14,
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    backgroundColor: "#F6F6F6",
    marginBottom: 8,
  },
  countryCode: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRightWidth: 1,
    borderRightColor: "#D9D9D9",
  },
  countryCodeText: {
    color: "#212121",
    fontWeight: "500",
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: "#212121",
  },
  errorText: {
    color: "#EF4444",
    fontSize: 14,
    marginBottom: 16,
  },
  btnText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontWeight: "600",
    fontSize: 16,
  },
  alreadyText: {
    textAlign: "center",
    color: "#616161",
  },
  loginLink: {
    color: "#386641",
    fontWeight: "500",
  },
});

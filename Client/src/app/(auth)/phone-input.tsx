// src/app/(auth)/phone-input.tsx
import AppText from "@/components/atoms/AppText";
import Button from "@/components/atoms/Button";
import AuthVideoBackground from "@/components/molecules/AuthVideoBackground";
import { useTranslation } from "@/i18n";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const PhoneInput = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { t } = useTranslation();
  const { sendOTP } = useAuth();

  const formatPhoneNumber = (text: string) => {
    // Remove non-numeric characters
    const cleaned = text.replace(/\D/g, "");
    return cleaned.slice(0, 10);
  };

  const handlePhoneChange = (text: string) => {
    setPhoneNumber(formatPhoneNumber(text));
  };

  const handleSendOTP = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      Alert.alert("Error", "Please enter a valid 10-digit phone number");
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
    <View className="flex-1 justify-end">
      {/* Video Background */}
      <View className="flex h-[60vh]">
        <AuthVideoBackground />
      </View>

      {/* Phone Input Card */}
      <View className="bg-white rounded-t-3xl p-6 shadow-lg">
        {/* Title */}
        <AppText
          variant="h2"
          className="text-center text-neutral-textDark font-bold mb-2"
        >
          {t("auth.enterPhone")}
        </AppText>

        {/* Subtitle */}
        <Text className="text-center text-neutral-textMedium text-sm mb-6">
          {t("auth.phoneSubtitle")}
        </Text>

        {/* Phone Input Label */}
        <Text className="text-neutral-textMedium text-sm mb-2">
          {t("auth.mobileNumber")}
        </Text>

        {/* Phone Input Field */}
        <View className="flex-row items-center border border-neutral-border rounded-xl bg-neutral-surface mb-6">
          {/* Country Code */}
          <View className="px-4 py-4 border-r border-neutral-border">
            <Text className="text-neutral-textDark font-medium">+91</Text>
          </View>

          {/* Phone Number Input */}
          <TextInput
            className="flex-1 px-4 py-4 text-base text-neutral-textDark"
            placeholder="9555402857"
            placeholderTextColor="#9E9E9E"
            keyboardType="phone-pad"
            value={phoneNumber}
            onChangeText={handlePhoneChange}
            maxLength={10}
            editable={!loading}
          />
        </View>

        {/* Get OTP Button */}
        <Button
          variant="primary"
          onPress={handleSendOTP}
          disabled={loading || phoneNumber.length < 10}
          className="w-full py-4 mb-4"
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white text-center font-semibold text-base">
              {t("auth.getOtp")}
            </Text>
          )}
        </Button>

        {/* Already Registered Link */}
        <TouchableOpacity onPress={handleAlreadyRegistered}>
          <Text className="text-center text-neutral-textMedium">
            {t("auth.alreadyRegistered")}{" "}
            <Text className="text-primary font-medium">{t("auth.login")}</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default PhoneInput;

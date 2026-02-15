// src/app/(auth)/welcome.tsx
import AppText from "@/components/atoms/AppText";
import Button from "@/components/atoms/Button";
import AuthVideoBackground from "@/components/molecules/AuthVideoBackground";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/i18n";
import { useRouter } from "expo-router";
import React from "react";
import { View } from "react-native";

export default function Welcome() {
  const router = useRouter();
  const { t } = useTranslation();
  const { skipAuth } = useAuth();

  const handleContinue = () => {
    router.push("/(auth)/phone-input" as any);
  };

  const handleSkip = () => {
    // Skip authentication - enter guest mode
    skipAuth();
  };

  return (
    <View className="flex-1 justify-end">
      <View className="flex h-[85vh]">
        <AuthVideoBackground />
      </View>
      <View className="bg-white rounded-3xl p-6 shadow-lg">
        {/* Title */}
        <AppText
          variant="h2"
          className="text-center text-neutral-textDark font-bold mb-3"
        >
          {t("auth.welcomeTitle")}
        </AppText>

        {/* Description */}
        <AppText
          variant="bodySm"
          className="text-center text-neutral-textMedium text-base mb-6 leading-6"
        >
          {t("auth.welcomeDescription")}
        </AppText>

        {/* Skip Button */}
        <Button
          label={t("auth.skipForNow")}
          variant="outline"
          className="w-full py-4 mb-4"
          onPress={handleSkip}
        />

        {/* Continue Button */}
        <Button
          label={t("auth.continue")}
          variant="primary"
          onPress={handleContinue}
          className="w-full py-4"
        />
      </View>
    </View>
  );
}

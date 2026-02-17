// src/app/(auth)/welcome.tsx
import AppText from "@/components/atoms/AppText";
import Button from "@/components/atoms/Button";
import AuthVideoBackground from "@/components/molecules/AuthVideoBackground";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/i18n";
import React from "react";
import { StyleSheet, View } from "react-native";

export default function Welcome() {
  const { t } = useTranslation();
  const { completeOnboarding } = useAuth();

  const handleContinue = () => {
    completeOnboarding();
  };

  const handleSkip = () => {
    completeOnboarding();
  };

  return (
    <View style={s.root}>
      <View style={s.videoBg}>
        <AuthVideoBackground />
      </View>
      <View style={s.card}>
        {/* Title */}
        <AppText
          variant="h2"
          style={s.title}
        >
          {t("auth.welcomeTitle")}
        </AppText>

        {/* Description */}
        <AppText
          variant="bodySm"
          style={s.description}
        >
          {t("auth.welcomeDescription")}
        </AppText>

        {/* Skip Button */}
        <Button
          label={t("auth.skipForNow")}
          variant="outline"
          style={{ width: "100%", paddingVertical: 16, marginBottom: 16 }}
          onPress={handleSkip}
        />

        {/* Continue Button */}
        <Button
          label={t("auth.continue")}
          variant="primary"
          onPress={handleContinue}
          style={{ width: "100%", paddingVertical: 16 }}
        />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "flex-end",
  },
  videoBg: {
    flex: 1,
    height: "85%",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
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
    marginBottom: 12,
  },
  description: {
    textAlign: "center",
    color: "#616161",
    fontSize: 16,
    marginBottom: 24,
    lineHeight: 24,
  },
});

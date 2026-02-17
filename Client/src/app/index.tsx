// src/app/index.tsx
import { useTranslation } from "@/i18n";
import { useLanguageStore } from "@/stores/languageStore";
import { useRouter } from "expo-router";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { AppText } from "@/components/atoms/AppText";
import { colors } from "@/styles/colors";

const Index = () => {
  const router = useRouter();
  const { setLanguage } = useLanguageStore();
  const { t } = useTranslation();

  const handleLanguageSelect = async (lang: string) => {
    await setLanguage(lang);
    router.push("/(auth)/phone-input");
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#FFFFFF", padding: 24 }}>
      <AppText variant="headingLg" style={{ marginBottom: 32, textAlign: "center" }}>
        {t("language.selectLanguage")}
      </AppText>
      <TouchableOpacity
        style={{ backgroundColor: "#3B82F6", paddingVertical: 16, paddingHorizontal: 32, borderRadius: 8, marginBottom: 16, width: "100%" }}
        onPress={() => handleLanguageSelect("en")}
      >
        <AppText variant="bodyMd" style={{ color: "#FFFFFF", textAlign: "center", fontWeight: "600" }}>English</AppText>
      </TouchableOpacity>
      <TouchableOpacity
        style={{ backgroundColor: colors.primary.green, paddingVertical: 16, paddingHorizontal: 32, borderRadius: 8, width: "100%" }}
        onPress={() => handleLanguageSelect("hi")}
      >
        <AppText variant="bodyMd" style={{ color: "#FFFFFF", textAlign: "center", fontWeight: "600" }}>हिंदी</AppText>
      </TouchableOpacity>
    </View>
  );
};

export default Index;

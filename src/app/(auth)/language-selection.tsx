// src/app/(auth)/language-selection.tsx
import AppText from "@/components/atoms/AppText";
import Button from "@/components/atoms/Button";
import { languages } from "@/data/content/languages";
import { LanguageOption } from "@/data/interfaces";
import { useLanguageStore } from "@/stores/languageStore";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";

export default function LanguageSelection() {
  const router = useRouter();
  const { currentLanguage, setLanguage, translate } = useLanguageStore();
  const [selectedLanguage, setSelectedLanguage] = useState<string>(
    currentLanguage || "hi",
  );

  const handleLanguageSelect = (language: LanguageOption) => {
    setSelectedLanguage(language.code);
  };

  const handleContinue = async () => {
    await setLanguage(selectedLanguage);
    // Small delay to ensure language is persisted
    setTimeout(() => {
      router.replace("/(tab)/" as any);
    }, 100);
  };

  // Get translations based on selected language (preview before setting)
  const t = (key: string) => {
    const keys = key.split(".");
    const translations =
      selectedLanguage === "hi"
        ? require("@/i18n/hi.json")
        : require("@/i18n/en.json");
    let value: any = translations;
    for (const k of keys) {
      value = value?.[k];
    }
    return typeof value === "string" ? value : key;
  };

  return (
    <View className="flex-1 bg-[#E8F4EA] justify-center px-6">
      {/* Header */}
      <View className="items-center mb-8">
        <AppText variant="h2" className="text-neutral-textDark font-bold">
          {t("language.selectLanguage")}
        </AppText>
        <AppText
          variant="bodySm"
          className="text-neutral-textMedium mt-2 text-center"
        >
          {t("language.selectSubtitle")}
        </AppText>
      </View>

      {/* Language Options */}
      <View className="flex-row justify-center gap-4 mb-12">
        {languages.map((language) => (
          <Pressable
            key={language.code}
            onPress={() => handleLanguageSelect(language)}
            className={`w-28 h-28 rounded-2xl items-center justify-center border-2 ${
              selectedLanguage === language.code
                ? "bg-[#386641] border-[#005005]"
                : "bg-white border-neutral-border"
            }`}
          >
            <Text
              className={`text-4xl font-bold ${
                selectedLanguage === language.code
                  ? "text-white"
                  : "text-neutral-textDark"
              }`}
            >
              {language.symbol}
            </Text>
            <Text
              className={`mt-1 text-sm ${
                selectedLanguage === language.code
                  ? "text-white"
                  : "text-neutral-textMedium"
              }`}
            >
              {language.nativeLabel}
            </Text>
            <Text
              className={`text-xs ${
                selectedLanguage === language.code
                  ? "text-white/80"
                  : "text-neutral-textLight"
              }`}
            >
              ({language.label})
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Continue Button */}
      <Button
        label={t("language.continue")}
        variant="primary"
        onPress={handleContinue}
        className="w-full py-4"
      />
    </View>
  );
}

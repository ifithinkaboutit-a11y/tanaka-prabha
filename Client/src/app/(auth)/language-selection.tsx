// src/app/(auth)/language-selection.tsx
import AppText from "@/components/atoms/AppText";
import Button from "@/components/atoms/Button";
import { languages } from "@/data/content/languages";
import { LanguageOption } from "@/data/interfaces";
import { useLanguageStore } from "@/stores/languageStore";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

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
      router.push("/(auth)/welcome" as any);
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
    <View style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <AppText
          variant="h2"
          style={{ color: "#212121", fontWeight: "700" }}
        >
          {t("language.selectLanguage")}
        </AppText>
        <AppText
          variant="bodySm"
          style={{ color: "#616161", marginTop: 8, textAlign: "center" }}
        >
          {t("language.selectSubtitle")}
        </AppText>
      </View>

      {/* Language Options */}
      <View style={s.languageRow}>
        {languages.map((language) => {
          const isSelected = selectedLanguage === language.code;
          return (
            <Pressable
              key={language.code}
              onPress={() => handleLanguageSelect(language)}
              style={[
                s.languageCard,
                isSelected ? s.cardSelected : s.cardDefault,
              ]}
            >
              <Text
                style={[
                  s.symbol,
                  { color: isSelected ? "#FFFFFF" : "#212121" },
                ]}
              >
                {language.symbol}
              </Text>
              <Text
                style={[
                  s.nativeLabel,
                  { color: isSelected ? "#FFFFFF" : "#616161" },
                ]}
              >
                {language.nativeLabel}
              </Text>
              <Text
                style={[
                  s.label,
                  { color: isSelected ? "rgba(255,255,255,0.8)" : "#9E9E9E" },
                ]}
              >
                ({language.label})
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Continue Button */}
      <Button
        label={t("language.continue")}
        variant="primary"
        onPress={handleContinue}
        style={{ width: "100%", paddingVertical: 16 }}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E8F4EA",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  languageRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    marginBottom: 48,
  },
  languageCard: {
    width: 112,
    height: 112,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },
  cardSelected: {
    backgroundColor: "#386641",
    borderColor: "#005005",
  },
  cardDefault: {
    backgroundColor: "#FFFFFF",
    borderColor: "#D9D9D9",
  },
  symbol: {
    fontSize: 32,
    fontWeight: "700",
  },
  nativeLabel: {
    marginTop: 4,
    fontSize: 14,
  },
  label: {
    fontSize: 12,
  },
});

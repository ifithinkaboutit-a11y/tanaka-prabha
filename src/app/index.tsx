// src/app/index.tsx
import { useTranslation } from "@/i18n";
import { useLanguageStore } from "@/stores/languageStore";
import { useRouter } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

const Index = () => {
  const router = useRouter();
  const { setLanguage } = useLanguageStore();
  const { t } = useTranslation();

  const handleLanguageSelect = async (lang: string) => {
    await setLanguage(lang);
    router.push("/(auth)/phone-input");
  };

  return (
    <View className="flex-1 justify-center items-center bg-white p-6">
      <Text className="text-2xl font-bold mb-8 text-center">
        {t("language.selectLanguage")}
      </Text>
      <TouchableOpacity
        className="bg-blue-500 py-4 px-8 rounded-lg mb-4 w-full"
        onPress={() => handleLanguageSelect("en")}
      >
        <Text className="text-white text-center font-semibold">English</Text>
      </TouchableOpacity>
      <TouchableOpacity
        className="bg-green-500 py-4 px-8 rounded-lg w-full"
        onPress={() => handleLanguageSelect("hi")}
      >
        <Text className="text-white text-center font-semibold">हिंदी</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Index;

// src/stores/languageStore.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Updates from "expo-updates";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import en from "../i18n/en.json";
import hi from "../i18n/hi.json";

interface LanguageState {
  currentLanguage: string;
  translations: Record<string, any>;
  setLanguage: (language: string) => void;
  translate: (key: string) => string;
}

const translations = {
  en,
  hi,
};

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      currentLanguage: "en",
      translations,
      setLanguage: async (language: string) => {
        set({ currentLanguage: language });

        // Reload the app to apply language changes gracefully
        try {
          console.log("Attempting to reload app for language change...");
          await Updates.reloadAsync();
          console.log("App reloaded successfully");
        } catch (error) {
          console.warn("Failed to reload app after language change:", error);
          // Fallback: show message to user
          console.log(
            `Language changed to ${language}. Please restart the app manually to see changes.`,
          );
        }
      },
      translate: (key: string) => {
        const { currentLanguage, translations } = get();
        const keys = key.split(".");
        let value = translations[currentLanguage];

        for (const k of keys) {
          value = value?.[k];
        }

        return typeof value === "string" ? value : key;
      },
    }),
    {
      name: "language-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

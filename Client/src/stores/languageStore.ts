// src/stores/languageStore.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import en from "../i18n/en.json";
import hi from "../i18n/hi.json";

interface LanguageState {
  currentLanguage: string;
  hasLaunched: boolean;
  translations: Record<string, any>;
  setLanguage: (language: string) => void;
  setHasLaunched: (launched: boolean) => void;
  translate: (key: string) => string;
}

const translations: Record<string, any> = {
  en,
  hi,
};

const resolveTranslation = (language: string, key: string) => {
  const keys = key.split(".");
  let value: any = translations[language] || translations.en;

  for (const k of keys) {
    value = value?.[k];
  }

  return value;
};

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      currentLanguage: "hi", // Default to Hindi
      hasLaunched: false,
      translations,
      setLanguage: (language: string) => {
        set({ currentLanguage: language });
      },
      setHasLaunched: (launched: boolean) => {
        set({ hasLaunched: launched });
      },
      translate: (key: string) => {
        const { currentLanguage } = get();
        const value = resolveTranslation(currentLanguage, key) ?? resolveTranslation("en", key);

        return typeof value === "string" ? value : key;
      },
    }),
    {
      name: "language-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

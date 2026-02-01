// src/stores/languageStore.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
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

const translations: Record<string, any> = {
  en,
  hi,
};

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      currentLanguage: "hi", // Default to Hindi
      translations,
      setLanguage: (language: string) => {
        set({ currentLanguage: language });
      },
      translate: (key: string) => {
        const { currentLanguage } = get();
        const keys = key.split(".");
        let value: any = translations[currentLanguage];

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

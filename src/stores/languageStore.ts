// src/stores/languageStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
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
      setLanguage: (language: string) => {
        set({ currentLanguage: language });
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
    },
  ),
);

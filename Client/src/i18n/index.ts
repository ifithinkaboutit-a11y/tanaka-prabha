// src/i18n/index.ts
import { useCallback } from "react";
import { useLanguageStore } from "../stores/languageStore";
import en from "./en.json";
import hi from "./hi.json";

const translations: Record<string, any> = { en, hi };

// For backward compatibility - this won't be reactive
const T = {
  translate: (key: string) => {
    const store = useLanguageStore.getState();
    return store.translate(key);
  },
  setLocale: (locale: string) => {
    useLanguageStore.getState().setLanguage(locale);
  },
  getLocale: () => {
    return useLanguageStore.getState().currentLanguage;
  },
};

export default T;

// Export the hook for reactive usage
// Creates a new translate function that depends on currentLanguage for reactivity
export const useTranslation = () => {
  const { currentLanguage, setLanguage } = useLanguageStore();

  // Create a translate function that uses the reactive currentLanguage
  const t = useCallback(
    (key: string): string => {
      const keys = key.split(".");
      let value: any = translations[currentLanguage];

      for (const k of keys) {
        value = value?.[k];
      }

      return typeof value === "string" ? value : key;
    },
    [currentLanguage]
  );

  return {
    t,
    currentLanguage,
    setLanguage,
  };
};

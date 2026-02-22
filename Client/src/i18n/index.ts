// src/i18n/index.ts
import { useLanguageStore } from "../stores/languageStore";
import en from "./en.json";
import hi from "./hi.json";

const translationData: Record<string, any> = { en, hi };

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

// Reactive hook — t function re-creates on language change
export const useTranslation = () => {
  const currentLanguage = useLanguageStore((s) => s.currentLanguage);
  const setLanguage = useLanguageStore((s) => s.setLanguage);

  const t = (key: string, params?: Record<string, string | number>): string => {
    const keys = key.split(".");
    let value: any = translationData[currentLanguage];
    for (const k of keys) {
      value = value?.[k];
    }

    let result = typeof value === "string" ? value : key;

    if (params && typeof result === "string") {
      Object.entries(params).forEach(([k, v]) => {
        result = result.replace(new RegExp(`{{${k}}}`, 'g'), String(v));
      });
    }

    return result;
  };

  return { t, currentLanguage, setLanguage };
};

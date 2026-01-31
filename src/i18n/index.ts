// src/i18n/index.ts
import { useLanguageStore } from "../stores/languageStore";

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
export const useTranslation = () => {
  const { translate, currentLanguage, setLanguage } = useLanguageStore();
  return {
    t: translate,
    currentLanguage,
    setLanguage,
  };
};

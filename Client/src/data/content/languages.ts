// src/data/content/languages.ts
import { LanguageOption } from "../interfaces/auth";

export const languages: LanguageOption[] = [
  {
    code: "hi",
    label: "Hindi",
    nativeLabel: "हिंदी",
    symbol: "अ",
  },
  {
    code: "en",
    label: "English",
    nativeLabel: "English",
    symbol: "A",
  },
];

export const defaultLanguage = "en";

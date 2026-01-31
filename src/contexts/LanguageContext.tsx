// src/contexts/LanguageContext.tsx
import React, { createContext, ReactNode, useContext } from "react";
import { useLanguageStore } from "../stores/languageStore";

interface LanguageContextType {
  currentLanguage: string;
  setLanguage: (language: string) => void;
  translate: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({
  children,
}) => {
  const { currentLanguage, setLanguage, translate } = useLanguageStore();

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        setLanguage,
        translate,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

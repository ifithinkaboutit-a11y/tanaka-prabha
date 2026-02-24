// src/app/(auth)/index.tsx
import { Redirect } from "expo-router";
import { useLanguageStore } from "@/stores/languageStore";

export default function AuthIndex() {
  const { hasLaunched } = useLanguageStore();

  if (hasLaunched) {
    return <Redirect href="/(auth)/welcome" />;
  }
  return <Redirect href="/(auth)/language-selection" />;
}

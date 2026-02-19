// src/app/index.tsx
// Redirect to the auth flow — the real language selection lives at (auth)/language-selection
import { Redirect } from "expo-router";

export default function Index() {
  return <Redirect href="/(auth)/" />;
}

// src/utils/suppressExpoGoWarnings.ts
//
// Must be the FIRST import in the app's root layout, before anything that
// transitively imports expo-notifications (e.g. AuthContext -> pushNotifications).
//
// Expo Go (SDK 53+) dropped remote push support entirely. The moment
// expo-notifications is imported, it fires a console.error that Metro renders
// as a full red-screen crash overlay — even though nothing actually crashes:
// pushNotifications.ts already detects Expo Go and skips token registration,
// so the rest of the app keeps working. This only suppresses that specific
// cosmetic noise; it has no effect in a dev-client or production build, where
// push notifications work normally and this message never fires.
import { LogBox } from "react-native";

LogBox.ignoreLogs([
  /Android Push notifications \(remote notifications\) functionality provided by expo-notifications was removed from Expo Go/,
  /expo-notifications.*functionality is not fully supported in Expo Go/,
]);

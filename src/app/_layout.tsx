import "@/styles/global.css";
import * as NavigationBar from "expo-navigation-bar";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { LanguageProvider } from "../contexts/LanguageContext";
import { UserProfileProvider } from "../contexts/UserProfileContext";
import "../i18n"; // Initialize i18n

export default function RootLayout() {
  useEffect(() => {
    NavigationBar.setVisibilityAsync("hidden");
    NavigationBar.setBehaviorAsync("overlay-swipe");
  }, []);

  return (
    <LanguageProvider>
      <UserProfileProvider>
        <StatusBar hidden />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tab)" options={{ headerShown: false }} />
        </Stack>
      </UserProfileProvider>
    </LanguageProvider>
  );
}

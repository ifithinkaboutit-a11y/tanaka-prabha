import "@/styles/global.css";
import * as NavigationBar from "expo-navigation-bar";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { Platform } from "react-native";
import { AuthProvider } from "../contexts/AuthContext";
import { LanguageProvider } from "../contexts/LanguageContext";
import { UserProfileProvider } from "../contexts/UserProfileContext";
import "../i18n"; // Initialize i18n

// Debug: log API URL at startup (remove after confirming production works)
console.log("🔗 [RootLayout] EXPO_PUBLIC_API_URL =", process.env.EXPO_PUBLIC_API_URL ?? "⚠️ UNDEFINED");

// Prevent the splash screen from auto-hiding (only on native)
if (Platform.OS !== "web") {
  SplashScreen.preventAutoHideAsync();
}

export default function RootLayout() {
  useEffect(() => {
    async function prepare() {
      try {
        // Fire-and-forget: wake the Render free-tier server while splash is shown
        const apiUrl = process.env.EXPO_PUBLIC_API_URL || "https://tanak-prabha.onrender.com/api";
        const healthUrl = apiUrl.replace(/\/api\/?$/, "/health");
        fetch(healthUrl).catch(() => { }); // ignore errors, this is just a warm-up

        // Hold splash for 1s while server wakes and assets load
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (e) {
        console.warn(e);
      } finally {
        // Hide the native splash screen (only on native)
        if (Platform.OS !== "web") {
          await SplashScreen.hideAsync();
        }
      }
    }

    prepare();

    // Only call NavigationBar on Android
    if (Platform.OS === "android") {
      NavigationBar.setVisibilityAsync("hidden").catch(() => {
        // Ignore errors if not supported
      });
    }
  }, []);

  return (
    <AuthProvider>
      <LanguageProvider>
        <UserProfileProvider>
          <StatusBar hidden />
          <Stack
            screenOptions={{ headerShown: false }}
            initialRouteName="(auth)"
          >
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(tab)" options={{ headerShown: false }} />
            <Stack.Screen name="search" options={{ headerShown: false }} />
            <Stack.Screen
              name="category-listing"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="personal-details"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="land-details"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="livestock-details"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="program-details"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="notifications"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="scheme-details"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="connect-listing"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="connect-detail"
              options={{ headerShown: false }}
            />
          </Stack>
        </UserProfileProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}

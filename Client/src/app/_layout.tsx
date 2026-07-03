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
import { useOfflineQueueSync } from "../hooks/useOfflineQueueSync";
import {
  addNotificationListeners,
  handleColdStartNotification,
  navigateFromNotification,
} from "@/utils/pushNotifications";
import { theme } from "@/styles/colors";
import "../i18n";

if (Platform.OS !== "web") {
  SplashScreen.preventAutoHideAsync();
}

export default function RootLayout() {
  useOfflineQueueSync();

  useEffect(() => {
    // Hide splash screen immediately for fast perceived load
    if (Platform.OS !== "web") {
      SplashScreen.hideAsync();
    }

    // Warm up the API server in background (non-blocking)
    const apiUrl = process.env.EXPO_PUBLIC_API_URL || "https://tanak-prabha.onrender.com/api";
    fetch(apiUrl.replace(/\/api\/?$/, "/health"), { method: "HEAD" }).catch(() => {});

    if (Platform.OS === "android") {
      NavigationBar.setVisibilityAsync("hidden").catch(() => {});
    }
  }, []);

  // Notification tap handling: navigate to the referenced screen both when the
  // app is already running and when it was cold-started from a notification.
  useEffect(() => {
    handleColdStartNotification();
    const cleanup = addNotificationListeners(undefined, (response) => {
      navigateFromNotification(response.notification.request.content.data);
    });
    return cleanup;
  }, []);

  return (
    <AuthProvider>
      <LanguageProvider>
        <UserProfileProvider>
          <StatusBar hidden />
          <Stack
            screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.background.screen } }}
            initialRouteName="(auth)"
          >
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(tab)" options={{ headerShown: false }} />
            <Stack.Screen name="(admin)" options={{ headerShown: false }} />
            <Stack.Screen name="search" options={{ headerShown: false }} />
            <Stack.Screen name="category-listing" options={{ headerShown: false }} />
            <Stack.Screen name="personal-details" options={{ headerShown: false }} />
            <Stack.Screen name="land-details" options={{ headerShown: false }} />
            <Stack.Screen name="livestock-details" options={{ headerShown: false }} />
            <Stack.Screen name="program-details" options={{ headerShown: false }} />
            <Stack.Screen name="notifications" options={{ headerShown: false }} />
            <Stack.Screen name="scheme-details" options={{ headerShown: false }} />
            <Stack.Screen name="connect-listing" options={{ headerShown: false }} />
            <Stack.Screen name="connect-detail" options={{ headerShown: false }} />
            <Stack.Screen name="event-details" options={{ headerShown: false }} />
            <Stack.Screen name="location-picker" options={{ headerShown: false }} />
            <Stack.Screen name="book-appointment" options={{ headerShown: false }} />
            <Stack.Screen name="scan-attendance" options={{ headerShown: false }} />
            <Stack.Screen name="all-events" options={{ headerShown: false }} />
            <Stack.Screen name="my-schedule" options={{ headerShown: false }} />
          </Stack>
        </UserProfileProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}

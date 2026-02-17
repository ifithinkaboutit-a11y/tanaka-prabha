import "@/styles/global.css";
import * as NavigationBar from "expo-navigation-bar";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { Image, Platform, Text, View } from "react-native";
import { AuthProvider } from "../contexts/AuthContext";
import { LanguageProvider } from "../contexts/LanguageContext";
import { UserProfileProvider } from "../contexts/UserProfileContext";
import "../i18n"; // Initialize i18n

// Prevent the splash screen from auto-hiding (only on native)
if (Platform.OS !== "web") {
  SplashScreen.preventAutoHideAsync();
}

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Simulate some loading time for initialization
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (e) {
        console.warn(e);
      } finally {
        setIsReady(true);
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

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#FFFFFF" }}>
        <Image
          source={require("../assets/images/splash-icon.png")}
          style={{ width: 128, height: 128, marginBottom: 32 }}
          resizeMode="contain"
        />
        <Text style={{ fontSize: 24, fontWeight: "bold", color: "#212121", marginBottom: 8 }}>
          Tanak Prabha
        </Text>
        <Text style={{ color: "#9E9E9E" }}>Empowering Farmers</Text>
      </View>
    );
  }

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

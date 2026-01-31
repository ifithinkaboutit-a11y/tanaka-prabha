import "@/styles/global.css";
import * as NavigationBar from "expo-navigation-bar";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { Image, Text, View } from "react-native";
import { LanguageProvider } from "../contexts/LanguageContext";
import { UserProfileProvider } from "../contexts/UserProfileContext";
import "../i18n"; // Initialize i18n

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Simulate some loading time for initialization
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } catch (e) {
        console.warn(e);
      } finally {
        setIsReady(true);
        // Hide the native splash screen
        await SplashScreen.hideAsync();
      }
    }

    prepare();

    NavigationBar.setVisibilityAsync("hidden");
    // Removed setBehaviorAsync as it's not supported with edge-to-edge enabled
  }, []);

  if (!isReady) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Image
          source={require("../assets/images/splash-icon.png")}
          className="w-32 h-32 mb-8"
          resizeMode="contain"
        />
        <Text className="text-2xl font-bold text-neutral-textDark mb-2">
          Tanak Prabha
        </Text>
        <Text className="text-neutral-textLight">Empowering Farmers</Text>
      </View>
    );
  }

  return (
    <LanguageProvider>
      <UserProfileProvider>
        <StatusBar hidden />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tab)" options={{ headerShown: false }} />
          <Stack.Screen name="search" options={{ headerShown: false }} />
        </Stack>
      </UserProfileProvider>
    </LanguageProvider>
  );
}

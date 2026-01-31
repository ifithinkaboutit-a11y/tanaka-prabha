import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as NavigationBar from "expo-navigation-bar";
import React, { useEffect } from "react";
import "@/styles/global.css";

export default function RootLayout() {
  useEffect(() => {
    NavigationBar.setVisibilityAsync("hidden");
    NavigationBar.setBehaviorAsync("overlay-swipe");
  }, []);

  return (
    <>
      <StatusBar hidden />
      <Stack>
        <Stack.Screen name="(tab)" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}

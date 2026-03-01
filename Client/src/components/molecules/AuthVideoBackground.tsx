// src/components/molecules/AuthVideoBackground.tsx
import MediaPath from "@/constants/MediaPath";
import React, { ReactNode } from "react";
import { ImageBackground, View, StyleSheet } from "react-native";

interface AuthVideoBackgroundProps {
  children?: ReactNode;
}

export default function AuthVideoBackground({
  children,
}: AuthVideoBackgroundProps) {
  return (
    <ImageBackground
      source={MediaPath.images.authBgImage}
      style={styles.bg}
      resizeMode="cover"
    >
      {/* Subtle dark overlay for readability */}
      <View style={styles.overlay} />
      <View style={styles.content}>{children}</View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.35)",
  },
  content: {
    flex: 1,
  },
});

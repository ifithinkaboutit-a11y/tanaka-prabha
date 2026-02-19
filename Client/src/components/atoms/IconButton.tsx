// src/components/atoms/IconButton.tsx
import React from "react";
import { Pressable, StyleSheet, ViewStyle } from "react-native";
import { colors } from "../../styles/colors";

type IconButtonProps = {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
};

export default function IconButton({ children, onPress, style }: IconButtonProps) {
  return (
    <Pressable onPress={onPress} style={[styles.container, style]}>
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.neutral.surface,
    borderRadius: 8,
  },
});

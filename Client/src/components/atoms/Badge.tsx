// src/components/atoms/Badge.tsx
import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { colors, theme } from "../../styles/colors";
import AppText from "./AppText";

type BadgeProps = {
  label: string;
  variant?: "default" | "success" | "warning";
  style?: ViewStyle;
};

const variantBg: Record<string, string> = {
  default: colors.neutral.border,
  success: colors.semantic.success,
  warning: colors.semantic.warning,
};

const variantText: Record<string, string> = {
  default: colors.neutral.textDark,
  success: theme.text.onPrimary,
  warning: theme.text.onPrimary,
};

export default function Badge({ label, variant = "default", style }: BadgeProps) {
  return (
    <View style={[styles.container, { backgroundColor: variantBg[variant] }, style]}>
      <AppText variant="caption" style={{ color: variantText[variant] }}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
});

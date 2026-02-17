// src/components/atoms/Button.tsx
import { ReactNode } from "react";
import { Pressable, Text, StyleSheet, ViewStyle, TextStyle } from "react-native";

type ButtonProps = {
  children?: ReactNode;
  label?: string;
  onPress?: () => void;
  variant?: "primary" | "secondary" | "outline";
  disabled?: boolean;
  style?: ViewStyle;
  size?: "sm" | "md" | "lg";
};

const sizeStyles: Record<string, ViewStyle> = {
  sm: { paddingHorizontal: 8, paddingVertical: 4 },
  md: { paddingHorizontal: 16, paddingVertical: 12 },
  lg: { paddingHorizontal: 24, paddingVertical: 16 },
};

const variantStyles: Record<string, ViewStyle> = {
  primary: { backgroundColor: "#386641" },
  secondary: { backgroundColor: "#7F5539" },
  outline: { borderWidth: 1, borderColor: "#D9D9D9", backgroundColor: "#FFFFFF" },
};

const textColors: Record<string, string> = {
  primary: "#FFFFFF",
  secondary: "#FFFFFF",
  outline: "#212121",
};

export default function Button({
  children,
  label,
  onPress,
  variant = "primary",
  disabled,
  style,
  size = "md",
}: ButtonProps) {
  const content =
    children ||
    (label ? (
      <Text style={[styles.label, { color: textColors[variant] }]}>
        {label}
      </Text>
    ) : null);

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        sizeStyles[size],
        variantStyles[variant],
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.85,
  },
});

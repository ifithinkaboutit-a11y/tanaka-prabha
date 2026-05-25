// src/components/atoms/Button.tsx
import { ReactNode } from "react";
import { Pressable, Text, StyleSheet } from "react-native";
import { ViewStyle } from "react-native";
import { theme } from "../../styles/colors";

type ButtonProps = {
  children?: ReactNode;
  label?: string;
  onPress?: () => void;
  variant?: "primary" | "secondary" | "outline";
  disabled?: boolean;
  style?: ViewStyle;
  size?: "sm" | "md" | "lg";
  accessibilityLabel?: string;
  accessibilityHint?: string;
};

const sizeClasses: Record<string, string> = {
  sm: "px-3 py-2 min-h-[40px]",
  md: "px-4 py-3.5 min-h-[48px]",
  lg: "px-6 py-4 min-h-[56px]",
};

const variantStyles = StyleSheet.create({
  primary: { backgroundColor: theme.primary.green },
  secondary: { backgroundColor: theme.secondary.soil },
  outline: { borderWidth: 1, borderColor: theme.border.default, backgroundColor: "white" },
});

const textColorStyles = StyleSheet.create({
  primary: { color: theme.text.onPrimary },
  secondary: { color: theme.text.onSecondary },
  outline: { color: theme.text.dark },
});

export default function Button({
  children,
  label,
  onPress,
  variant = "primary",
  disabled,
  style,
  size = "md",
  accessibilityLabel,
  accessibilityHint,
}: ButtonProps) {
  const content = children || (label ? (
    <Text className="text-base font-semibold" style={textColorStyles[variant]}>
      {label}
    </Text>
  ) : null);

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      style={[variantStyles[variant], style]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: !!disabled }}
      className={`
        rounded-xl items-center justify-center flex-row
        ${sizeClasses[size]}
        ${disabled ? "opacity-[0.45]" : "active:opacity-85"}
      `}
    >
      {content}
    </Pressable>
  );
}

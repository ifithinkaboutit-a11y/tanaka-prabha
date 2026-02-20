// src/components/atoms/Button.tsx
import { ReactNode } from "react";
import { Pressable, Text } from "react-native";
import { ViewStyle } from "react-native";

type ButtonProps = {
  children?: ReactNode;
  label?: string;
  onPress?: () => void;
  variant?: "primary" | "secondary" | "outline";
  disabled?: boolean;
  style?: ViewStyle;
  size?: "sm" | "md" | "lg";
};

const sizeClasses: Record<string, string> = {
  sm: "px-2 py-1",
  md: "px-4 py-3",
  lg: "px-6 py-4",
};

const variantClasses: Record<string, string> = {
  primary: "bg-[#386641]",
  secondary: "bg-[#7F5539]",
  outline: "border border-[#D9D9D9] bg-white",
};

const textColorClasses: Record<string, string> = {
  primary: "text-white",
  secondary: "text-white",
  outline: "text-[#212121]",
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
  const content = children || (label ? (
    <Text className={`text-base font-semibold ${textColorClasses[variant]}`}>
      {label}
    </Text>
  ) : null);

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      style={style}
      className={`
        rounded-xl items-center justify-center flex-row
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${disabled ? "opacity-50" : "active:opacity-85"}
      `}
    >
      {content}
    </Pressable>
  );
}
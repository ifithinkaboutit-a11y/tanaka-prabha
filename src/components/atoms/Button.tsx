// src/components/atoms/Button.tsx
import clsx from "clsx";
import { ReactNode } from "react";
import { Pressable, Text } from "react-native";

type ButtonProps = {
  children?: ReactNode;
  label?: string;
  onPress?: () => void;
  variant?: "primary" | "secondary" | "outline";
  disabled?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
};

export default function Button({
  children,
  label,
  onPress,
  variant = "primary",
  disabled,
  className,
  size = "md",
}: ButtonProps) {
  const sizeClasses = {
    sm: "px-2 py-1",
    md: "px-4 py-3",
    lg: "px-6 py-4",
  };

  const textColorClass =
    variant === "outline" ? "text-neutral-textDark" : "text-white";

  const content =
    children ||
    (label ? (
      <Text className={clsx("text-bodyMd font-medium", textColorClass)}>
        {label}
      </Text>
    ) : null);

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={clsx(
        "rounded-lg items-center justify-center flex-row",
        sizeClasses[size],
        variant === "primary" && "bg-[#386641]",
        variant === "secondary" && "bg-[#7F5539]",
        variant === "outline" && "border border-neutral-border bg-white",
        disabled && "opacity-50",
        className,
      )}
    >
      {content}
    </Pressable>
  );
}

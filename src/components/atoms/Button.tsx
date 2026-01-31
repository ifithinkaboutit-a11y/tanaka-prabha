// src/components/atoms/Button.tsx
import { Pressable } from "react-native";
import clsx from "clsx";
import AppText from "./AppText";

type ButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: "primary" | "secondary" | "outline";
  disabled?: boolean;
  className?: string;
};

export default function Button({
  label,
  onPress,
  variant = "primary",
  disabled,
  className,
}: ButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={clsx(
        "rounded-lg px-4 py-3 items-center justify-center",
        variant === "primary" && "bg-primary",
        variant === "secondary" && "bg-secondary-soil",
        variant === "outline" && "border border-neutral-border",
        disabled && "opacity-50",
        className
      )}
    >
      <AppText
        variant="bodyMd"
        className={clsx(
          variant === "outline" ? "text-neutral-textDark" : "text-white"
        )}
      >
        {label}
      </AppText>
    </Pressable>
  );
}

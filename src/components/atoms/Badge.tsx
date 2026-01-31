// src/components/atoms/Badge.tsx
import { View } from "react-native";
import clsx from "clsx";
import AppText from "./AppText";

type BadgeProps = {
  label: string;
  variant?: "default" | "success" | "warning";
};

export default function Badge({
  label,
  variant = "default",
}: BadgeProps) {
  return (
    <View
      className={clsx(
        "px-2 py-1 rounded-md",
        variant === "default" && "bg-neutral-border",
        variant === "success" && "bg-semantic-success",
        variant === "warning" && "bg-semantic-warning"
      )}
    >
      <AppText
        variant="caption"
        className={variant === "default" ? "text-neutral-textDark" : "text-white"}
      >
        {label}
      </AppText>
    </View>
  );
}

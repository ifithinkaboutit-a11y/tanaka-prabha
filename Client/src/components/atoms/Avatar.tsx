// src/components/atoms/Avatar.tsx
import clsx from "clsx";
import { useState } from "react";
import { Image, Text, View } from "react-native";

type AvatarSize = "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";

type AvatarProps = {
  uri?: string;
  name?: string;
  size?: AvatarSize;
  shape?: "circle" | "square";
  className?: string;
};

const containerSizeClasses: Record<AvatarSize, string> = {
  sm: "w-8 h-8",
  md: "w-10 h-10",
  lg: "w-14 h-14",
  xl: "w-20 h-20",
  "2xl": "w-24 h-24",
  "3xl": "w-28 h-28",
};

const textSizeClasses: Record<AvatarSize, string> = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
  xl: "text-lg",
  "2xl": "text-xl",
  "3xl": "text-2xl",
};

export default function Avatar({
  uri,
  name,
  size = "md",
  shape = "circle",
  className,
}: AvatarProps) {
  const [imageError, setImageError] = useState(false);

  const initials =
    name
      ?.trim()
      .split(/\s+/)
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?";

  const showInitials = !uri || imageError;

  return (
    <View
      className={clsx(
        containerSizeClasses[size],
        shape === "circle" ? "rounded-full" : "rounded-lg",
        "bg-neutral-surface border border-neutral-border flex items-center justify-center overflow-hidden",
        className,
      )}
    >
      {showInitials ? (
        <Text
          className={clsx(
            "font-semibold text-neutral-textDark",
            textSizeClasses[size],
          )}
        >
          {initials}
        </Text>
      ) : (
        <Image
          source={{ uri }}
          className="w-full h-full"
          resizeMode="cover"
          onError={() => setImageError(true)}
        />
      )}
    </View>
  );
}

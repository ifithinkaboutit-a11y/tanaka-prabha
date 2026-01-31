// src/components/atoms/Avatar.tsx
import clsx from "clsx";
import { useState } from "react";
import { Image, Text, View } from "react-native";

type AvatarProps = {
  uri?: string;
  name?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const containerSizeClasses = {
  sm: "w-8 h-8",
  md: "w-10 h-10",
  lg: "w-14 h-14",
};

const textSizeClasses = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
};

export default function Avatar({
  uri,
  name,
  size = "md",
  className,
}: AvatarProps) {
  const [imageError, setImageError] = useState(false);

  // Initials fallback
  const initials =
    name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?";

  const showInitials = !uri || imageError;

  return (
    <View
      className={clsx(
        containerSizeClasses[size],
        "rounded-full bg-gray-200 border border-gray-300 flex items-center justify-center overflow-hidden",
        className,
      )}
    >
      {showInitials ? (
        <Text
          className={clsx(
            "text-black font-semibold text-center",
            textSizeClasses[size],
          )}
        >
          {initials}
        </Text>
      ) : (
        <Image
          source={{ uri }}
          className="w-full h-full rounded-full"
          resizeMode="cover"
          onError={() => setImageError(true)}
        />
      )}
    </View>
  );
}

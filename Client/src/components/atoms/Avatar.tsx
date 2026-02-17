// src/components/atoms/Avatar.tsx
import { useState } from "react";
import { Image, Text, View } from "react-native";

type AvatarSize = "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";

type AvatarProps = {
  uri?: string;
  name?: string;
  size?: AvatarSize;
  shape?: "circle" | "square";
  bgColor?: string;
};

const containerSizeStyles: Record<AvatarSize, { width: number; height: number }> = {
  sm: { width: 32, height: 32 },
  md: { width: 40, height: 40 },
  lg: { width: 56, height: 56 },
  xl: { width: 80, height: 80 },
  "2xl": { width: 96, height: 96 },
  "3xl": { width: 112, height: 112 },
};

const textSizeStyles: Record<AvatarSize, number> = {
  sm: 12,
  md: 14,
  lg: 18,
  xl: 24,
  "2xl": 28,
  "3xl": 36,
};

// Generate consistent color from name
const getColorFromName = (name?: string): string => {
  const colors = [
    "#386641", // Forest green
    "#6A994E", // Light green
    "#2563EB", // Blue
    "#7F5539", // Brown
    "#DC2626", // Red
    "#9333EA", // Purple
    "#EA580C", // Orange
    "#0891B2", // Cyan
  ];
  if (!name) return colors[0];
  const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

export default function Avatar({
  uri,
  name,
  size = "md",
  shape = "circle",
  bgColor,
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
  const backgroundColor = bgColor || getColorFromName(name);
  const sizeStyle = containerSizeStyles[size];

  return (
    <View
      style={{
        ...sizeStyle,
        borderRadius: shape === "circle" ? sizeStyle.width / 2 : 16,
        backgroundColor: showInitials ? backgroundColor : "#F3F4F6",
        borderWidth: showInitials ? 0 : 2,
        borderColor: "#E5E7EB",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
    >
      {showInitials ? (
        <Text
          style={{
            fontWeight: "700",
            color: "#FFFFFF",
            fontSize: textSizeStyles[size],
          }}
        >
          {initials}
        </Text>
      ) : (
        <Image
          source={{ uri }}
          style={{ width: "100%", height: "100%" }}
          resizeMode="cover"
          onError={() => setImageError(true)}
        />
      )}
    </View>
  );
}

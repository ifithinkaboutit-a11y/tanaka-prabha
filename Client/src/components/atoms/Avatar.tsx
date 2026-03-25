// src/components/atoms/Avatar.tsx
import { useState, useEffect } from "react";
import { Image, Text, View } from "react-native";
import { cdn } from "../../utils/cloudinaryUtils";

type AvatarSize = "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";

type AvatarProps = {
  uri?: string;
  name?: string;
  size?: AvatarSize;
  shape?: "circle" | "square";
  bgColor?: string;
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
  lg: "text-lg",
  xl: "text-2xl",
  "2xl": "text-[28px]",
  "3xl": "text-4xl",
};

const getColorFromName = (name?: string): string => {
  const colors = [
    "#386641",
    "#6A994E",
    "#2563EB",
    "#7F5539",
    "#DC2626",
    "#9333EA",
    "#EA580C",
    "#0891B2",
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

  // Reset error state whenever the URI changes (e.g. after a new photo upload)
  useEffect(() => {
    setImageError(false);
  }, [uri]);

  const initials =
    name
      ?.trim()
      .split(/\s+/)
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?";

  const showInitials = !uri || imageError;
  // When showing an image, bgColor is used as the container background (for borders/loading state).
  // When showing initials, always use the name-based color so initials are always legible.
  const initialsBackgroundColor = getColorFromName(name);
  const imageBackgroundColor = bgColor || "#F3F4F6";
  const backgroundColor = showInitials ? initialsBackgroundColor : imageBackgroundColor;

  return (
    <View
      className={`
        ${containerSizeClasses[size]}
        ${shape === "circle" ? "rounded-full" : "rounded-2xl"}
        ${showInitials ? "" : "bg-gray-100 border-2 border-gray-200"}
        items-center justify-center overflow-hidden
        shadow-sm elevation-3
      `}
      style={showInitials ? { backgroundColor } : undefined}
    >
      {showInitials ? (
        <Text
          className={`font-bold ${textSizeClasses[size]}`}
          style={{ color: "#FFFFFF" }}
        >
          {initials}
        </Text>
      ) : (
        <Image
          source={{ uri: uri?.startsWith('file://') ? uri : cdn(uri, { w: 200, h: 200, c: 'fill', g: 'face' }) }}
          className="w-full h-full"
          resizeMode="cover"
          onError={() => setImageError(true)}
        />
      )}
    </View>
  );
}
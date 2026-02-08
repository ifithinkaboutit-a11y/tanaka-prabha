// src/components/molecules/ProgramCard.tsx
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Image, Pressable, View } from "react-native";
import { Scheme } from "../../data/interfaces";
import AppText from "../atoms/AppText";

type ProgramCardProps = {
  program: Scheme;
  onPress?: () => void;
};

export default function ProgramCard({ program, onPress }: ProgramCardProps) {
  const [isPressed, setIsPressed] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
    >
      <View
        style={{
          marginBottom: 16,
          borderRadius: 16,
          overflow: "hidden",
          backgroundColor: "#FFFFFF",
          borderWidth: 1,
          borderColor: "#E5E7EB",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 3,
          transform: [{ scale: isPressed ? 0.98 : 1 }],
        }}
      >
        {/* Large Image */}
        <View style={{ position: "relative" }}>
          <Image
            source={{ uri: program.imageUrl || "https://via.placeholder.com/400x200/386641/FFFFFF?text=Program" }}
            style={{ width: "100%", height: 180 }}
            resizeMode="cover"
          />
          {/* Category Badge */}
          <View
            style={{
              position: "absolute",
              top: 12,
              left: 12,
              backgroundColor: "rgba(56, 102, 65, 0.9)",
              borderRadius: 20,
              paddingHorizontal: 12,
              paddingVertical: 6,
            }}
          >
            <AppText
              variant="bodySm"
              style={{ color: "#FFFFFF", fontWeight: "600", fontSize: 12 }}
            >
              {program.category}
            </AppText>
          </View>
          {/* Bookmark Icon */}
          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              setIsBookmarked(!isBookmarked);
            }}
            style={{
              position: "absolute",
              top: 12,
              right: 12,
              backgroundColor: "#FFFFFF",
              borderRadius: 20,
              padding: 8,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
              elevation: 2,
            }}
          >
            <Ionicons
              name={isBookmarked ? "bookmark" : "bookmark-outline"}
              size={20}
              color={isBookmarked ? "#386641" : "#1F2937"}
            />
          </Pressable>
        </View>

        {/* Content */}
        <View style={{ padding: 16 }}>
          <AppText
            variant="bodyMd"
            style={{
              marginBottom: 10,
              color: "#1F2937",
              fontWeight: "700",
              fontSize: 17,
              lineHeight: 24,
            }}
            numberOfLines={2}
          >
            {program.title}
          </AppText>

          {/* Description */}
          {program.description && (
            <AppText
              variant="bodySm"
              style={{
                color: "#6B7280",
                fontSize: 14,
                lineHeight: 20,
                marginBottom: 12,
              }}
              numberOfLines={2}
            >
              {program.description}
            </AppText>
          )}

          {/* Meta Info Row */}
          <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
            {/* Location */}
            {program.location && (
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Ionicons name="location-outline" size={16} color="#386641" />
                <AppText
                  variant="bodySm"
                  style={{ marginLeft: 4, color: "#6B7280", fontSize: 13 }}
                >
                  {program.location}
                </AppText>
              </View>
            )}

            {/* Date */}
            {program.date && (
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Ionicons name="calendar-outline" size={16} color="#386641" />
                <AppText
                  variant="bodySm"
                  style={{ marginLeft: 4, color: "#6B7280", fontSize: 13 }}
                >
                  {program.date}
                </AppText>
              </View>
            )}
          </View>
        </View>
      </View>
    </Pressable>
  );
}

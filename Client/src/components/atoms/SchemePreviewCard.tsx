// src/components/molecules/SchemePreviewCard.tsx
import { Ionicons } from "@expo/vector-icons";
import { Image, Pressable, View, TouchableOpacity } from "react-native";
import { useState } from "react";
import { colors } from "../../styles/colors";
import AppText from "../atoms/AppText";
import Card from "../atoms/Card";

type SchemePreviewCardProps = {
  title: string;
  description: string;
  category: string;
  imageUrl?: string;
  onPress?: () => void;
  showBookmark?: boolean;
};

export default function SchemePreviewCard({
  title,
  description,
  category,
  imageUrl,
  onPress,
  showBookmark = true,
}: SchemePreviewCardProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);

  return (
    <Pressable onPress={onPress}>
      <Card className="mb-4 p-4 bg-white rounded-2xl shadow-sm border border-neutral-border">
        {/* Title and Bookmark Row */}
        <View className="flex-row justify-between items-start mb-2">
          <AppText 
            variant="h3" 
            className="text-[#386641] font-semibold flex-1 pr-2"
            numberOfLines={2}
          >
            {title}
          </AppText>
          {showBookmark && (
            <TouchableOpacity 
              onPress={() => setIsBookmarked(!isBookmarked)}
              className="p-1"
            >
              <Ionicons
                name={isBookmarked ? "bookmark" : "bookmark-outline"}
                size={22}
                color={isBookmarked ? "#386641" : "#9E9E9E"}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Description */}
        <AppText
          variant="bodyMd"
          numberOfLines={3}
          ellipsizeMode="tail"
          className="text-neutral-textMedium leading-5 mb-3"
        >
          {description}
        </AppText>

        {/* Category Badge */}
        <View className="flex-row items-center">
          <View className="bg-[#F0FDF4] px-3 py-1 rounded-full">
            <AppText
              variant="caption"
              className="text-[#386641] font-medium"
            >
              {category}
            </AppText>
          </View>
        </View>
      </Card>
    </Pressable>
  );
}

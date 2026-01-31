// src/components/molecules/SchemePreviewCard.tsx
import { Ionicons } from "@expo/vector-icons";
import { Image, Pressable, View } from "react-native";
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
};

export default function SchemePreviewCard({
  title,
  description,
  category,
  imageUrl,
  onPress,
}: SchemePreviewCardProps) {
  const [isTruncated, setIsTruncated] = useState(false);

  return (
    <Pressable onPress={onPress}>
      <Card className="mb-3 p-4">
        <View className="flex-row">
          {/* Image */}
          {imageUrl && (
            <Image
              source={{ uri: imageUrl }}
              className="w-16 h-16 rounded-lg mr-4"
              resizeMode="cover"
            />
          )}

          {/* Content */}
          <View className="flex-1">
            <AppText variant="h3" className="mb-1 text-[#386641]">
              {title}
            </AppText>

            {/* Description */}
            <AppText
              variant="bodyMd"
              numberOfLines={2}
              ellipsizeMode="tail"
              onTextLayout={(e) => {
                if (e.nativeEvent.lines.length > 2) {
                  setIsTruncated(true);
                }
              }}
              className="text-neutral-textMedium"
            >
              {description}
            </AppText>

            {/* Read more */}
            {isTruncated && (
              <AppText
                variant="caption"
                className="text-primary mt-1"
              >
                Read more
              </AppText>
            )}

            {/* Footer */}
            <View className="flex-row items-center justify-between mt-2">
              <View className="flex-row items-center">
                <Ionicons
                  name="pricetag-outline"
                  size={12}
                  color={colors.primary.green}
                />
                <AppText
                  variant="caption"
                  className="ml-1 text-neutral-textMedium"
                >
                  {category}
                </AppText>
              </View>

              <Ionicons
                name="chevron-forward"
                size={18}
                color={colors.neutral.textLight}
              />
            </View>
          </View>
        </View>
      </Card>
    </Pressable>
  );
}

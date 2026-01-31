// src/components/molecules/SchemePreviewCard.tsx
import { Ionicons } from "@expo/vector-icons";
import { Image, Pressable, View } from "react-native";
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
  return (
    <Pressable onPress={onPress}>
      <Card className="mb-3 p-4">
        <View className="flex-row items-start">
          {/* Image Section */}
          {imageUrl && (
            <View className="mr-7">
              <Image
                source={{ uri: imageUrl }}
                className="w-16 h-16 rounded-lg"
                resizeMode="cover"
              />
            </View>
          )}

          {/* Content Section */}
          <View className="flex-1">
            <AppText
              variant="h1"
              className="text-xl font-bold text-neutral-textDark mb-1"
            >
              {title}
            </AppText>
            <AppText
              variant="bodySm"
              className="pl-1 text-sm text-neutral-textMedium mb-2"
            >
              {description}
            </AppText>
            <View className="flex-row items-center justify-between pl-4">
              <View className="flex-row items-center">
                <Ionicons
                  name="pricetag-outline"
                  size={10}
                  color={colors.primary.green}
                />
                <AppText
                  variant="caption"
                  className="text-neutral-textMedium ml-1 text-sm"
                >
                  {category}
                </AppText>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.neutral.textLight}
              />
            </View>
          </View>
        </View>
      </Card>
    </Pressable>
  );
}

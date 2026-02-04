// src/components/atoms/CategoryCard.tsx
import { Ionicons } from "@expo/vector-icons";
import { Pressable, View } from "react-native";
import AppText from "./AppText";
import Card from "./Card";

type CategoryCardProps = {
  title: string;
  count: number;
  icon: keyof typeof import("@expo/vector-icons").Ionicons.glyphMap;
  onPress?: () => void;
};

export default function CategoryCard({
  title,
  count,
  icon,
  onPress,
}: CategoryCardProps) {
  return (
    <Pressable onPress={onPress}>
      <Card className="mb-3 p-4">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            <View className="w-10 h-10 bg-primary-green/10 rounded-lg items-center justify-center mr-3">
              <Ionicons name={icon} size={20} color="#386641" />
            </View>
            <View className="flex-1">
              <AppText variant="bodyMd" className="font-semibold text-neutral-textDark">
                {title}
              </AppText>
              <AppText variant="caption" className="text-neutral-textMedium">
                {count} schemes
              </AppText>
            </View>
          </View>
          <Ionicons
            name="chevron-forward"
            size={18}
            color="#9CA3AF"
          />
        </View>
      </Card>
    </Pressable>
  );
}
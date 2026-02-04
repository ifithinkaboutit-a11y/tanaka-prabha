// src/components/molecules/ProgramCard.tsx
import { Ionicons } from "@expo/vector-icons";
import { Image, Pressable, View } from "react-native";
import { Scheme } from "../../data/interfaces";
import { colors } from "../../styles/colors";
import AppText from "../atoms/AppText";

type ProgramCardProps = {
  program: Scheme;
  onPress?: () => void;
};

export default function ProgramCard({ program, onPress }: ProgramCardProps) {
  return (
    <Pressable onPress={onPress}>
      <View className="mb-4 rounded-2xl overflow-hidden bg-white shadow-sm">
        {/* Large Image */}
        <View className="relative">
          <Image
            source={{ uri: program.imageUrl }}
            className="w-full h-40"
            resizeMode="cover"
          />
          {/* Bookmark Icon */}
          <View className="absolute top-3 right-3 bg-white rounded-full p-2">
            <Ionicons name="bookmark-outline" size={20} color="#1F2937" />
          </View>
        </View>

        {/* Content */}
        <View className="p-4">
          <AppText
            variant="bodyMd"
            className="mb-2 text-neutral-textDark font-semibold"
          >
            {program.title}
          </AppText>

          {/* Location */}
          {program.location && (
            <View className="flex-row items-center mb-1">
              <Ionicons
                name="location-outline"
                size={14}
                color={colors.neutral.textMedium}
              />
              <AppText
                variant="bodySm"
                className="ml-1 text-neutral-textMedium flex-1"
              >
                {program.location}
              </AppText>
            </View>
          )}

          {/* Date */}
          {program.date && (
            <View className="flex-row items-center">
              <Ionicons
                name="calendar-outline"
                size={14}
                color={colors.neutral.textMedium}
              />
              <AppText
                variant="bodySm"
                className="ml-1 text-neutral-textMedium"
              >
                {program.date}
              </AppText>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

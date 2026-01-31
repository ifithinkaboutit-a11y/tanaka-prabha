// src/components/molecules/ProgramCard.tsx
import { Ionicons } from "@expo/vector-icons";
import { Image, Pressable, View } from "react-native";
import { colors } from "../../styles/colors";
import AppText from "../atoms/AppText";
import Card from "../atoms/Card";
import { Scheme } from "../../data/interfaces";

type ProgramCardProps = {
  program: Scheme;
  onPress?: () => void;
};

export default function ProgramCard({ program, onPress }: ProgramCardProps) {
  return (
    <Pressable onPress={onPress}>
      <Card className="mb-4 p-0 overflow-hidden">
        {/* Large Image */}
        <Image
          source={{ uri: program.imageUrl }}
          className="w-full h-48"
          resizeMode="cover"
        />

        {/* Content */}
        <View className="p-4">
          <AppText variant="h3" className="mb-2 text-neutral-textDark">
            {program.title}
          </AppText>

          {/* Location */}
          {program.location && (
            <View className="flex-row items-center mb-2">
              <Ionicons
                name="location-outline"
                size={16}
                color={colors.neutral.textMedium}
              />
              <AppText
                variant="bodySm"
                className="ml-1 text-neutral-textMedium"
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
                size={16}
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
      </Card>
    </Pressable>
  );
}
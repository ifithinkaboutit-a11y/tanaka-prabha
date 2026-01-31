// src/components/molecules/QuickActionGrid.tsx
import { Ionicons } from "@expo/vector-icons";
import { Pressable, View } from "react-native";
import AppText from "../atoms/AppText";
import Card from "../atoms/Card";

type QuickActionItem = {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
};

type QuickActionGridProps = {
  actions?: QuickActionItem[];
};

const defaultActions: QuickActionItem[] = [
  {
    title: "Update your profile",
    icon: "person-outline",
  },
  {
    title: "Ongoing Events",
    icon: "calendar-outline",
  },
  {
    title: "Government Schemes",
    icon: "document-text-outline",
  },
  {
    title: "Book an Appointment",
    icon: "call-outline",
  },
];

export default function QuickActionGrid({
  actions = defaultActions,
}: QuickActionGridProps) {
  return (
    <View className="flex-row flex-wrap justify-between mt-4">
      {actions.map((action, index) => (
        <View key={index} className="w-[48%] mb-4">
          <Pressable onPress={action.onPress}>
            <Card className="items-center justify-center h-48 p-4">
              <Ionicons name={action.icon} size={28} color="#386641" />
              <AppText variant="bodySm" className="mt-2 text-center">
                {action.title}
              </AppText>
            </Card>
          </Pressable>
        </View>
      ))}
    </View>
  );
}

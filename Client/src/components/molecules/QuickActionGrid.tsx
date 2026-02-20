// src/components/molecules/QuickActionGrid.tsx
import { Ionicons } from "@expo/vector-icons";
import { Pressable, View } from "react-native";
import AppText from "../atoms/AppText";

type QuickActionItem = {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  bgColor?: string;
  onPress?: () => void;
};

type QuickActionGridProps = {
  actions?: QuickActionItem[];
};

const defaultActions: QuickActionItem[] = [
  {
    title: "Update your profile",
    icon: "person",
    iconColor: "#2563EB",
    bgColor: "#DBEAFE",
  },
  {
    title: "Ongoing Events",
    icon: "calendar",
    iconColor: "#7C3AED",
    bgColor: "#EDE9FE",
  },
  {
    title: "Government Schemes",
    icon: "document-text",
    iconColor: "#059669",
    bgColor: "#D1FAE5",
  },
  {
    title: "Book an Appointment",
    icon: "call",
    iconColor: "#DC2626",
    bgColor: "#FEE2E2",
  },
];

export default function QuickActionGrid({
  actions = defaultActions,
}: QuickActionGridProps) {
  return (
    <View className="flex-row flex-wrap gap-3">
      {actions.map((action, index) => (
        <Pressable
          key={index}
          onPress={action.onPress}
          className="bg-white rounded-[20px] py-5 px-4 items-center justify-center border border-gray-100 shadow-sm elevation-3 active:opacity-80 active:scale-[0.98]"
          style={{ width: "47%" }}
        >
          {/* Icon Circle */}
          <View
            className="w-18 h-18 rounded-full items-center justify-center mb-3.5"
            style={{ backgroundColor: action.bgColor || "#F0F9FF" }}
          >
            <Ionicons
              name={action.icon}
              size={36}
              color={action.iconColor || "#386641"}
            />
          </View>

          {/* Title */}
          <AppText
            variant="bodySm"
            className="text-center text-[14px] font-semibold text-gray-800 leading-5"
            numberOfLines={2}
          >
            {action.title}
          </AppText>
        </Pressable>
      ))}
    </View>
  );
}
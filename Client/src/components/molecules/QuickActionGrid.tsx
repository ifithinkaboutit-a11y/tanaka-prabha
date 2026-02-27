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
  const rows = [actions.slice(0, 2), actions.slice(2, 4)];

  return (
    <View className="flex-col gap-4">
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} className="flex-row gap-2 mx-auto max-w-[80%] flex items-center justify-center">
          {row.map((action, colIndex) => (
            <Pressable
              key={colIndex}
              onPress={action.onPress}
              style={({ pressed }) => ({
                flex: 1,
                opacity: pressed ? 0.85 : 1,
                transform: [{ scale: pressed ? 0.96 : 1 }],
              })}
              className="w-44 h-40"
            >
              <View
                className="flex-1 bg-white rounded-2xl items-center justify-center p-4 border border-gray-100 elevation-4"
                style={{
                  shadowColor: action.iconColor ?? "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.1,
                  shadowRadius: 12,
                }}
              >
                {/* Icon Circle */}
                <View
                  className="w-14 h-14 rounded-full items-center justify-center mb-3 elevation-4"
                  style={{
                    backgroundColor: action.bgColor ?? "#F3F4F6",
                    shadowColor: action.iconColor,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.25,
                    shadowRadius: 8,
                  }}
                >
                  <Ionicons
                    name={action.icon}
                    size={26}
                    color={action.iconColor ?? "#386641"}
                  />
                </View>

                {/* Title */}
                <AppText
                  variant="bodyMd"
                  className="text-center text-gray-800 font-bold text-[13px] leading-[18px] align-center"
                  numberOfLines={3}
                >
                  {action.title}
                </AppText>
              </View>
            </Pressable>
          ))}
        </View>
      ))}
    </View>
  );
}
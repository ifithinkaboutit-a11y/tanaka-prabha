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
  { title: "Update your profile",  icon: "person",        iconColor: "#2563EB", bgColor: "#DBEAFE" },
  { title: "Ongoing Events",       icon: "calendar",      iconColor: "#7C3AED", bgColor: "#EDE9FE" },
  { title: "Government Schemes",   icon: "document-text", iconColor: "#059669", bgColor: "#D1FAE5" },
  { title: "Book an Appointment",  icon: "call",          iconColor: "#DC2626", bgColor: "#FEE2E2" },
];

export default function QuickActionGrid({ actions = defaultActions }: QuickActionGridProps) {
  const rows = [actions.slice(0, 2), actions.slice(2, 4)];

  return (
    <View className="flex-col gap-4 px-6">
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} className="flex-row gap-3">
          {row.map((action, colIndex) => (
            <Pressable
              key={colIndex}
              onPress={action.onPress}
              className="flex-1 aspect-square active:opacity-85 active:scale-95"
            >
              <View
                className="flex-1 bg-white rounded-[20px] items-center justify-center p-8 border border-gray-100"
                style={{
                  shadowColor: action.iconColor ?? "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.1,
                  shadowRadius: 12,
                  elevation: 4,
                }}
              >
                {/* Icon Circle */}
                <View
                  className="w-[74px] h-[74px] rounded-[32px] items-center justify-center mb-4"
                  style={{ backgroundColor: action.bgColor ?? "#F3F4F6" }}
                >
                  <Ionicons
                    name={action.icon}
                    size={50}
                    color={action.iconColor ?? "#386641"}
                  />
                </View>

                {/* Title */}
                <AppText
                  numberOfLines={2}
                  style={{ textAlign: "center", color: "#1F2937", fontWeight: "700", fontSize: 17, lineHeight: 22 }}
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
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
    <View
      style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}
    >
      {actions.map((action, index) => (
        <Pressable
          key={index}
          onPress={action.onPress}
          style={({ pressed }) => ({
            width: "47%",
            backgroundColor: "#FFFFFF",
            borderRadius: 20,
            paddingVertical: 20,
            paddingHorizontal: 16,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1,
            borderColor: "#F3F4F6",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.06,
            shadowRadius: 12,
            elevation: 3,
            opacity: pressed ? 0.8 : 1,
            transform: [{ scale: pressed ? 0.98 : 1 }],
          })}
        >
          {/* Icon Circle */}
          <View
            style={{
              width: 72,
              height: 72,
              borderRadius: 36,
              backgroundColor: action.bgColor || "#F0F9FF",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 14,
            }}
          >
            <Ionicons 
              name={action.icon} 
              size={36} 
              color={action.iconColor || "#386641"} 
            />
          </View>

          {/* Title */}
          <AppText
            variant="bodyMd"
            style={{
              textAlign: "center",
              fontSize: 14,
              fontWeight: "600",
              color: "#1F2937",
              lineHeight: 20,
            }}
            numberOfLines={2}
          >
            {action.title}
          </AppText>
        </Pressable>
      ))}
    </View>
  );
}

// src/components/molecules/QuickActionGrid.tsx
import { Ionicons } from "@expo/vector-icons";
import { Pressable, View, useWindowDimensions } from "react-native";
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
  const { width } = useWindowDimensions();
  // 20px horizontal padding on each side + 10px gap between the two cards
  const rows = [actions.slice(0, 2), actions.slice(2, 4)];

  return (
    <View style={{ gap: 16 }}>
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          {row.map((action, colIndex) => (
            <Pressable
              key={colIndex}
              onPress={action.onPress}
              style={({ pressed }) => ({
                width: '48%',
                aspectRatio: 1,
                opacity: pressed ? 0.85 : 1,
                transform: [{ scale: pressed ? 0.96 : 1 }],
              })}
              className="min-w-44 min-h-40"
            >
              <View
                style={{
                  flex: 1,
                  backgroundColor: '#FFFFFF',
                  borderRadius: 20,
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 16,
                  borderWidth: 1,
                  borderColor: '#F3F4F6',
                  shadowColor: action.iconColor ?? "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.1,
                  shadowRadius: 12,
                  elevation: 4,
                }}
              >
                {/* Icon Circle */}
                <View
                  style={{
                    width: 74,
                    height: 74,
                    borderRadius: 32,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 16,
                    backgroundColor: action.bgColor ?? "#F3F4F6",
                  }}
                >
                  <Ionicons
                    name={action.icon}
                    size={42}
                    color={action.iconColor ?? "#386641"}
                  />
                </View>

                {/* Title */}
                <AppText
                  variant="bodyLg"
                  style={{ textAlign: 'center', color: '#1F2937', fontWeight: '700', fontSize: 17, lineHeight: 22 }}
                  numberOfLines={2}
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
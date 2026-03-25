// src/components/molecules/QuickActionGrid.tsx
import { Ionicons } from "@expo/vector-icons";
import { useWindowDimensions, View } from "react-native";
import AppText from "../atoms/AppText";
import AnimatedPressable from "../atoms/AnimatedPressable";

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
  const { width } = useWindowDimensions();

  // Two columns with horizontal padding 24px each side + 12px gap
  const cardWidth = (width - 48 - 12) / 2;
  const iconCircleSize = Math.round(cardWidth * 0.42);
  const iconSize = Math.round(iconCircleSize * 0.52);
  const iconRadius = Math.round(iconCircleSize * 0.36);
  const fontSize = Math.round(cardWidth * 0.1);
  const lineHeight = Math.round(fontSize * 1.35);
  const padding = Math.round(cardWidth * 0.12);

  const rows = [actions.slice(0, 2), actions.slice(2, 4)];

  return (
    <View className="gap-3">
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} className="flex-row gap-3">
          {row.map((action, colIndex) => (
            <AnimatedPressable
              key={colIndex}
              onPress={action.onPress}
              scaleOnPress={0.94}
              style={{
                flex: 1,
                // Tinted shadow using the icon's brand colour
                shadowColor: action.iconColor ?? "#000",
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.12,
                shadowRadius: 14,
                elevation: 5,
                borderRadius: 20,
              }}
            >
              <View
                className="bg-white items-center justify-center border border-gray-100 rounded-[20px]"
                style={{ padding, aspectRatio: 1 }}
              >
                {/* Icon pill */}
                <View
                  className="items-center justify-center mb-3"
                  style={{
                    width: iconCircleSize,
                    height: iconCircleSize,
                    borderRadius: iconRadius,
                    backgroundColor: action.bgColor ?? "#F3F4F6",
                  }}
                >
                  <Ionicons
                    name={action.icon}
                    size={iconSize}
                    color={action.iconColor ?? "#386641"}
                  />
                </View>

                {/* Label */}
                <AppText
                  numberOfLines={2}
                  style={{
                    textAlign: "center",
                    color: "#1F2937",
                    fontWeight: "700",
                    fontSize,
                    lineHeight,
                  }}
                >
                  {action.title}
                </AppText>
              </View>
            </AnimatedPressable>
          ))}
        </View>
      ))}
    </View>
  );
}
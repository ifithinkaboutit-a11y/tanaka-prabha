// src/components/molecules/QuickActionGrid.tsx
import { Ionicons } from "@expo/vector-icons";
import { Image, Pressable, View } from "react-native";
import AppText from "../atoms/AppText";

type QuickActionItem = {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  imageUrl?: string;
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
    <View
      style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 8, gap: 12 }}
    >
      {actions.map((action, index) => (
        <Pressable
          key={index}
          onPress={action.onPress}
          style={({ pressed }) => ({
            width: "48%",
            aspectRatio: 1,
            backgroundColor: "#FFFFFF",
            borderRadius: 16,
            padding: 16,
            alignItems: "center",
            justifyContent: "center",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 2,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          {/* Icon/Image */}
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: "#F0F9FF",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 12,
            }}
          >
            {action.imageUrl ? (
              <Image
                source={{ uri: action.imageUrl }}
                style={{ width: 40, height: 40 }}
                resizeMode="contain"
              />
            ) : (
              <Ionicons name={action.icon} size={32} color="#386641" />
            )}
          </View>

          {/* Title */}
          <AppText
            variant="bodySm"
            style={{
              textAlign: "center",
              fontSize: 13,
              fontWeight: "500",
              color: "#1F2937",
            }}
          >
            {action.title}
          </AppText>
        </Pressable>
      ))}
    </View>
  );
}

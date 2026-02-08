// src/components/molecules/GreetingHeader.tsx
import { Ionicons } from "@expo/vector-icons";
import { Pressable, View } from "react-native";
import { useTranslation } from "../../i18n";
import AppText from "../atoms/AppText";
import Avatar from "../atoms/Avatar";

type GreetingHeaderProps = {
  name: string;
  onNotificationPress?: () => void;
  onAvatarPress?: () => void;
  hasNotifications?: boolean;
};

export default function GreetingHeader({
  name,
  onNotificationPress,
  onAvatarPress,
  hasNotifications = true,
}: GreetingHeaderProps) {
  const { t } = useTranslation();

  const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return t("home.greeting.morning");
    if (hour < 17) return t("home.greeting.afternoon");
    return t("home.greeting.evening");
  };

  const greeting = getGreeting();

  return (
    <View style={{ paddingTop: 52, paddingBottom: 16, paddingHorizontal: 16 }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
          <Pressable onPress={onAvatarPress}>
            <Avatar size="xl" name={name} />
          </Pressable>
          <View>
            <AppText
              variant="bodySm"
              style={{
                fontSize: 14,
                color: "#6B7280",
                marginBottom: 2,
              }}
            >
              {greeting}
            </AppText>
            <AppText
              variant="h2"
              style={{
                fontSize: 20,
                fontWeight: "700",
                color: "#1F2937",
              }}
            >
              {name}
            </AppText>
          </View>
        </View>
        
        {/* Notification Bell */}
        <Pressable
          onPress={onNotificationPress}
          style={({ pressed }) => ({
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: pressed ? "#F3F4F6" : "#FFFFFF",
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1,
            borderColor: "#E5E7EB",
            position: "relative",
          })}
        >
          <Ionicons name="notifications-outline" size={24} color="#1F2937" />
          {hasNotifications && (
            <View
              style={{
                position: "absolute",
                top: 10,
                right: 12,
                width: 10,
                height: 10,
                borderRadius: 5,
                backgroundColor: "#EF4444",
                borderWidth: 2,
                borderColor: "#FFFFFF",
              }}
            />
          )}
        </Pressable>
      </View>
    </View>
  );
}

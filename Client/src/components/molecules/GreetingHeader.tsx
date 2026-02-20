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
    <View style={{ paddingTop: 52, paddingBottom: 20, paddingHorizontal: 20 }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Left side: Avatar + text */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
          <Pressable onPress={onAvatarPress} style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 6,
            elevation: 4,
          }}>
            <Avatar size="xl" name={name} shape="circle"/>
          </Pressable>
          <View>
            <AppText
              variant="bodySm"
              style={{
                fontSize: 14,
                color: "#6B7280",
                marginBottom: 2,
                fontWeight: "500",
              }}
            >
              {greeting}
            </AppText>
            <AppText
              variant="h2"
              style={{
                fontSize: 22,
                fontWeight: "700",
                color: "#111827",
                letterSpacing: -0.3,
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
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: pressed ? "#E5E7EB" : "#F3F4F6",
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1,
            borderColor: "rgba(0,0,0,0.03)",
            position: "relative",
          })}
        >
          <Ionicons name="notifications-outline" size={22} color="#1F2937" />
          {hasNotifications && (
            <View
              style={{
                position: "absolute",
                top: 10,
                right: 12,
                width: 9,
                height: 9,
                borderRadius: 4.5,
                backgroundColor: "#EF4444",
                borderWidth: 1.5,
                borderColor: "#F3F4F6",
              }}
            />
          )}
        </Pressable>
      </View>
    </View>
  );
}

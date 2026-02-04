// src/components/molecules/GreetingHeader.tsx
import { Ionicons } from "@expo/vector-icons";
import { Pressable, View } from "react-native";
import { useTranslation } from "../../i18n";
import AppText from "../atoms/AppText";
import Avatar from "../atoms/Avatar";
import IconButton from "../atoms/IconButton";

type GreetingHeaderProps = {
  name: string;
  onNotificationPress?: () => void;
  onAvatarPress?: () => void;
};

export default function GreetingHeader({
  name,
  onNotificationPress,
  onAvatarPress,
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
    <View style={{ paddingTop: 48, paddingBottom: 12, paddingHorizontal: 16 }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <Pressable onPress={onAvatarPress}>
            <Avatar size="lg" name={name} />
          </Pressable>
          <View>
            <AppText
              variant="bodySm"
              style={{
                fontSize: 13,
                color: "#6B7280",
                marginBottom: 2,
              }}
            >
              {greeting}
            </AppText>
            <AppText
              variant="h2"
              style={{
                fontSize: 18,
                fontWeight: "600",
                color: "#1F2937",
              }}
            >
              {name}
            </AppText>
          </View>
        </View>
        <IconButton onPress={onNotificationPress}>
          <Ionicons name="notifications-outline" size={24} color="#1F2937" />
        </IconButton>
      </View>
    </View>
  );
}

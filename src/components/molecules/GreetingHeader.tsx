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
    <View className="p-4 mt-4">
      <View className="flex-row items-center justify-between p-4 rounded-lg">
        <View className="flex-row items-center gap-3">
          <Pressable onPress={onAvatarPress}>
            <Avatar size="lg" name={name} />
          </Pressable>
          <View>
            <AppText
              variant="h2"
              className="text-md text-neutral-500 leading-tight"
            >
              {greeting}
            </AppText>
            <AppText
              variant="h1"
              className="text-xl font-semibold text-neutral-900 leading-tight"
            >
              {name} Ji
            </AppText>
          </View>
        </View>
        <IconButton onPress={onNotificationPress}>
          <Ionicons name="notifications-outline" size={24} />
        </IconButton>
      </View>
    </View>
  );
}

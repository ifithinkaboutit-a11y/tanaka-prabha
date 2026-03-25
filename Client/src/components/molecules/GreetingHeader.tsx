// src/components/molecules/GreetingHeader.tsx
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import { Animated, View } from "react-native";
import { useTranslation } from "../../i18n";
import AppText from "../atoms/AppText";
import Avatar from "../atoms/Avatar";
import AnimatedPressable from "../atoms/AnimatedPressable";

type GreetingHeaderProps = {
  name: string;
  /** User's photo URL — shows the actual picture in the avatar */
  avatarUri?: string;
  onNotificationPress?: () => void;
  onAvatarPress?: () => void;
  hasNotifications?: boolean;
};

export default function GreetingHeader({
  name,
  avatarUri,
  onNotificationPress,
  onAvatarPress,
  hasNotifications = false,
}: GreetingHeaderProps) {
  const { t } = useTranslation();
  const bellRotate = useRef(new Animated.Value(0)).current;

  const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return t("home.greeting.morning");
    if (hour < 17) return t("home.greeting.afternoon");
    return t("home.greeting.evening");
  };

  // Wiggle the bell when there are unread notifications
  useEffect(() => {
    if (!hasNotifications) return;
    const wiggle = Animated.loop(
      Animated.sequence([
        Animated.timing(bellRotate, { toValue: 1, duration: 80, useNativeDriver: true }),
        Animated.timing(bellRotate, { toValue: -1, duration: 80, useNativeDriver: true }),
        Animated.timing(bellRotate, { toValue: 0.7, duration: 80, useNativeDriver: true }),
        Animated.timing(bellRotate, { toValue: -0.7, duration: 80, useNativeDriver: true }),
        Animated.timing(bellRotate, { toValue: 0, duration: 80, useNativeDriver: true }),
        // Pause between wiggles
        Animated.delay(3000),
      ]),
      { iterations: -1 }
    );
    wiggle.start();
    return () => wiggle.stop();
  }, [hasNotifications, bellRotate]);

  const bellRotateDeg = bellRotate.interpolate({
    inputRange: [-1, 1],
    outputRange: ["-18deg", "18deg"],
  });

  const greeting = getGreeting();

  return (
    <View className="pt-12 pb-5 px-5">
      <View className="flex-row items-center justify-between">
        {/* Left: Avatar + greeting text */}
        <View className="flex-row items-center gap-3 flex-1">
          <AnimatedPressable
            onPress={onAvatarPress}
            scaleOnPress={0.92}
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.12,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Avatar size="xl" uri={avatarUri} name={name} shape="circle" />
          </AnimatedPressable>

          <View className="flex-shrink">
            <AppText
              variant="bodySm"
              className="text-gray-500 font-medium mb-0.5"
              style={{ fontSize: 13 }}
            >
              {greeting}
            </AppText>
            <AppText
              variant="h2"
              style={{
                fontSize: 21,
                fontWeight: "700",
                color: "#111827",
                letterSpacing: -0.3,
              }}
              numberOfLines={1}
            >
              {name}
            </AppText>
          </View>
        </View>

        {/* Right: Notification bell with wiggle */}
        <AnimatedPressable
          onPress={onNotificationPress}
          scaleOnPress={0.88}
          className="relative items-center justify-center rounded-[18px] bg-gray-100"
          style={{ width: 52, height: 52 }}
          accessibilityLabel={hasNotifications ? "Notifications, unread" : "Notifications"}
          accessibilityRole="button"
        >
          <Animated.View style={{ transform: [{ rotate: bellRotateDeg }] }}>
            <Ionicons name="notifications-outline" size={28} color="#1F2937" />
          </Animated.View>

          {/* Pulsing red dot */}
          {hasNotifications && (
            <View
              className="absolute bg-red-500 rounded-full border-2 border-gray-100"
              style={{ width: 11, height: 11, top: 10, right: 10 }}
            />
          )}
        </AnimatedPressable>
      </View>
    </View>
  );
}

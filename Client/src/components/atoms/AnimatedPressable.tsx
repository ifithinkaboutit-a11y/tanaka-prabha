// src/components/atoms/AnimatedPressable.tsx
// Drop-in Pressable replacement with Reanimated spring scale feedback.
// Use className for static Tailwind styles; style for dynamic/computed values.
import React from "react";
import { GestureResponderEvent, ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Pressable } from "react-native";

interface AnimatedPressableProps {
  onPress?: (e: GestureResponderEvent) => void;
  onLongPress?: (e: GestureResponderEvent) => void;
  className?: string;
  style?: ViewStyle | ViewStyle[];
  children: React.ReactNode;
  disabled?: boolean;
  /** Scale to shrink to on press. Default 0.95 */
  scaleOnPress?: number;
  testID?: string;
  accessibilityLabel?: string;
  accessibilityRole?: React.ComponentProps<typeof Pressable>["accessibilityRole"];
  accessibilityHint?: string;
  accessibilityState?: React.ComponentProps<typeof Pressable>["accessibilityState"];
}

export default function AnimatedPressable({
  onPress,
  onLongPress,
  className,
  style,
  children,
  disabled = false,
  scaleOnPress = 0.95,
  testID,
  accessibilityLabel,
  accessibilityRole,
  accessibilityHint,
  accessibilityState,
}: AnimatedPressableProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(scaleOnPress, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 12, stiffness: 300 });
  };

  return (
    <Animated.View style={[animatedStyle, style as ViewStyle]}>
      <Pressable
        onPress={disabled ? undefined : onPress}
        onLongPress={disabled ? undefined : onLongPress}
        onPressIn={disabled ? undefined : handlePressIn}
        onPressOut={disabled ? undefined : handlePressOut}
        className={className}
        testID={testID}
        disabled={disabled}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole={accessibilityRole}
        accessibilityHint={accessibilityHint}
        accessibilityState={accessibilityState}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}

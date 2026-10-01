// src/components/atoms/AnimatedPressable.tsx
// Pressable with a plain opacity press-state, no scale/spring animation.
// PRODUCT.md explicitly rules out micro-animations for this app (trustworthy,
// grounded, government/NGO-service feel — not a startup/consumer app), so
// press feedback here stays a subtle, instant opacity dip rather than a bounce.
// `style` is applied to the outer View (same layering as the original
// reanimated version) so flex/layout props (e.g. flex: 1 in a row of cards)
// behave identically to before — putting them on the Pressable's functional
// style prop instead broke width-filling layouts.
// Use className for static Tailwind styles; style for dynamic/computed values.
import React from "react";
import { GestureResponderEvent, Pressable, View, ViewStyle } from "react-native";

interface AnimatedPressableProps {
  onPress?: (e: GestureResponderEvent) => void;
  onLongPress?: (e: GestureResponderEvent) => void;
  className?: string;
  style?: ViewStyle | ViewStyle[];
  children: React.ReactNode;
  disabled?: boolean;
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
  testID,
  accessibilityLabel,
  accessibilityRole,
  accessibilityHint,
  accessibilityState,
}: AnimatedPressableProps) {
  return (
    <View style={style as ViewStyle}>
      <Pressable
        onPress={disabled ? undefined : onPress}
        onLongPress={disabled ? undefined : onLongPress}
        className={className}
        style={(state) => (state.pressed && !disabled ? { opacity: 0.75 } : undefined)}
        testID={testID}
        disabled={disabled}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole={accessibilityRole}
        accessibilityHint={accessibilityHint}
        accessibilityState={accessibilityState}
      >
        {children}
      </Pressable>
    </View>
  );
}

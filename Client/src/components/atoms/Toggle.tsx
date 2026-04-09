// src/components/atoms/Toggle.tsx
// Adapted from uiverse.io/mrhyddenn
import React, { useEffect, useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { theme } from "../../styles/colors";

// Dimensions matching the CSS (62px × 35px at 1:1, font-size=17px base)
const TRACK_W = 62;
const TRACK_H = 35;
// thumb = 1.9em × 17 ≈ 32px, travel = 1.5em × 17 ≈ 25.5
const THUMB = 32;
const TRAVEL = 25.5;

interface ToggleProps {
  label?: string;
  value?: boolean;
  checked?: boolean;
  onChange?: (v: boolean) => void;
  onValueChange?: (v: boolean) => void;
  disabled?: boolean;
}

export default function Toggle({
  label,
  value,
  checked,
  onChange,
  onValueChange,
  disabled = false,
}: ToggleProps) {
  const on = checked ?? value ?? false;

  const thumbX = useRef(new Animated.Value(on ? TRAVEL : 0)).current;
  const trackColor = useRef(new Animated.Value(on ? 1 : 0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(thumbX, {
        toValue: on ? TRAVEL : 0,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(trackColor, {
        toValue: on ? 1 : 0,
        duration: 400,
        useNativeDriver: false,
      }),
    ]).start();
  }, [on]);

  const fire = () => {
    if (disabled) return;
    const next = !on;
    onValueChange?.(next);
    onChange?.(next);
  };

  const bg = trackColor.interpolate({
    inputRange: [0, 1],
    outputRange: [theme.background.input, theme.semantic.success],
  });

  const borderColor = trackColor.interpolate({
    inputRange: [0, 1],
    outputRange: [theme.border.card, theme.semantic.success],
  });

  return (
    <View style={[s.row, disabled && { opacity: 0.45 }]}>
      {label ? <Text style={s.label}>{label}</Text> : null}

      <Pressable
        onPress={fire}
        accessibilityRole="switch"
        accessibilityState={{ checked: on, disabled }}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Animated.View style={[s.track, { backgroundColor: bg, borderColor }]}>
          <Animated.View
            style={[
              s.thumb,
              { transform: [{ translateX: thumbX }] },
            ]}
          />
        </Animated.View>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  label: {
    flex: 1,
    fontSize: 15,
    color: theme.text.secondary,
    fontWeight: "500",
    marginRight: 12,
  },
  track: {
    width: TRACK_W,
    height: TRACK_H,
    borderRadius: 30,
    borderWidth: 1,
    justifyContent: "center",
    paddingLeft: 1.2,
  },
  thumb: {
    width: THUMB,
    height: THUMB,
    borderRadius: 16,
    backgroundColor: theme.background.input,
    shadowColor: theme.text.light,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 2.5,
    elevation: 3,
  },
});

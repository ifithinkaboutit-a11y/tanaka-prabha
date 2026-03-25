// src/components/atoms/Toggle.tsx
import React, { useEffect, useRef } from "react";
import { Animated, Pressable, Text, View } from "react-native";

// Track dimensions
const TRACK_WIDTH = 52;
const TRACK_HEIGHT = 30;
const THUMB_SIZE = 24;
const TRACK_PADDING = 3;
const THUMB_TRAVEL = TRACK_WIDTH - THUMB_SIZE - TRACK_PADDING * 2; // 22

interface ToggleProps {
  label?: string;
  value?: boolean;
  checked?: boolean;
  onChange?: (value: boolean) => void;
  onValueChange?: (value: boolean) => void;
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
  const currentValue = checked ?? value ?? false;

  const thumbAnim = useRef(new Animated.Value(currentValue ? THUMB_TRAVEL : 0)).current;

  useEffect(() => {
    Animated.timing(thumbAnim, {
      toValue: currentValue ? THUMB_TRAVEL : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [currentValue, thumbAnim]);

  const handleToggle = () => {
    if (disabled) return;
    const newValue = !currentValue;
    onValueChange?.(newValue);
    onChange?.(newValue);
  };

  return (
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 8 }}>
      {label ? (
        <Text style={{ color: "#212121", fontSize: 16, flex: 1 }}>{label}</Text>
      ) : null}

      <Pressable
        onPress={disabled ? undefined : handleToggle}
        accessibilityRole="switch"
        accessibilityState={{ checked: currentValue }}
        style={{
          width: TRACK_WIDTH,
          height: TRACK_HEIGHT,
          borderRadius: TRACK_HEIGHT / 2,
          padding: TRACK_PADDING,
          justifyContent: "center",
          backgroundColor: currentValue ? "#386641" : "#FFFFFF",
          borderColor: currentValue ? "#386641" : "#E5E7EB",
          borderWidth: 1,
          opacity: disabled ? 0.45 : 1,
          minWidth: 44,
          minHeight: 44,
          alignItems: "center",
        }}
      >
        <Animated.View
          style={{
            width: THUMB_SIZE,
            height: THUMB_SIZE,
            borderRadius: THUMB_SIZE / 2,
            backgroundColor: "#FFFFFF",
            transform: [{ translateX: thumbAnim }],
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.15,
            shadowRadius: 2,
            elevation: 2,
            borderWidth: currentValue ? 0 : 1,
            borderColor: "#E5E7EB",
          }}
        />
      </Pressable>
    </View>
  );
}

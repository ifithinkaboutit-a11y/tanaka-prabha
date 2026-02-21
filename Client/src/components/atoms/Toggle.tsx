// src/components/atoms/Toggle.tsx
import React from "react";
import { Pressable, Text, View } from "react-native";

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

  const handleToggle = () => {
    if (disabled) return;
    const newValue = !currentValue;
    onValueChange?.(newValue);
    onChange?.(newValue);
  };

  return (
    <View className="flex-row items-center justify-between py-2">
      {label ? (
        <Text className="text-[#212121] text-base flex-1">{label}</Text>
      ) : null}

      <Pressable
        onPress={handleToggle}
        className="w-13 h-8 rounded-2xl p-1 justify-center"
        style={{
          backgroundColor: currentValue ? "#386641" : "#FFFFFF",
          borderColor: currentValue ? "#386641" : "#E5E7EB",
          borderWidth: 1,
          opacity: disabled ? 0.5 : 1,
        }}
      >
        <View
          className="w-6 h-6 rounded-full elevation-2"
          style={{
            backgroundColor: currentValue ? "#FFFFFF" : "#FFFFFF",
            alignSelf: currentValue ? "flex-end" : "flex-start",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.15,
            shadowRadius: 2,
            borderWidth: currentValue ? 0 : 1,
            borderColor: "#E5E7EB",
          }}
        />
      </Pressable>
    </View>
  );
}
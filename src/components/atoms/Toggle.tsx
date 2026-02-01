// src/components/atoms/Toggle.tsx
import React from "react";
import { Pressable, Text, View } from "react-native";

interface ToggleProps {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}

export default function Toggle({
  label,
  value,
  onChange,
  disabled = false,
}: ToggleProps) {
  return (
    <View className="flex-row items-center justify-between py-2">
      <Text className="text-neutral-textDark text-base flex-1">{label}</Text>

      <Pressable
        onPress={() => !disabled && onChange(!value)}
        className={`w-14 h-8 rounded-full p-1 ${
          value ? "bg-primary" : "bg-neutral-border"
        } ${disabled ? "opacity-50" : ""}`}
      >
        <View
          className={`w-6 h-6 rounded-full bg-white shadow-sm ${
            value ? "ml-auto" : "ml-0"
          }`}
        />
      </Pressable>
    </View>
  );
}

// src/components/atoms/Toggle.tsx
import React from "react";
import { Pressable, Text, View } from "react-native";

interface ToggleProps {
  label?: string;
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}

// Color constants
const COLORS = {
  primary: "#386641",
  border: "#D9D9D9",
  white: "#FFFFFF",
  textDark: "#212121",
};

export default function Toggle({
  label,
  value,
  onChange,
  disabled = false,
}: ToggleProps) {
  return (
    <View style={label ? { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 8 } : undefined}>
      {label && (
        <Text style={{ color: COLORS.textDark, fontSize: 16, flex: 1 }}>
          {label}
        </Text>
      )}

      <Pressable
        onPress={() => !disabled && onChange(!value)}
        style={{
          width: 56,
          height: 32,
          borderRadius: 16,
          padding: 4,
          backgroundColor: value ? COLORS.primary : COLORS.border,
          opacity: disabled ? 0.5 : 1,
          justifyContent: "center",
        }}
      >
        <View
          style={{
            width: 24,
            height: 24,
            borderRadius: 12,
            backgroundColor: COLORS.white,
            alignSelf: value ? "flex-end" : "flex-start",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.15,
            shadowRadius: 2,
            elevation: 2,
          }}
        />
      </Pressable>
    </View>
  );
}

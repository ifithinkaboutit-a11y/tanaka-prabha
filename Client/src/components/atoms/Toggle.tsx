// src/components/atoms/Toggle.tsx
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface ToggleProps {
  label?: string;
  value: boolean;
  onChange?: (value: boolean) => void;
  onValueChange?: (value: boolean) => void;
  disabled?: boolean;
}

export default function Toggle({
  label,
  value,
  onChange,
  onValueChange,
  disabled = false,
}: ToggleProps) {
  const handleToggle = () => {
    if (disabled) return;
    const newValue = !value;
    onValueChange?.(newValue);
    onChange?.(newValue);
  };

  return (
    <View style={s.row}>
      {label ? <Text style={s.label}>{label}</Text> : null}

      <Pressable
        onPress={handleToggle}
        style={[
          s.track,
          { backgroundColor: value ? "#386641" : "#D9D9D9" },
          disabled && { opacity: 0.5 },
        ]}
      >
        <View
          style={[
            s.thumb,
            { alignSelf: value ? "flex-end" : "flex-start" },
          ]}
        />
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  label: {
    color: "#212121",
    fontSize: 16,
    flex: 1,
  },
  track: {
    width: 52,
    height: 32,
    borderRadius: 16,
    padding: 4,
    justifyContent: "center",
  },
  thumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
});

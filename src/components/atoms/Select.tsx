// src/components/atoms/Select.tsx
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    Modal,
    Pressable,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { colors } from "../../styles/colors";

interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps {
  label?: string;
  placeholder?: string;
  value?: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
}

export default function Select({
  label,
  placeholder = "Select...",
  value,
  options,
  onChange,
  disabled = false,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <View className="mb-4">
      {label && (
        <Text className="text-neutral-textMedium text-sm mb-2">{label}</Text>
      )}

      <Pressable
        onPress={() => !disabled && setIsOpen(true)}
        className={`flex-row items-center justify-between border border-neutral-border rounded-xl px-4 py-4 bg-white ${
          disabled ? "opacity-50" : ""
        }`}
      >
        <Text
          className={`text-base ${
            selectedOption ? "text-neutral-textDark" : "text-neutral-textLight"
          }`}
        >
          {selectedOption?.label || placeholder}
        </Text>
        <Ionicons
          name="chevron-down"
          size={20}
          color={colors.neutral.textLight}
        />
      </Pressable>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <Pressable
          className="flex-1 bg-black/50 justify-end"
          onPress={() => setIsOpen(false)}
        >
          <View className="bg-white rounded-t-3xl max-h-[60%]">
            <View className="p-4 border-b border-neutral-border">
              <Text className="text-lg font-semibold text-center">
                {label || "Select"}
              </Text>
            </View>

            <ScrollView className="p-4">
              {options.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`flex-row items-center justify-between py-4 px-2 border-b border-neutral-border ${
                    value === option.value ? "bg-primary/10" : ""
                  }`}
                >
                  <Text
                    className={`text-base ${
                      value === option.value
                        ? "text-primary font-semibold"
                        : "text-neutral-textDark"
                    }`}
                  >
                    {option.label}
                  </Text>
                  {value === option.value && (
                    <Ionicons
                      name="checkmark"
                      size={20}
                      color={colors.primary.green}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

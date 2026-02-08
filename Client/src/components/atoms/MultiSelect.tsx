// src/components/atoms/MultiSelect.tsx
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

interface MultiSelectProps {
  label?: string;
  placeholder?: string;
  values: string[];
  options: SelectOption[];
  onChange: (values: string[]) => void;
  disabled?: boolean;
}

export default function MultiSelect({
  label,
  placeholder = "Select Multiple...",
  values = [],
  options,
  onChange,
  disabled = false,
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOptions = options.filter((opt) => values.includes(opt.value));
  const displayText =
    selectedOptions.length > 0
      ? selectedOptions.map((o) => o.label).join(", ")
      : placeholder;

  const handleToggleOption = (optionValue: string) => {
    if (values.includes(optionValue)) {
      onChange(values.filter((v) => v !== optionValue));
    } else {
      onChange([...values, optionValue]);
    }
  };

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
          className={`text-base flex-1 ${
            selectedOptions.length > 0
              ? "text-neutral-textDark"
              : "text-neutral-textLight"
          }`}
          numberOfLines={1}
        >
          {displayText}
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
            <View className="p-4 border-b border-neutral-border flex-row justify-between items-center">
              <Text className="text-lg font-semibold">{label || "Select"}</Text>
              <TouchableOpacity onPress={() => setIsOpen(false)}>
                <Ionicons name="checkmark" size={24} color={colors.primary.green} />
              </TouchableOpacity>
            </View>

            <ScrollView className="p-4">
              {options.map((option) => {
                const isSelected = values.includes(option.value);
                return (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() => handleToggleOption(option.value)}
                    className={`flex-row items-center justify-between py-4 px-2 border-b border-neutral-border ${
                      isSelected ? "bg-primary/10" : ""
                    }`}
                  >
                    <Text
                      className={`text-base ${
                        isSelected
                          ? "text-primary font-semibold"
                          : "text-neutral-textDark"
                      }`}
                    >
                      {option.label}
                    </Text>
                    <View
                      className={`w-6 h-6 rounded-md border-2 items-center justify-center ${
                        isSelected
                          ? "bg-primary border-primary"
                          : "border-neutral-border"
                      }`}
                    >
                      {isSelected && (
                        <Ionicons name="checkmark" size={16} color="white" />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

// src/components/atoms/Select.tsx
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    Modal,
    Pressable,
    ScrollView,
    TouchableOpacity,
    View,
} from "react-native";
import { colors } from "../../styles/colors";
import AppText from "./AppText";

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
        <AppText variant="bodySm" className="text-neutral-textMedium mb-2 font-medium">
          {label}
        </AppText>
      )}

      <Pressable
        onPress={() => !disabled && setIsOpen(true)}
        className={`flex-row items-center justify-between border border-neutral-border rounded-xl px-4 py-3.5 bg-white ${
          disabled ? "opacity-50" : ""
        }`}
      >
        <AppText
          variant="bodyMd"
          className={
            selectedOption ? "text-neutral-textDark" : "text-neutral-textLight"
          }
        >
          {selectedOption?.label || placeholder}
        </AppText>
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
          {/* Stop propagation when tapping the modal content */}
          <Pressable 
            className="bg-white rounded-t-3xl max-h-[60%] w-full" 
            onPress={(e) => e.stopPropagation()}
          >
            <View className="p-4 border-b border-neutral-border flex-row justify-between items-center bg-gray-50 rounded-t-3xl">
              <View className="w-6" /> 
              <AppText variant="h3" className="font-semibold text-center text-neutral-textDark">
                {label || "Select Option"}
              </AppText>
              <TouchableOpacity onPress={() => setIsOpen(false)}>
                 <Ionicons name="close" size={24} color={colors.neutral.textDark} />
              </TouchableOpacity>
            </View>

            <ScrollView className="p-4" contentContainerStyle={{ paddingBottom: 20 }}>
              {options.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`flex-row items-center justify-between py-4 px-2 border-b border-gray-100 ${
                    value === option.value ? "bg-primary-50 rounded-lg" : ""
                  }`}
                >
                  <AppText
                    variant="bodyMd"
                    className={
                      value === option.value
                        ? "text-primary font-semibold"
                        : "text-neutral-textDark"
                    }
                  >
                    {option.label}
                  </AppText>
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
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

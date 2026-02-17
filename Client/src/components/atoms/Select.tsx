// src/components/atoms/Select.tsx
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
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
    <View style={s.container}>
      {label && (
        <AppText
          variant="bodySm"
          style={{ color: colors.neutral.textMedium, marginBottom: 8, fontWeight: "500" }}
        >
          {label}
        </AppText>
      )}

      <Pressable
        onPress={() => !disabled && setIsOpen(true)}
        style={[s.trigger, disabled && s.disabled]}
      >
        <AppText
          variant="bodyMd"
          style={{
            color: selectedOption
              ? colors.neutral.textDark
              : colors.neutral.textLight,
          }}
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
        <Pressable style={s.overlay} onPress={() => setIsOpen(false)}>
          <Pressable style={s.modalContent} onPress={(e) => e.stopPropagation()}>
            <View style={s.header}>
              <View style={{ width: 24 }} />
              <AppText
                variant="h3"
                style={{
                  fontWeight: "600",
                  textAlign: "center",
                  color: colors.neutral.textDark,
                }}
              >
                {label || "Select Option"}
              </AppText>
              <TouchableOpacity onPress={() => setIsOpen(false)}>
                <Ionicons name="close" size={24} color={colors.neutral.textDark} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={{ padding: 16 }}
              contentContainerStyle={{ paddingBottom: 20 }}
            >
              {options.map((option) => {
                const isSelected = value === option.value;
                return (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() => {
                      onChange(option.value);
                      setIsOpen(false);
                    }}
                    style={[s.option, isSelected && s.optionSelected]}
                  >
                    <AppText
                      variant="bodyMd"
                      style={{
                        color: isSelected
                          ? colors.primary.green
                          : colors.neutral.textDark,
                        fontWeight: isSelected ? "600" : "400",
                      }}
                    >
                      {option.label}
                    </AppText>
                    {isSelected && (
                      <Ionicons
                        name="checkmark"
                        size={20}
                        color={colors.primary.green}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: colors.neutral.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#FFFFFF",
  },
  disabled: {
    opacity: 0.5,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "60%",
    width: "100%",
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.border,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  optionSelected: {
    backgroundColor: "#E8F4EA",
    borderRadius: 8,
  },
});

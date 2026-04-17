// src/components/atoms/MultiSelect.tsx
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { colors, theme } from "../../styles/colors";

interface SelectOption {
  label: string;
  value: string;
}

interface MultiSelectProps {
  label?: string;
  placeholder?: string;
  value?: string[];
  values?: string[];
  options: SelectOption[];
  onChange?: (values: string[]) => void;
  onValueChange?: (values: string[]) => void;
  disabled?: boolean;
}

export default function MultiSelect({
  label,
  placeholder = "Select Multiple...",
  value,
  values,
  options,
  onChange,
  onValueChange,
  disabled = false,
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selected = value ?? values ?? [];

  const handleChange = (newValues: string[]) => {
    onValueChange?.(newValues);
    onChange?.(newValues);
  };

  const selectedOptions = options.filter((opt) => selected.includes(opt.value));
  const displayText =
    selectedOptions.length > 0
      ? selectedOptions.map((o) => o.label).join(", ")
      : placeholder;

  const handleToggleOption = (optionValue: string) => {
    if (selected.includes(optionValue)) {
      handleChange(selected.filter((v) => v !== optionValue));
    } else {
      handleChange([...selected, optionValue]);
    }
  };

  return (
    <View style={s.container}>
      {label ? (
        <Text style={s.label}>{label}</Text>
      ) : null}

      <Pressable
        onPress={() => !disabled && setIsOpen(true)}
        style={[s.trigger, disabled && { opacity: 0.5 }]}
      >
        <Text
          style={[
            s.triggerText,
            { color: selectedOptions.length > 0 ? theme.text.dark : theme.text.light },
          ]}
          numberOfLines={2}
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
        <Pressable style={s.overlay} onPress={() => setIsOpen(false)}>
          <Pressable style={s.modalContent} onPress={(e) => e.stopPropagation()}>
            <View style={s.header}>
              <Text style={s.headerTitle}>{label || "Select"}</Text>
              <TouchableOpacity onPress={() => setIsOpen(false)}>
                <Ionicons name="checkmark" size={24} color={colors.primary.green} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ padding: 16 }} contentContainerStyle={{ paddingBottom: 20 }}>
              {options.map((option) => {
                const isSelected = selected.includes(option.value);
                return (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() => handleToggleOption(option.value)}
                    style={[
                      s.option,
                      isSelected && { backgroundColor: "rgba(56,102,65,0.08)" },
                    ]}
                  >
                    <Text
                      style={[
                        s.optionText,
                        isSelected && { color: colors.primary.green, fontWeight: "600" },
                      ]}
                    >
                      {option.label}
                    </Text>
                    <View
                      style={[
                        s.checkbox,
                        isSelected && { backgroundColor: colors.primary.green, borderColor: colors.primary.green },
                      ]}
                    >
                      {isSelected && (
                        <Ionicons name="checkmark" size={16} color="white" />
                      )}
                    </View>
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
  label: {
    color: theme.text.medium,
    fontSize: 14,
    marginBottom: 8,
  },
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: theme.border.default,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 52,
    backgroundColor: theme.background.input,
  },
  triggerText: {
    fontSize: 15,
    flex: 1,
    marginRight: 8,
    lineHeight: 22,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: theme.background.input,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "60%",
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.border.default,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.border.default,
  },
  optionText: {
    fontSize: 15,
    color: theme.text.dark,
    flex: 1,
    marginRight: 12,
    lineHeight: 22,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: theme.border.default,
    alignItems: "center",
    justifyContent: "center",
  },
});

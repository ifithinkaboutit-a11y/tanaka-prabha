// src/components/atoms/Select.tsx
import { Ionicons } from "@expo/vector-icons";
import React, { useState, useMemo, useRef } from "react";
import {
  AccessibilityInfo,
  findNodeHandle,
  Modal,
  Pressable,
  ScrollView,
  TextInput,
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
  /** Show search bar when list has more than this many items. Default 10 */
  searchThreshold?: number;
}

export default function Select({
  label,
  placeholder = "Select...",
  value,
  options,
  onChange,
  disabled = false,
  searchThreshold = 10,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const triggerRef = useRef<View>(null);

  const selectedOption = options.find((opt) => opt.value === value);
  const showSearch = options.length > searchThreshold;

  const filteredOptions = useMemo(() => {
    if (!showSearch || !searchQuery.trim()) return options;
    const q = searchQuery.toLowerCase();
    return options.filter((opt) => opt.label.toLowerCase().includes(q));
  }, [options, searchQuery, showSearch]);

  const openModal = () => {
    if (disabled) return;
    setSearchQuery("");
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setSearchQuery("");
    // Return focus to trigger button after modal closes
    const node = findNodeHandle(triggerRef.current);
    if (node) {
      AccessibilityInfo.setAccessibilityFocus(node);
    }
  };

  const handleSelect = (val: string) => {
    onChange(val);
    closeModal();
  };

  return (
    <View className="mb-4">
      {label && (
        <AppText
          variant="bodySm"
          style={{ color: colors.neutral.textMedium, marginBottom: 8, fontWeight: "500" }}
        >
          {label}
        </AppText>
      )}

      {/* Trigger button */}
      <Pressable
        ref={triggerRef}
        onPress={openModal}
        accessibilityRole="button"
        accessibilityLabel={selectedOption?.label ?? placeholder}
        className="flex-row items-center justify-between border border-gray-200 rounded-xl px-4 bg-white"
        style={[{ paddingVertical: 14 }, disabled && { opacity: 0.5 }]}
      >
        <AppText
          variant="bodyMd"
          style={{
            color: selectedOption ? colors.neutral.textDark : colors.neutral.textLight,
            flex: 1,
          }}
        >
          {selectedOption?.label || placeholder}
        </AppText>
        <Ionicons
          name={isOpen ? "chevron-up" : "chevron-down"}
          size={18}
          color={colors.neutral.textLight}
        />
      </Pressable>

      {/* Bottom sheet modal — animationType="slide" for native feel */}
      <Modal
        visible={isOpen}
        transparent
        animationType="slide"
        onRequestClose={closeModal}
      >
        {/* Dimmed backdrop — hides content behind modal from screen reader */}
        <Pressable
          className="flex-1 bg-black/50"
          style={{ justifyContent: "flex-end" }}
          importantForAccessibility="no-hide-descendants"
          onPress={closeModal}
        >
          {/* Sheet container — stop propagation so taps inside don't close */}
          <Pressable
            className="bg-white w-full"
            style={{
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              maxHeight: "70%",
            }}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Drag handle */}
            <View className="items-center pt-3 pb-1">
              <View className="w-9 h-1 rounded-full bg-gray-300" />
            </View>

            {/* Header row */}
            <View
              className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50"
              style={{ borderTopLeftRadius: 24, borderTopRightRadius: 24 }}
            >
              <View style={{ width: 28 }} />
              <AppText
                variant="h3"
                style={{
                  fontWeight: "700",
                  fontSize: 16,
                  color: colors.neutral.textDark,
                }}
              >
                {label || "Select Option"}
              </AppText>
              <TouchableOpacity onPress={closeModal} style={{ padding: 11, minWidth: 44, minHeight: 44, alignItems: "center", justifyContent: "center" }} accessibilityLabel="Close" accessibilityRole="button">
                <Ionicons name="close" size={22} color={colors.neutral.textDark} />
              </TouchableOpacity>
            </View>

            {/* Search bar — only shown when options exceed threshold */}
            {showSearch && (
              <View className="mx-4 mt-3 mb-1 flex-row items-center bg-gray-100 rounded-xl px-3 gap-2">
                <Ionicons name="search" size={16} color="#9CA3AF" />
                <TextInput
                  className="flex-1 py-2.5 text-gray-800"
                  style={{ fontSize: 15 }}
                  placeholder="Search..."
                  placeholderTextColor="#9CA3AF"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery("")}>
                    <Ionicons name="close-circle" size={16} color="#9CA3AF" />
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Options list */}
            <ScrollView
              className="px-4"
              contentContainerStyle={{ paddingBottom: 32, paddingTop: 8 }}
              keyboardShouldPersistTaps="handled"
            >
              {filteredOptions.length === 0 ? (
                <View className="py-8 items-center">
                  <Ionicons name="search-outline" size={32} color="#D1D5DB" />
                  <AppText
                    variant="bodySm"
                    className="text-gray-400 mt-2"
                  >
                    No results for "{searchQuery}"
                  </AppText>
                </View>
              ) : (
                filteredOptions.map((option) => {
                  const isSelected = value === option.value;
                  return (
                    <TouchableOpacity
                      key={option.value}
                      onPress={() => handleSelect(option.value)}
                      accessibilityLabel={option.label}
                      accessibilityRole="button"
                      className="flex-row items-center justify-between py-3.5 px-2 border-b border-gray-50"
                      style={
                        isSelected
                          ? {
                              backgroundColor: "#E8F4EA",
                              borderRadius: 10,
                              marginHorizontal: -8,
                              paddingHorizontal: 16,
                            }
                          : undefined
                      }
                    >
                      <AppText
                        variant="bodyMd"
                        style={{
                          color: isSelected
                            ? colors.primary.green
                            : colors.neutral.textDark,
                          fontWeight: isSelected ? "600" : "400",
                          flex: 1,
                        }}
                      >
                        {option.label}
                      </AppText>
                      {isSelected && (
                        <Ionicons
                          name="checkmark-circle"
                          size={20}
                          color={colors.primary.green}
                        />
                      )}
                    </TouchableOpacity>
                  );
                })
              )}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

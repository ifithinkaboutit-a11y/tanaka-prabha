// src/components/molecules/FilterPanel.tsx
import React, { useState, useEffect } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import AppText from "../atoms/AppText";

// ─── Types ────────────────────────────────────────────────────────────────────

export type TypeFilter = "scheme" | "program" | "both";

export interface FilterState {
  categories: string[];
  typeFilter: TypeFilter;
}

export interface FilterPanelProps {
  visible: boolean;
  onApply: (filters: FilterState) => void;
  onClear: () => void;
  onClose: () => void;
  initialFilters?: FilterState;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  "Financial Support",
  "Agricultural Development",
  "Soil Management",
  "Crop Insurance",
  "Training",
] as const;

const TYPE_OPTIONS: { label: string; value: TypeFilter }[] = [
  { label: "Scheme", value: "scheme" },
  { label: "Program", value: "program" },
  { label: "Both", value: "both" },
];

const GREEN = "#166534";
const GREEN_LIGHT = "#DCFCE7";

const DEFAULT_FILTERS: FilterState = {
  categories: [],
  typeFilter: "both",
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function FilterPanel({
  visible,
  onApply,
  onClear,
  onClose,
  initialFilters,
}: FilterPanelProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialFilters?.categories ?? []
  );
  const [typeFilter, setTypeFilter] = useState<TypeFilter>(
    initialFilters?.typeFilter ?? "both"
  );

  // Sync internal state when initialFilters changes (e.g. deep-link restore)
  useEffect(() => {
    setSelectedCategories(initialFilters?.categories ?? []);
    setTypeFilter(initialFilters?.typeFilter ?? "both");
  }, [initialFilters]);

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleApply = () => {
    onApply({ categories: selectedCategories, typeFilter });
  };

  const handleClear = () => {
    setSelectedCategories(DEFAULT_FILTERS.categories);
    setTypeFilter(DEFAULT_FILTERS.typeFilter);
    onClear();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      {/* Backdrop */}
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.45)" }}>
        <Pressable style={{ flex: 1 }} onPress={onClose} />

        {/* Sheet */}
        <View
          style={{
            backgroundColor: "#FFFFFF",
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            maxHeight: "80%",
          }}
        >
          {/* Drag handle */}
          <View style={{ alignItems: "center", paddingTop: 12, paddingBottom: 4 }}>
            <View
              style={{
                width: 40,
                height: 4,
                borderRadius: 2,
                backgroundColor: "#D1D5DB",
              }}
            />
          </View>

          {/* Header */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: 20,
              paddingVertical: 14,
              borderBottomWidth: 1,
              borderBottomColor: "#F3F4F6",
            }}
          >
            <AppText
              variant="h3"
              style={{ fontWeight: "700", color: "#111827", fontSize: 20 }}
            >
              Filters
            </AppText>
            <Pressable
              onPress={onClose}
              hitSlop={8}
              style={({ pressed }) => ({
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: pressed ? "#F3F4F6" : "#F9FAFB",
                alignItems: "center",
                justifyContent: "center",
              })}
            >
              <AppText variant="bodyMd" style={{ color: "#6B7280", fontSize: 18 }}>
                ✕
              </AppText>
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 16 }}
          >
            {/* Category Section */}
            <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
              <AppText
                variant="bodySm"
                style={{
                  fontWeight: "700",
                  color: "#374151",
                  fontSize: 13,
                  letterSpacing: 0.5,
                  textTransform: "uppercase",
                  marginBottom: 12,
                }}
              >
                Category
              </AppText>

              {CATEGORIES.map((category) => {
                const isSelected = selectedCategories.includes(category);
                return (
                  <TouchableOpacity
                    key={category}
                    onPress={() => toggleCategory(category)}
                    activeOpacity={0.7}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      paddingVertical: 12,
                      borderBottomWidth: 1,
                      borderBottomColor: "#F9FAFB",
                    }}
                  >
                    {/* Checkbox */}
                    <View
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: 6,
                        borderWidth: 2,
                        borderColor: isSelected ? GREEN : "#D1D5DB",
                        backgroundColor: isSelected ? GREEN : "#FFFFFF",
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: 14,
                      }}
                    >
                      {isSelected && (
                        <AppText
                          variant="caption"
                          style={{ color: "#FFFFFF", fontSize: 13, fontWeight: "700" }}
                        >
                          ✓
                        </AppText>
                      )}
                    </View>
                    <AppText
                      variant="bodyMd"
                      style={{
                        color: isSelected ? GREEN : "#374151",
                        fontWeight: isSelected ? "600" : "400",
                        fontSize: 15,
                      }}
                    >
                      {category}
                    </AppText>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Type Section */}
            <View style={{ paddingHorizontal: 20, paddingTop: 24 }}>
              <AppText
                variant="bodySm"
                style={{
                  fontWeight: "700",
                  color: "#374151",
                  fontSize: 13,
                  letterSpacing: 0.5,
                  textTransform: "uppercase",
                  marginBottom: 12,
                }}
              >
                Type
              </AppText>

              <View style={{ flexDirection: "row", gap: 10 }}>
                {TYPE_OPTIONS.map(({ label, value }) => {
                  const isActive = typeFilter === value;
                  return (
                    <TouchableOpacity
                      key={value}
                      onPress={() => setTypeFilter(value)}
                      activeOpacity={0.7}
                      style={{
                        flex: 1,
                        paddingVertical: 10,
                        borderRadius: 20,
                        alignItems: "center",
                        backgroundColor: isActive ? GREEN : "#FFFFFF",
                        borderWidth: 1.5,
                        borderColor: isActive ? GREEN : "#D1D5DB",
                      }}
                    >
                      <AppText
                        variant="bodySm"
                        style={{
                          color: isActive ? "#FFFFFF" : "#4B5563",
                          fontWeight: isActive ? "700" : "500",
                          fontSize: 14,
                        }}
                      >
                        {label}
                      </AppText>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </ScrollView>

          {/* Footer Actions */}
          <View
            style={{
              paddingHorizontal: 20,
              paddingTop: 16,
              paddingBottom: 32,
              borderTopWidth: 1,
              borderTopColor: "#F3F4F6",
              flexDirection: "row",
              gap: 12,
            }}
          >
            {/* Clear Filters */}
            <TouchableOpacity
              onPress={handleClear}
              activeOpacity={0.7}
              style={{
                flex: 1,
                paddingVertical: 14,
                borderRadius: 25,
                alignItems: "center",
                borderWidth: 1.5,
                borderColor: "#D1D5DB",
                backgroundColor: "#FFFFFF",
              }}
            >
              <AppText
                variant="bodyMd"
                style={{ color: "#374151", fontWeight: "600", fontSize: 15 }}
              >
                Clear Filters
              </AppText>
            </TouchableOpacity>

            {/* Apply */}
            <TouchableOpacity
              onPress={handleApply}
              activeOpacity={0.8}
              style={{
                flex: 2,
                paddingVertical: 14,
                borderRadius: 25,
                alignItems: "center",
                backgroundColor: GREEN,
              }}
            >
              <AppText
                variant="bodyMd"
                style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 15 }}
              >
                Apply
              </AppText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// src/components/molecules/CropSelector.tsx
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { cropsBySeason, SelectOption } from "../../data/content/onboardingOptions";

interface CropSelectorProps {
  value: string[];
  onValueChange: (crops: string[]) => void;
  language: "en" | "hi";
}

interface SeasonSection {
  key: "rabi" | "kharif" | "zayed";
  labelEn: string;
  labelHi: string;
  dotColor: string;
  bg: string;
}

const SEASONS: SeasonSection[] = [
  { key: "rabi",   labelEn: "Rabi",   labelHi: "रबी",    dotColor: "#3B82F6", bg: "#EFF6FF" },
  { key: "kharif", labelEn: "Kharif", labelHi: "खरीफ",   dotColor: "#16A34A", bg: "#F0FDF4" },
  { key: "zayed",  labelEn: "Zayed",  labelHi: "जायद",   dotColor: "#EAB308", bg: "#FEFCE8" },
];

export default function CropSelector({ value, onValueChange, language }: CropSelectorProps) {
  const toggle = (cropValue: string) => {
    if (value.includes(cropValue)) {
      onValueChange(value.filter((v) => v !== cropValue));
    } else {
      onValueChange([...value, cropValue]);
    }
  };

  return (
    <View style={s.container}>
      {SEASONS.map((season) => {
        const crops: SelectOption[] = cropsBySeason[season.key];
        const sectionLabel = language === "hi"
          ? `${season.labelHi} / ${season.labelEn}`
          : `${season.labelEn} / ${season.labelHi}`;

        return (
          <View key={season.key} style={s.section}>
            {/* Section header */}
            <View style={[s.sectionHeader, { backgroundColor: season.bg }]}>
              <View style={[s.dot, { backgroundColor: season.dotColor }]} />
              <Text style={[s.sectionLabel, { color: season.dotColor }]}>
                {sectionLabel}
              </Text>
            </View>

            {/* Crop chips */}
            <View style={s.chipsRow}>
              {crops.map((crop) => {
                const isSelected = value.includes(crop.value);
                const cropLabel = language === "hi" ? crop.labelHi : crop.label;
                return (
                  <Pressable
                    key={crop.value}
                    onPress={() => toggle(crop.value)}
                    style={[
                      s.chip,
                      isSelected && { backgroundColor: season.dotColor, borderColor: season.dotColor },
                    ]}
                  >
                    <Text
                      style={[
                        s.chipText,
                        isSelected && s.chipTextSelected,
                      ]}
                    >
                      {cropLabel}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
  },
  section: {
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 10,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#D1D5DB",
    backgroundColor: "#F9FAFB",
  },
  chipText: {
    fontSize: 13,
    color: "#374151",
    fontWeight: "500",
  },
  chipTextSelected: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
});

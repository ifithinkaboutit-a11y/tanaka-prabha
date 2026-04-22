// src/components/molecules/CropSelector.tsx
import React from "react";
import { useTranslation } from "../../i18n";
import { Pressable, ScrollView, StyleSheet, Text, View, TextInput } from "react-native";
import { cropsBySeason, SelectOption } from "../../data/content/onboardingOptions";
import { theme } from "@/styles/colors";

interface CropSelectorProps {
  value: string[];
  onValueChange: (crops: string[]) => void;
  language: "en" | "hi";
  otherValue?: string;
  onOtherValueChange?: (text: string) => void;
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

export default function CropSelector({
  value,
  onValueChange,
  language,
  otherValue,
  onOtherValueChange
}: CropSelectorProps) {
  const { t } = useTranslation();

  const toggle = (cropValue: string) => {
    if (value.includes(cropValue)) {
      onValueChange(value.filter((v) => v !== cropValue));
    } else {
      onValueChange([...value, cropValue]);
    }
  };

  const isOtherSelected = value.includes("other");

  return (
    <View style={s.container}>
      {SEASONS.map((season) => {
        const seasonCrops: SelectOption[] = cropsBySeason[season.key];
        // Append "Other" to each season's list if not present, but handle it globally
        const crops = [...seasonCrops];
        if (season.key === "zayed") {
          crops.push({ value: "other", label: "Other", labelHi: "अन्य" });
        }

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
                      {t(`crops.${crop.value}`, { defaultValue: cropLabel })}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        );
      })}

      {/* Show other input if selected */}
      {isOtherSelected && (
        <View style={s.otherInputWrapper}>
          <Text style={s.otherLabel}>
            {language === "hi" ? "अन्य फसल का नाम लिखें" : "Enter other crop name"}
          </Text>
          <TextInput
            style={s.otherInput}
            value={otherValue}
            onChangeText={onOtherValueChange}
            placeholder={language === "hi" ? "फसल का नाम" : "Crop name"}
            placeholderTextColor={theme.text.placeholder}
          />
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: theme.border.subtle,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: theme.background.input,
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
    borderColor: theme.border.card,
    backgroundColor: "#F9FAFB",
  },
  chipText: {
    fontSize: 13,
    color: theme.text.subtle,
    fontWeight: "500",
  },
  chipTextSelected: {
    color: theme.text.onPrimary,
    fontWeight: "700",
  },
  otherInputWrapper: {
    padding: 16,
    backgroundColor: "#F9FAFB",
    borderTopWidth: 1,
    borderTopColor: theme.border.subtle,
  },
  otherLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.text.subtle,
    marginBottom: 8,
  },
  otherInput: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: theme.border.subtle,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: theme.text.primary,
  },
});

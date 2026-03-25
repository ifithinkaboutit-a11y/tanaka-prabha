// src/components/molecules/AddressDropdowns.tsx
import React from "react";
import { View } from "react-native";
import Select from "../atoms/Select";
import { getHierarchyForDistrict } from "../../data/addressHierarchy";
import {
  getChildOptions,
  applyParentChange,
  type AddressValue,
} from "./addressDropdownsHelpers";

// Re-export pure helpers and types for external use / testing
export { getChildOptions, applyParentChange };
export type { AddressValue };

export interface AddressDropdownsProps {
  district: string;
  value: AddressValue;
  onChange: (value: AddressValue) => void;
  language: "en" | "hi";
}

const LABELS = {
  tehsil:        { en: "Tehsil",         hi: "तहसील" },
  nyayPanchayat: { en: "Nyay Panchayat", hi: "न्याय पंचायत" },
  gramPanchayat: { en: "Gram Panchayat", hi: "ग्राम पंचायत" },
  village:       { en: "Village",        hi: "गाँव" },
};

export default function AddressDropdowns({
  district,
  value,
  onChange,
  language,
}: AddressDropdownsProps) {
  const hierarchy = getHierarchyForDistrict(district);

  if (!hierarchy) return null;

  const tehsilOptions = hierarchy.map((t) => ({
    label: language === "hi" ? t.hi : t.en,
    value: t.en,
  }));

  const nyayPanchayatOptions = value.tehsil
    ? getChildOptions(hierarchy, "tehsil", value.tehsil, language)
    : [];

  const gramPanchayatOptions = value.nyayPanchayat
    ? getChildOptions(hierarchy, "nyayPanchayat", value.nyayPanchayat, language)
    : [];

  const villageOptions = value.gramPanchayat
    ? getChildOptions(hierarchy, "gramPanchayat", value.gramPanchayat, language)
    : [];

  return (
    <View>
      <Select
        label={LABELS.tehsil[language]}
        options={tehsilOptions}
        value={value.tehsil}
        onChange={(v) => onChange(applyParentChange(value, "tehsil", v))}
      />
      <Select
        label={LABELS.nyayPanchayat[language]}
        options={nyayPanchayatOptions}
        value={value.nyayPanchayat}
        onChange={(v) => onChange(applyParentChange(value, "nyayPanchayat", v))}
        disabled={!value.tehsil}
      />
      <Select
        label={LABELS.gramPanchayat[language]}
        options={gramPanchayatOptions}
        value={value.gramPanchayat}
        onChange={(v) => onChange(applyParentChange(value, "gramPanchayat", v))}
        disabled={!value.nyayPanchayat}
      />
      <Select
        label={LABELS.village[language]}
        options={villageOptions}
        value={value.village}
        onChange={(v) => onChange({ ...value, village: v })}
        disabled={!value.gramPanchayat}
      />
    </View>
  );
}

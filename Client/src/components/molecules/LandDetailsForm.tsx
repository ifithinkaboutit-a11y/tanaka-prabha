// src/components/molecules/LandDetailsForm.tsx
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { LandDetails, LandDetailsFormProps } from "../../data/interfaces";
import T from "../../i18n";
import Button from "../atoms/Button";
import Select from "../atoms/Select";
import { cropsBySeason } from "../../data/content/onboardingOptions";

// "None" option allows the user to clear a previously selected crop
const NONE_CROP_VALUE = "__none__";
const NONE_OPTION = { value: NONE_CROP_VALUE, label: "None (remove crop)" };

// Flatten cropsBySeason into a single options array (no cotton), with a clear option first
const cropOptions = [
  NONE_OPTION,
  ...cropsBySeason.rabi,
  ...cropsBySeason.kharif,
  ...cropsBySeason.zayed,
];

const unitOptions = [
  { value: "acre", label: "Acres", labelHi: "एकड़" },
  { value: "hectare", label: "Hectares", labelHi: "हेक्टेयर" },
  { value: "bigha", label: "Bigha", labelHi: "बीघा" },
];

// Season config
const SEASONS = [
  {
    field: "rabiCrop" as const,
    label: "Rabi",
    period: "Oct – Mar",
    dotColor: "#3B82F6",
    bg: "#EFF6FF",
    iconName: "snowflake",
    iconLib: "mci" as const,
  },
  {
    field: "kharifCrop" as const,
    label: "Kharif",
    period: "Jun – Sep",
    dotColor: "#16A34A",
    bg: "#F0FDF4",
    iconName: "weather-rainy",
    iconLib: "mci" as const,
  },
  {
    field: "zaidCrop" as const,
    label: "Zaid",
    period: "Mar – Jun",
    dotColor: "#EAB308",
    bg: "#FEFCE8",
    iconName: "weather-sunny",
    iconLib: "mci" as const,
  },
];

export default function LandDetailsForm({
  initialData,
  onSave,
  onCancel,
}: LandDetailsFormProps) {
  const [formData, setFormData] = useState<LandDetails>(initialData);
  const [unit, setUnit] = useState("acre");
  const [areaFocused, setAreaFocused] = useState(false);

  const handleSave = () => {
    if (formData.totalLandArea < 0) {
      Alert.alert("Error", "Land area cannot be negative");
      return;
    }
    // Convert sentinel "none" values back to empty strings before saving
    const dataToSave: LandDetails = {
      ...formData,
      rabiCrop: formData.rabiCrop === NONE_CROP_VALUE ? "" : formData.rabiCrop,
      kharifCrop: formData.kharifCrop === NONE_CROP_VALUE ? "" : formData.kharifCrop,
      zaidCrop: formData.zaidCrop === NONE_CROP_VALUE ? "" : formData.zaidCrop,
    };
    onSave(dataToSave);
  };

  const update = (field: keyof LandDetails, value: string | number) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  return (
    <ScrollView
      style={s.scroll}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={s.scrollContent}
    >
      {/* ── Land area ── */}
      <View style={s.card}>
        <View style={s.sectionHeader}>
          <View style={[s.sectionIconBg, { backgroundColor: "#DCFCE7" }]}>
            <Ionicons name="map" size={18} color="#16A34A" />
          </View>
          <Text style={s.sectionTitle}>{String(T.translate("landDetails.landInformation"))}</Text>
        </View>

        <Text style={s.fieldLabel}>{String(T.translate("landDetails.totalLandArea"))}</Text>
        <View style={s.landAreaRow}>
          <TextInput
            style={[s.landAreaInput, areaFocused && s.landAreaInputFocused]}
            value={formData.totalLandArea > 0 ? formData.totalLandArea.toString() : ""}
            onChangeText={(v) => update("totalLandArea", parseFloat(v) || 0)}
            keyboardType="numeric"
            placeholder="0.0"
            placeholderTextColor="#C4C9D4"
            onFocus={() => setAreaFocused(true)}
            onBlur={() => setAreaFocused(false)}
          />
          <View style={s.unitSelector}>
            <Select
              value={unit}
              onChange={setUnit}
              options={unitOptions}
              placeholder="Unit"
            />
          </View>
        </View>

        {/* Quick tips */}
        <View style={s.tipRow}>
          <Ionicons name="information-circle-outline" size={14} color="#9CA3AF" />
          <Text style={s.tipText}>1 Bigha ≈ 0.4 Acres ≈ 0.16 Hectares</Text>
        </View>
      </View>

      {/* ── Crop Information ── */}
      <View style={s.card}>
        <View style={s.sectionHeader}>
          <View style={[s.sectionIconBg, { backgroundColor: "#FEF3C7" }]}>
            <Ionicons name="leaf" size={18} color="#D97706" />
          </View>
          <Text style={s.sectionTitle}>{String(T.translate("landDetails.cropInformation"))}</Text>
        </View>

        {SEASONS.map((season) => {
          const labelKey = `landDetails.${season.field}` as any;
          return (
            <View key={season.field} style={s.seasonBlock}>
              <View style={[s.seasonHeader, { backgroundColor: season.bg }]}>
                <MaterialCommunityIcons name={season.iconName as any} size={18} color={season.dotColor} />
                <View style={s.seasonTextBlock}>
                  <Text style={[s.seasonLabel, { color: season.dotColor }]}>
                    {String(T.translate(labelKey))}
                  </Text>
                  <Text style={s.seasonPeriod}>{season.period}</Text>
                </View>
                <View style={[s.seasonDot, { backgroundColor: season.dotColor }]} />
              </View>
              <View style={{ marginTop: 8 }}>
                <Select
                  value={formData[season.field] || undefined}
                  onChange={(v) => update(season.field, v)}
                  options={cropOptions}
                  placeholder={`Select ${season.label} crop`}
                />
              </View>
            </View>
          );
        })}
      </View>

      {/* ── Info banner ── */}
      <View style={s.infoBanner}>
        <Ionicons name="information-circle" size={18} color="#3B82F6" />
        <Text style={s.infoBannerText}>{String(T.translate("landDetails.infoMessage"))}</Text>
      </View>

      {/* ── Buttons ── */}
      <View style={s.btnRow}>
        <Button
          variant="outline"
          label={String(T.translate("landDetails.cancel"))}
          onPress={onCancel}
          style={{ flex: 1 }}
        />
        <Button
          variant="primary"
          label={String(T.translate("landDetails.save"))}
          onPress={handleSave}
          style={{ flex: 2, backgroundColor: "#16A34A" }}
        />
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 40 },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },

  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 18 },
  sectionIconBg: { width: 38, height: 38, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  sectionTitle: { fontSize: 17, fontWeight: "700", color: "#111827" },

  fieldLabel: { fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 8 },

  landAreaRow: { flexDirection: "row", gap: 12, alignItems: "center" },
  landAreaInput: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
  },
  landAreaInputFocused: {
    borderColor: "#16A34A",
    shadowColor: "#16A34A",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 1,
  },
  unitSelector: { width: 130 },
  tipRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 10,
    padding: 10,
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
  },
  tipText: { color: "#9CA3AF", fontSize: 12 },

  seasonBlock: { marginBottom: 16 },
  seasonHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 8,
  },
  seasonTextBlock: { flex: 1 },
  seasonLabel: { fontSize: 13, fontWeight: "700" },
  seasonPeriod: { fontSize: 11, color: "#9CA3AF", marginTop: 1 },
  seasonDot: { width: 8, height: 8, borderRadius: 4 },

  infoBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: "#EFF6FF",
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  infoBannerText: { flex: 1, color: "#1E40AF", fontSize: 13, lineHeight: 20 },

  btnRow: { flexDirection: "row", gap: 12, marginTop: 4 },
});

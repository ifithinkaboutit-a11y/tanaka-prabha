// src/components/molecules/LandDetailsForm.tsx
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "@/components/atoms/KeyboardAwareScrollView";
import MultiSelect from "@/components/atoms/MultiSelect";
import { LandDetails, LandDetailsFormProps } from "../../data/interfaces";
import { useTranslation } from "../../i18n";
import { useLanguageStore } from "../../stores/languageStore";
import Button from "../atoms/Button";
import Select from "../atoms/Select";
import { cropsBySeason } from "../../data/content/onboardingOptions";
import { theme } from "@/styles/colors";

// Sentinel value used to track "Others" chips + free-text input
const OTHERS_VALUE = "other";

const unitOptions = [
  { value: "acre",    label: "Acres",    labelHi: "एकड़" },
  { value: "hectare", label: "Hectares", labelHi: "हेक्टेयर" },
  { value: "bigha",   label: "Bigha",    labelHi: "बीघा" },
];

// Season config — 3-section UI (Rabi / Kharif / Zaid)
const SEASONS = [
  {
    field: "rabiCrop"   as const,
    labelKey: "landDetails.rabiCrop",
    period: "Oct – Mar",
    dotColor: "#3B82F6",
    bg: "#EFF6FF",
    iconName: "snowflake",
    crops: cropsBySeason.rabi,
  },
  {
    field: "kharifCrop" as const,
    labelKey: "landDetails.kharifCrop",
    period: "Jun – Sep",
    dotColor: "#16A34A",
    bg: "#F0FDF4",
    iconName: "weather-rainy",
    crops: cropsBySeason.kharif,
  },
  {
    field: "zaidCrop"   as const,
    labelKey: "landDetails.zaidCrop",
    period: "Mar – Jun",
    dotColor: "#EAB308",
    bg: "#FEFCE8",
    iconName: "weather-sunny",
    crops: cropsBySeason.zayed,
  },
] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Parse a stored crop string (comma-separated or single value) into
 * { selected[], other }.
 * Known crop values go into selected[]; anything unrecognised is treated as
 * custom "others" text and the OTHERS_VALUE sentinel is added to selected.
 */
function parseCropField(
  stored: string | undefined,
  knownValues: string[]
): { selected: string[]; other: string } {
  if (!stored?.trim()) return { selected: [], other: "" };

  const parts = stored.split(",").map((s) => s.trim()).filter(Boolean);
  const selected: string[] = [];
  const otherParts: string[] = [];

  parts.forEach((p) => {
    if (knownValues.includes(p.toLowerCase())) {
      selected.push(p.toLowerCase());
    } else {
      otherParts.push(p);
    }
  });

  // If there are custom values, add the sentinel so the "Others" input shows
  if (otherParts.length > 0) {
    selected.push(OTHERS_VALUE);
  }

  return { selected, other: otherParts.join(", ") };
}

/**
 * Serialize selected values + other text back to a comma-separated string
 * for storage in the existing rabiCrop / kharifCrop / zaidCrop fields.
 */
function serializeCropField(selected: string[], other: string): string {
  const knownSelected = selected.filter((v) => v !== OTHERS_VALUE);
  const parts = [...knownSelected];
  if (selected.includes(OTHERS_VALUE) && other.trim()) {
    parts.push(other.trim());
  }
  return parts.join(", ");
}

// ─── Main Form ────────────────────────────────────────────────────────────────
export default function LandDetailsForm({
  initialData,
  onSave,
  onCancel,
}: LandDetailsFormProps) {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguageStore();

  // ── Land area ────────────────────────────────────────────────────────────
  const [totalLandArea, setTotalLandArea] = useState(
    initialData.totalLandArea > 0 ? initialData.totalLandArea.toString() : ""
  );
  const [unit, setUnit] = useState("bigha");
  const [areaFocused, setAreaFocused] = useState(false);

  // ── Per-season crop state ────────────────────────────────────────────────
  // Initialise from the stored comma-separated strings in initialData
  const initSeason = (
    field: "rabiCrop" | "kharifCrop" | "zaidCrop",
    knownValues: string[]
  ) => parseCropField(initialData[field], knownValues);

  const rabiInit   = initSeason("rabiCrop",   cropsBySeason.rabi.map(c => c.value));
  const kharifInit = initSeason("kharifCrop", cropsBySeason.kharif.map(c => c.value));
  const zaidInit   = initSeason("zaidCrop",   cropsBySeason.zayed.map(c => c.value));

  const [rabiSelected,   setRabiSelected]   = useState<string[]>(rabiInit.selected);
  const [rabiOther,      setRabiOther]      = useState(rabiInit.other);
  const [kharifSelected, setKharifSelected] = useState<string[]>(kharifInit.selected);
  const [kharifOther,    setKharifOther]    = useState(kharifInit.other);
  const [zaidSelected,   setZaidSelected]   = useState<string[]>(zaidInit.selected);
  const [zaidOther,      setZaidOther]      = useState(zaidInit.other);

  // ── Save ─────────────────────────────────────────────────────────────────
  const handleSave = () => {
    const area = parseFloat(totalLandArea) || 0;
    if (area < 0) {
      Alert.alert(t("common.error"), t("landDetails.areaError"));
      return;
    }

    const dataToSave: LandDetails = {
      totalLandArea: area,
      rabiCrop:   serializeCropField(rabiSelected,   rabiOther),
      kharifCrop: serializeCropField(kharifSelected, kharifOther),
      zaidCrop:   serializeCropField(zaidSelected,   zaidOther),
    };
    onSave(dataToSave);
  };

  // ── Localized options ────────────────────────────────────────────────────
  const buildOptions = (crops: typeof cropsBySeason.rabi) => [
    ...crops.map((c) => ({
      value: c.value,
      label: currentLanguage === "hi" ? c.labelHi : c.label,
    })),
    {
      value: OTHERS_VALUE,
      label: currentLanguage === "hi" ? "अन्य (नाम लिखें)" : "Others (type name)",
    },
  ];

  const localizedUnitOptions = unitOptions.map((u) => ({
    value: u.value,
    label: currentLanguage === "hi" ? u.labelHi : u.label,
  }));

  // ── Season state map ─────────────────────────────────────────────────────
  const seasonState = {
    rabiCrop:   { selected: rabiSelected,   setSelected: setRabiSelected,   other: rabiOther,   setOther: setRabiOther },
    kharifCrop: { selected: kharifSelected, setSelected: setKharifSelected, other: kharifOther, setOther: setKharifOther },
    zaidCrop:   { selected: zaidSelected,   setSelected: setZaidSelected,   other: zaidOther,   setOther: setZaidOther },
  };

  return (
    // KeyboardAwareScrollView automatically scrolls focused inputs above the
    // keyboard on both iOS and Android — covers the "Others" text fields.
    <KeyboardAwareScrollView
      style={s.scroll}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={s.scrollContent}
      keyboardShouldPersistTaps="handled"
    >
      {/* ── Land area ── */}
      <View style={s.card}>
        <View style={s.sectionHeader}>
          <View style={[s.sectionIconBg, { backgroundColor: "#DCFCE7" }]}>
            <Ionicons name="map" size={18} color="#16A34A" />
          </View>
          <Text style={s.sectionTitle}>{t("landDetails.landInformation")}</Text>
        </View>

        <Text style={s.fieldLabel}>{t("landDetails.totalLandArea")}</Text>
        <View style={s.landAreaRow}>
          <TextInput
            style={[s.landAreaInput, areaFocused && s.landAreaInputFocused]}
            value={totalLandArea}
            onChangeText={setTotalLandArea}
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
              options={localizedUnitOptions}
              placeholder={t("landDetails.selectUnit")}
            />
          </View>
        </View>

        <View style={s.tipRow}>
          <Ionicons name="information-circle-outline" size={14} color={theme.text.placeholder} />
          <Text style={s.tipText}>1 Bigha ≈ 0.4 Acres ≈ 0.16 Hectares</Text>
        </View>
      </View>

      {/* ── Crop Information — 3 season sections ── */}
      <View style={s.card}>
        <View style={s.sectionHeader}>
          <View style={[s.sectionIconBg, { backgroundColor: "#FEF3C7" }]}>
            <Ionicons name="leaf" size={18} color="#D97706" />
          </View>
          <Text style={s.sectionTitle}>{t("landDetails.cropInformation")}</Text>
        </View>

        {SEASONS.map((season, idx) => {
          const state = seasonState[season.field];
          const options = buildOptions(season.crops);
          const hasOthers = state.selected.includes(OTHERS_VALUE);

          return (
            <View
              key={season.field}
              style={[
                s.seasonBlock,
                idx < SEASONS.length - 1 && s.seasonBlockBorder,
              ]}
            >
              {/* Season header pill */}
              <View style={[s.seasonHeader, { backgroundColor: season.bg }]}>
                <MaterialCommunityIcons
                  name={season.iconName as any}
                  size={18}
                  color={season.dotColor}
                />
                <View style={s.seasonTextBlock}>
                  <Text style={[s.seasonLabel, { color: season.dotColor }]}>
                    {t(season.labelKey)}
                  </Text>
                  <Text style={s.seasonPeriod}>{season.period}</Text>
                </View>
                <View style={[s.seasonDot, { backgroundColor: season.dotColor }]} />
              </View>

              {/* MultiSelect for this season's crops */}
              <View style={{ marginTop: 10 }}>
                <MultiSelect
                  placeholder={t("landDetails.selectCrops")}
                  value={state.selected}
                  options={options}
                  onChange={state.setSelected}
                />
              </View>

              {/* "Others" text input — visible only when the Others option is ticked */}
              {hasOthers && (
                <View style={s.otherWrap}>
                  <Text style={s.otherLabel}>{t("landDetails.otherCropName")}</Text>
                  <TextInput
                    style={s.otherInput}
                    value={state.other}
                    onChangeText={state.setOther}
                    placeholder={t("landDetails.otherCropPlaceholder")}
                    placeholderTextColor="#C4C9D4"
                    returnKeyType="done"
                  />
                </View>
              )}
            </View>
          );
        })}
      </View>

      {/* ── Info banner ── */}
      <View style={s.infoBanner}>
        <Ionicons name="information-circle" size={18} color="#3B82F6" />
        <Text style={s.infoBannerText}>{t("landDetails.infoMessage")}</Text>
      </View>

      {/* ── Action buttons ── */}
      <View style={s.btnRow}>
        <Button
          variant="outline"
          label={t("landDetails.cancel")}
          onPress={onCancel}
          style={{ flex: 1 }}
        />
        <Button
          variant="primary"
          label={t("landDetails.save")}
          onPress={handleSave}
          style={{ flex: 2, backgroundColor: "#16A34A" }}
        />
      </View>
    </KeyboardAwareScrollView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 40 },

  card: {
    backgroundColor: theme.background.input,
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
  sectionIconBg: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: { fontSize: 17, fontWeight: "700", color: theme.text.primary },

  fieldLabel: { fontSize: 13, fontWeight: "600", color: theme.text.subtle, marginBottom: 8 },

  landAreaRow: { flexDirection: "row", gap: 12, alignItems: "center" },
  landAreaInput: {
    flex: 1,
    backgroundColor: theme.background.input,
    borderWidth: 1.5,
    borderColor: theme.border.subtle,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 18,
    color: theme.text.secondary,
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
  tipText: { color: theme.text.placeholder, fontSize: 12 },

  // Season blocks
  seasonBlock: { paddingVertical: 14 },
  seasonBlockBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E7EB",
  },
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
  seasonPeriod: { fontSize: 11, color: theme.text.placeholder, marginTop: 1 },
  seasonDot: { width: 8, height: 8, borderRadius: 4 },

  // Others input
  otherWrap: { marginTop: 8 },
  otherLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.text.subtle,
    marginBottom: 6,
  },
  otherInput: {
    backgroundColor: theme.background.input,
    borderWidth: 1.5,
    borderColor: "#D97706",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    color: theme.text.secondary,
  },

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

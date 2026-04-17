// src/components/molecules/LivestockDetailsForm.tsx
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "@/components/atoms/KeyboardAwareScrollView";
import {
  LivestockDetails,
  LivestockDetailsFormProps,
} from "../../data/interfaces";
import { useTranslation } from "../../i18n";
import Button from "../atoms/Button";
import { theme } from "@/styles/colors";

// ─── Animal config — standardized with emojis matching profile display ────────
const ANIMAL_DATA: {
  key: keyof LivestockDetails;
  emoji: string;
  abbr: string;
  accentBg: string;
  accentText: string;
}[] = [
  { key: "cow",     emoji: "🐄", abbr: "CO", accentBg: "#EEF2FF", accentText: "#3730A3" },
  { key: "buffalo", emoji: "🐃", abbr: "BU", accentBg: "#F5F3FF", accentText: "#6D28D9" },
  { key: "sheep",   emoji: "🐑", abbr: "SH", accentBg: "#ECFDF5", accentText: "#065F46" },
  { key: "goat",    emoji: "🐐", abbr: "GO", accentBg: "#FFFBEB", accentText: "#92400E" },
  { key: "pig",     emoji: "🐖", abbr: "PI", accentBg: "#FFF1F2", accentText: "#9F1239" },
  { key: "poultry", emoji: "🐔", abbr: "PO", accentBg: "#FFF7ED", accentText: "#C2410C" },
  { key: "others",  emoji: "🐾", abbr: "OT", accentBg: "#F9FAFB", accentText: "#374151" },
];

// ─── Counter Row ──────────────────────────────────────────────────────────────
const AnimalCounter = ({
  label,
  emoji,
  value,
  onChange,
  abbr,
  accentBg,
  accentText,
  isLast = false,
}: {
  label: string;
  emoji: string;
  value: number | undefined;
  onChange: (v: number) => void;
  abbr: string;
  accentBg: string;
  accentText: string;
  isLast?: boolean;
}) => {
  const safeValue = value ?? 0;
  return (
    <View style={[ac.row, !isLast && ac.rowBorder]}>
      <View style={ac.left}>
        <View style={[ac.badge, { backgroundColor: accentBg }]}>
          <Text style={ac.badgeEmoji}>{emoji}</Text>
        </View>
        <Text style={ac.label}>{label}</Text>
      </View>

      <View style={ac.stepper}>
        <Pressable
          onPress={() => onChange(Math.max(0, safeValue - 1))}
          style={({ pressed }) => [ac.stepBtn, pressed && ac.stepBtnPressed]}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="remove" size={16} color={theme.text.subtle} />
        </Pressable>

        <TextInput
          style={ac.countInput}
          value={safeValue > 0 ? safeValue.toString() : ""}
          onChangeText={(t) => onChange(parseInt(t) || 0)}
          keyboardType="numeric"
          textAlign="center"
          placeholder="0"
          placeholderTextColor={theme.border.card}
        />

        <Pressable
          onPress={() => onChange(safeValue + 1)}
          style={({ pressed }) => [ac.stepBtn, ac.stepBtnAdd, pressed && ac.stepBtnPressed]}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="add" size={16} color={theme.primary.green} />
        </Pressable>
      </View>
    </View>
  );
};

const ac = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 13,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.border.subtle,
  },
  left: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  badge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeEmoji: {
    fontSize: 20,
  },
  label: { fontSize: 15, fontWeight: "500", color: theme.text.secondary },
  stepper: { flexDirection: "row", alignItems: "center", gap: 8 },
  stepBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.border.subtle,
    backgroundColor: "#F9FAFB",
    alignItems: "center",
    justifyContent: "center",
  },
  stepBtnAdd: {
    borderColor: "#BBF7D0",
    backgroundColor: "#F0FDF4",
  },
  stepBtnPressed: { opacity: 0.6 },
  countInput: {
    width: 48,
    height: 34,
    borderWidth: 1,
    borderColor: theme.border.subtle,
    borderRadius: 8,
    backgroundColor: theme.background.input,
    fontSize: 15,
    color: theme.text.primary,
    padding: 0,
  },
});

// ─── Main Form ────────────────────────────────────────────────────────────────
export default function LivestockDetailsForm({
  initialData,
  onSave,
  onCancel,
}: LivestockDetailsFormProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<LivestockDetails>(initialData);

  const handleSave = () => {
    if (Object.values(formData).some((v) => v < 0)) {
      Alert.alert(t("common.error"), t("livestockDetails.negativeError"));
      return;
    }
    onSave(formData);
  };

  const update = (field: keyof LivestockDetails, value: number) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const totalAnimals = Object.values(formData).reduce((sum, v) => sum + v, 0);

  const farmSizeLabel =
    totalAnimals > 10
      ? t("livestockDetails.largeFarm")
      : totalAnimals > 0
      ? t("livestockDetails.smallFarm")
      : t("livestockDetails.noLivestock");

  return (
    <KeyboardAwareScrollView
      style={s.scroll}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={s.content}
    >
      {/* ── Summary strip ── */}
      <View style={s.summaryStrip}>
        <View style={s.summaryLeft}>
          <Text style={s.summaryNumber}>{totalAnimals}</Text>
          <Text style={s.summaryLabel}>{t("livestockDetails.totalAnimals")}</Text>
        </View>
        <View style={s.summaryBadge}>
          <Text style={s.summaryBadgeText}>{farmSizeLabel}</Text>
        </View>
      </View>

      {/* ── Counter rows ── */}
      <View style={s.card}>
        <View style={s.cardHeader}>
          <Text style={s.cardTitle}>{t("livestockDetails.livestockCount")}</Text>
          <Text style={s.cardHint}>{t("livestockDetails.tapHint")}</Text>
        </View>

        {ANIMAL_DATA.map((animal, i) => (
          <AnimalCounter
            key={animal.key}
            label={t(`livestockDetails.${animal.key}`)}
            emoji={animal.emoji}
            value={formData[animal.key]}
            onChange={(v) => update(animal.key, v)}
            abbr={animal.abbr}
            accentBg={animal.accentBg}
            accentText={animal.accentText}
            isLast={i === ANIMAL_DATA.length - 1}
          />
        ))}
      </View>

      {/* ── Info note ── */}
      <View style={s.infoRow}>
        <Ionicons name="information-circle-outline" size={15} color="#6B7280" />
        <Text style={s.infoText}>{t("livestockDetails.infoMessage")}</Text>
      </View>

      {/* ── Actions ── */}
      <View style={s.btnRow}>
        <Button
          variant="outline"
          label={t("common.cancel")}
          onPress={onCancel}
          style={{ flex: 1 }}
        />
        <Button
          variant="primary"
          label={t("common.save")}
          onPress={handleSave}
          style={{ flex: 2, backgroundColor: "#EA580C" }}
        />
      </View>
    </KeyboardAwareScrollView>
  );
}

const s = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingBottom: 40 },

  summaryStrip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: theme.background.input,
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.border.subtle,
  },
  summaryLeft: { flexDirection: "row", alignItems: "baseline", gap: 8 },
  summaryNumber: {
    fontSize: 32,
    fontWeight: "800",
    color: theme.text.primary,
    letterSpacing: -1,
  },
  summaryLabel: { fontSize: 13, color: "#6B7280", fontWeight: "500" },
  summaryBadge: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  summaryBadgeText: { fontSize: 12, fontWeight: "600", color: theme.text.subtle },

  card: {
    backgroundColor: theme.background.input,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.border.subtle,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  cardTitle: { fontSize: 15, fontWeight: "700", color: theme.text.primary },
  cardHint: { fontSize: 11, color: theme.text.placeholder },

  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    paddingHorizontal: 4,
    marginBottom: 16,
  },
  infoText: { flex: 1, fontSize: 12, color: "#6B7280", lineHeight: 18 },

  btnRow: { flexDirection: "row", gap: 12 },
});

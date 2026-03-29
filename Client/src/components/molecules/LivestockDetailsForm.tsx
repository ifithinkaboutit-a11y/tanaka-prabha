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
import T from "../../i18n";
import Button from "../atoms/Button";

// ─── Animal config — label abbreviation + accent color ────────────────────────
const ANIMAL_DATA: {
  key: keyof LivestockDetails;
  abbr: string;
  accentBg: string;
  accentText: string;
}[] = [
  { key: "cow",     abbr: "CO", accentBg: "#EEF2FF", accentText: "#3730A3" },
  { key: "buffalo", abbr: "BU", accentBg: "#F5F3FF", accentText: "#6D28D9" },
  { key: "sheep",   abbr: "SH", accentBg: "#ECFDF5", accentText: "#065F46" },
  { key: "goat",    abbr: "GO", accentBg: "#FFFBEB", accentText: "#92400E" },
  { key: "pig",     abbr: "PI", accentBg: "#FFF1F2", accentText: "#9F1239" },
  { key: "poultry", abbr: "PO", accentBg: "#FFF7ED", accentText: "#C2410C" },
  { key: "others",  abbr: "OT", accentBg: "#F9FAFB", accentText: "#374151" },
];

// ─── Counter Row ──────────────────────────────────────────────────────────────
const AnimalCounter = ({
  label,
  value,
  onChange,
  abbr,
  accentBg,
  accentText,
  isLast = false,
}: {
  label: string;
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
          <Text style={[ac.badgeText, { color: accentText }]}>{abbr}</Text>
        </View>
        <Text style={ac.label}>{label}</Text>
      </View>

      <View style={ac.stepper}>
        <Pressable
          onPress={() => onChange(Math.max(0, safeValue - 1))}
          style={({ pressed }) => [ac.stepBtn, pressed && ac.stepBtnPressed]}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="remove" size={16} color="#374151" />
        </Pressable>

        <TextInput
          style={ac.countInput}
          value={safeValue > 0 ? safeValue.toString() : ""}
          onChangeText={(t) => onChange(parseInt(t) || 0)}
          keyboardType="numeric"
          textAlign="center"
          placeholder="0"
          placeholderTextColor="#D1D5DB"
        />

        <Pressable
          onPress={() => onChange(safeValue + 1)}
          style={({ pressed }) => [ac.stepBtn, ac.stepBtnAdd, pressed && ac.stepBtnPressed]}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="add" size={16} color="#386641" />
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
    borderBottomColor: "#E5E7EB",
  },
  left: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  badge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  label: { fontSize: 15, fontWeight: "500", color: "#1F2937" },
  stepper: { flexDirection: "row", alignItems: "center", gap: 8 },
  stepBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
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
    borderColor: "#E5E7EB",
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
    padding: 0,
  },
});

// ─── Main Form ────────────────────────────────────────────────────────────────
export default function LivestockDetailsForm({
  initialData,
  onSave,
  onCancel,
}: LivestockDetailsFormProps) {
  const [formData, setFormData] = useState<LivestockDetails>(initialData);

  const handleSave = () => {
    if (Object.values(formData).some((v) => v < 0)) {
      Alert.alert("Error", "Livestock counts cannot be negative");
      return;
    }
    onSave(formData);
  };

  const update = (field: keyof LivestockDetails, value: number) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const totalAnimals = Object.values(formData).reduce((sum, v) => sum + v, 0);

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
          <Text style={s.summaryLabel}>
            {String(T.translate("livestockDetails.totalAnimals"))}
          </Text>
        </View>
        <View style={s.summaryBadge}>
          <Text style={s.summaryBadgeText}>
            {totalAnimals > 10 ? "Large Farm" : totalAnimals > 0 ? "Small Farm" : "No Livestock"}
          </Text>
        </View>
      </View>

      {/* ── Counter rows ── */}
      <View style={s.card}>
        <View style={s.cardHeader}>
          <Text style={s.cardTitle}>
            {String(T.translate("livestockDetails.livestockCount"))}
          </Text>
          <Text style={s.cardHint}>Tap + / − or type a number</Text>
        </View>

        {ANIMAL_DATA.map((animal, i) => (
          <AnimalCounter
            key={animal.key}
            label={String(T.translate(`livestockDetails.${animal.key}`))}
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
        <Text style={s.infoText}>
          {String(T.translate("livestockDetails.infoMessage"))}
        </Text>
      </View>

      {/* ── Actions ── */}
      <View style={s.btnRow}>
        <Button
          variant="outline"
          label={String(T.translate("livestockDetails.cancel"))}
          onPress={onCancel}
          style={{ flex: 1 }}
        />
        <Button
          variant="primary"
          label={String(T.translate("livestockDetails.save"))}
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
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  summaryLeft: { flexDirection: "row", alignItems: "baseline", gap: 8 },
  summaryNumber: {
    fontSize: 32,
    fontWeight: "800",
    color: "#111827",
    letterSpacing: -1,
  },
  summaryLabel: { fontSize: 13, color: "#6B7280", fontWeight: "500" },
  summaryBadge: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  summaryBadgeText: { fontSize: 12, fontWeight: "600", color: "#374151" },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  cardTitle: { fontSize: 15, fontWeight: "700", color: "#111827" },
  cardHint: { fontSize: 11, color: "#9CA3AF" },

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

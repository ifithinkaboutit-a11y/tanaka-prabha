// src/components/molecules/LivestockDetailsForm.tsx
import { Ionicons } from "@expo/vector-icons";
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
import {
  LivestockDetails,
  LivestockDetailsFormProps,
} from "../../data/interfaces";
import T from "../../i18n";
import Button from "../atoms/Button";

// Animal data config
const ANIMAL_DATA = [
  { key: "cow" as const, emoji: "🐄", color: "#FEF3C7", iconColor: "#D97706" },
  { key: "buffalo" as const, emoji: "🐃", color: "#E0E7FF", iconColor: "#4F46E5" },
  { key: "sheep" as const, emoji: "🐑", color: "#FCE7F3", iconColor: "#DB2777" },
  { key: "goat" as const, emoji: "🐐", color: "#DCFCE7", iconColor: "#16A34A" },
  { key: "pig" as const, emoji: "🐷", color: "#FFE4E6", iconColor: "#E11D48" },
  { key: "poultry" as const, emoji: "🐔", color: "#FEF9C3", iconColor: "#CA8A04" },
  { key: "others" as const, emoji: "🐾", color: "#F3F4F6", iconColor: "#6B7280" },
];

// ─── Counter Input for Animals ────────────────────────────────────────────────
const AnimalCounter = ({
  label,
  value,
  onChange,
  emoji,
  bgColor,
  isLast = false,
}: {
  label: string;
  value: number | undefined;
  onChange: (v: number) => void;
  emoji: string;
  bgColor: string;
  isLast?: boolean;
}) => {
  const safeValue = value ?? 0;
  return (
    <View style={[ac.container, !isLast && ac.borderBottom]}>
      <View style={ac.left}>
        <View style={[ac.emojiBox, { backgroundColor: bgColor }]}>
          <Text style={ac.emoji}>{emoji}</Text>
        </View>
        <Text style={ac.label}>{label}</Text>
      </View>

      <View style={ac.right}>
        <Pressable
          onPress={() => onChange(Math.max(0, safeValue - 1))}
          style={({ pressed }) => [ac.btn, ac.btnMinus, pressed && { opacity: 0.7 }]}
        >
          <Ionicons name="remove" size={18} color="#6B7280" />
        </Pressable>
        <TextInput
          style={ac.input}
          value={safeValue.toString()}
          onChangeText={(t) => onChange(parseInt(t) || 0)}
          keyboardType="numeric"
          textAlign="center"
          placeholder="0"
          placeholderTextColor="#C4C9D4"
        />
        <Pressable
          onPress={() => onChange(safeValue + 1)}
          style={({ pressed }) => [ac.btn, ac.btnPlus, pressed && { opacity: 0.7 }]}
        >
          <Ionicons name="add" size={18} color="#EA580C" />
        </Pressable>
      </View>
    </View>
  );
};

const ac = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  left: { flexDirection: "row", alignItems: "center", flex: 1 },
  emojiBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  emoji: { fontSize: 22 },
  label: { fontSize: 15, fontWeight: "600", color: "#1F2937" },
  right: { flexDirection: "row", alignItems: "center", gap: 10 },
  btn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
  },
  btnMinus: { borderColor: "#E5E7EB", backgroundColor: "#F9FAFB" },
  btnPlus: { borderColor: "#FED7AA", backgroundColor: "#FFF7ED" },
  input: {
    width: 50,
    height: 38,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    padding: 0,
  },
});

export default function LivestockDetailsForm({
  initialData,
  onSave,
  onCancel,
}: LivestockDetailsFormProps) {
  const [formData, setFormData] = useState<LivestockDetails>(initialData);

  const handleSave = () => {
    const values = Object.values(formData);
    if (values.some((val) => val < 0)) {
      Alert.alert("Error", "Livestock counts cannot be negative");
      return;
    }
    onSave(formData);
  };

  const update = (field: keyof LivestockDetails, value: number) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const totalAnimals = Object.values(formData).reduce((sum, val) => sum + val, 0);

  return (
    <ScrollView
      style={s.scroll}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={s.scrollContent}
    >
      {/* ── Summary Card ── */}
      <View style={s.summaryCard}>
        <View style={s.summaryLeft}>
          <View style={s.summaryIconBox}>
            <Ionicons name="paw" size={24} color="#EA580C" />
          </View>
          <View>
            <Text style={s.summaryLabel}>{String(T.translate("livestockDetails.totalAnimals"))}</Text>
            <Text style={s.summaryValue}>{totalAnimals}</Text>
          </View>
        </View>
        <View style={s.summaryBadge}>
          <Text style={s.summaryBadgeText}>
            {totalAnimals > 10 ? "Large Farm" : totalAnimals > 0 ? "Small Farm" : "No Livestock"}
          </Text>
        </View>
      </View>

      {/* ── Counters Card ── */}
      <View style={s.card}>
        <View style={s.sectionHeader}>
          <View style={[s.sectionIconBg, { backgroundColor: "#FFF7ED" }]}>
            <Ionicons name="list" size={18} color="#EA580C" />
          </View>
          <Text style={s.sectionTitle}>{String(T.translate("livestockDetails.livestockCount"))}</Text>
        </View>

        {ANIMAL_DATA.map((animal, i) => (
          <AnimalCounter
            key={animal.key}
            label={String(T.translate(`livestockDetails.${animal.key}`))}
            value={formData[animal.key as keyof LivestockDetails]}
            onChange={(v) => update(animal.key as keyof LivestockDetails, v)}
            emoji={animal.emoji}
            bgColor={animal.color}
            isLast={i === ANIMAL_DATA.length - 1}
          />
        ))}
      </View>

      {/* ── Info Banner ── */}
      <View style={s.infoBanner}>
        <Ionicons name="bulb" size={18} color="#D97706" />
        <Text style={s.infoBannerText}>{String(T.translate("livestockDetails.infoMessage"))}</Text>
      </View>

      {/* ── Action Buttons ── */}
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
    </ScrollView>
  );
}

const s = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 40 },

  summaryCard: {
    backgroundColor: "#FFF7ED",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#FFEDD5",
  },
  summaryLeft: { flexDirection: "row", alignItems: "center", gap: 14 },
  summaryIconBox: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#FFEDD5",
    alignItems: "center",
    justifyContent: "center",
  },
  summaryLabel: { color: "#C2410C", fontSize: 13, fontWeight: "600" },
  summaryValue: { color: "#9A3412", fontSize: 28, fontWeight: "800", marginTop: -2 },
  summaryBadge: {
    backgroundColor: "#FFEDD5",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  summaryBadgeText: { color: "#9A3412", fontSize: 12, fontWeight: "700" },

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
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 8 },
  sectionIconBg: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: { fontSize: 17, fontWeight: "700", color: "#111827" },

  infoBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: "#FEFCE8",
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#FEF08A",
  },
  infoBannerText: { flex: 1, color: "#854D0E", fontSize: 13, lineHeight: 20 },

  btnRow: { flexDirection: "row", gap: 12, marginTop: 4 },
});

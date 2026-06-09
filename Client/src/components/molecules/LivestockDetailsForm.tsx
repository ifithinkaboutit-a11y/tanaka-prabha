// src/components/molecules/LivestockDetailsForm.tsx
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useState, useMemo, useCallback } from "react";
import {
  Alert,
  Pressable,
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
const ANIMAL_DATA = [
  { key: "cow", icon: "cow", iconLib: "mci", accentBg: "#EEF2FF", accentText: "#3730A3" },
  { key: "buffalo", icon: "water-outline", iconLib: "ion", accentBg: "#F5F3FF", accentText: "#6D28D9" },
  { key: "sheep", icon: "sheep", iconLib: "mci", accentBg: "#ECFDF5", accentText: "#065F46" },
  { key: "goat", icon: "paw", iconLib: "mci", accentBg: "#FFFBEB", accentText: "#92400E" },
  { key: "pig", icon: "pig-variant", iconLib: "mci", accentBg: "#FFF1F2", accentText: "#9F1239" },
  { key: "poultry", icon: "bird", iconLib: "mci", accentBg: "#FFF7ED", accentText: "#C2410C" },
  { key: "horse", icon: "horse-variant", iconLib: "mci", accentBg: "#F0FDFA", accentText: "#0D9488" },
  { key: "others", icon: "ellipsis-horizontal-circle-outline", iconLib: "ion", accentBg: "#F9FAFB", accentText: "#374151" },
] as const;

const ANIMAL_EMOJIS = {
  cow: "🐄", buffalo: "🐃", sheep: "🐑", goat: "🐐",
  pig: "🐷", poultry: "🐔", horse: "🐴", others: "🐾",
} as const;

// ─── Counter Row ──────────────────────────────────────────────────────────────
type AnimalCounterProps = {
  label: string;
  emoji: string;
  value: number | undefined;
  onChange: (v: number) => void;
  icon: string;
  iconLib: "mci" | "ion";
  accentBg: string;
  accentText: string;
  isLast?: boolean;
};

const AnimalCounter = ({
  label,
  emoji,
  value,
  onChange,
  icon,
  iconLib,
  accentBg,
  accentText,
  isLast = false,
}: AnimalCounterProps) => {
  const safeValue = value ?? 0;

  return (
    <View
      className={`flex-row items-center justify-between py-3.5 ${!isLast ? "border-b border-gray-200" : ""}`}
    >
      <View className="flex-row items-center gap-3 flex-1">
        <View
          className="w-10 h-10 rounded-lg items-center justify-center"
          style={{ backgroundColor: accentBg }}
        >
          {iconLib === "mci" ? (
            <MaterialCommunityIcons name={icon as any} size={20} color={accentText} />
          ) : (
            <Ionicons name={icon as any} size={20} color={accentText} />
          )}
        </View>
        <Text className="text-base font-medium text-gray-800">{label}</Text>
      </View>

      <View className="flex-row items-center gap-2">
        <Pressable
          onPress={() => onChange(Math.max(0, safeValue - 1))}
          className="w-8 h-8 rounded border border-gray-300 items-center justify-center"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="remove" size={16} color={theme.text.subtle} />
        </Pressable>

        <TextInput
          className="w-12 h-8 rounded border border-gray-300 bg-gray-100 text-center text-base text-gray-800 px-0"
          value={safeValue > 0 ? safeValue.toString() : ""}
          onChangeText={(t) => onChange(parseInt(t) || 0)}
          keyboardType="numeric"
          placeholder="0"
          placeholderTextColor={theme.border.card}
        />

        <Pressable
          onPress={() => onChange(safeValue + 1)}
          className="w-8 h-8 rounded border border-green-400 bg-green-50 items-center justify-center"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="add" size={16} color={theme.primary.green} />
        </Pressable>
      </View>
    </View>
  );
};

// ─── Main Form ────────────────────────────────────────────────────────────────
export default function LivestockDetailsForm({
  initialData,
  onSave,
  onCancel,
}: LivestockDetailsFormProps) {
  const [formData, setFormData] = useState<LivestockDetails>(initialData);
  const { t } = useTranslation();

  // Memoized calculations
  const totalAnimals = useMemo(
    () => Object.values(formData).reduce((sum, v) => sum + v, 0),
    [formData],
  );

  const farmSizeLabel = useMemo(() => {
    if (totalAnimals > 10) return t("livestockDetails.largeFarm");
    if (totalAnimals > 0) return t("livestockDetails.smallFarm");
    return t("livestockDetails.noLivestock");
  }, [totalAnimals, t]);

  // Validation
  const validate = useCallback(() => {
    if (totalAnimals === 0) {
      Alert.alert(t("common.error"), t("livestockDetails.emptyError"));
      return false;
    }
    if (Object.values(formData).some((v) => v < 0)) {
      Alert.alert(t("common.error"), t("livestockDetails.negativeError"));
      return false;
    }
    return true;
  }, [formData, totalAnimals, t]);

  const handleSave = useCallback(() => {
    if (!validate()) return;
    onSave(formData);
  }, [formData, onSave, validate]);

  const update = useCallback(
    (field: keyof LivestockDetails, value: number) =>
      setFormData((prev) => ({ ...prev, [field]: value })),
    [],
  );

  return (
    <KeyboardAwareScrollView
      className="flex-1 bg-white"
      showsVerticalScrollIndicator={false}
      contentContainerClassName="pb-10"
      keyboardShouldPersistTaps="handled"
    >
      {/* ── Summary strip ── */}
      <View className="flex-row items-center justify-between bg-gray-100 rounded-3xl px-5 py-4 mb-3 border border-gray-200">
        <View className="flex-row items-baseline gap-2">
          <Text className="text-4xl font-extrabold text-gray-900 tracking-tight">
            {totalAnimals}
          </Text>
          <Text className="text-sm font-medium text-gray-500">
            {t("livestockDetails.totalAnimals")}
          </Text>
        </View>
        <View className="bg-gray-200 px-3 py-1.5 rounded-full">
          <Text className="text-xs font-semibold text-gray-600">
            {farmSizeLabel}
          </Text>
        </View>
      </View>

      {/* ── Counter rows ── */}
      <View className="bg-white rounded-3xl px-4 pt-4 pb-1 mb-3 border border-gray-200">
        <View className="flex-row items-baseline justify-between mb-1">
          <Text className="text-base font-bold text-gray-900">
            {t("livestockDetails.livestockCount")}
          </Text>
          <Text className="text-xs text-gray-400">
            {t("livestockDetails.tapHint")}
          </Text>
        </View>

        {ANIMAL_DATA.map((animal, i) => (
          <AnimalCounter
            key={animal.key}
            label={t(`livestockDetails.${animal.key}`)}
            emoji={ANIMAL_EMOJIS[animal.key]}
            value={formData[animal.key]}
            onChange={(v) => update(animal.key, v)}
            icon={animal.icon}
            iconLib={animal.iconLib}
            accentBg={animal.accentBg}
            accentText={animal.accentText}
            isLast={i === ANIMAL_DATA.length - 1}
          />
        ))}
      </View>

      {/* ── Info note ── */}
      <View className="flex-row items-start gap-2 px-1 mb-4">
        <Ionicons name="information-circle-outline" size={15} color="#6B7280" />
        <Text className="flex-1 text-xs text-gray-500 leading-5">
          {t("livestockDetails.infoMessage")}
        </Text>
      </View>

      {/* ── Actions ── */}
      <View className="flex-row gap-3">
        <Button
          variant="outline"
          label={t("livestockDetails.cancel")}
          onPress={onCancel}
          style={{ flex: 1 }}
        />
        <Button
          variant="primary"
          label={t("livestockDetails.save")}
          onPress={handleSave}
          style={{ flex: 2, backgroundColor: "#F97316" }}
        />
      </View>
    </KeyboardAwareScrollView>
  );
}
// src/components/molecules/PersonalDetailsForm.tsx
import { Ionicons } from "@expo/vector-icons";
import { useState, useMemo, useEffect, useRef } from "react";
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
  PersonalDetails,
  PersonalDetailsFormProps,
} from "../../data/interfaces";
import { getStateOptions, getDistrictOptions, getTehsilOptions, getBlockOptions, getVillageOptions } from "../../data/indianLocations";
import T from "../../i18n";
import Button from "../atoms/Button";
import Select from "../atoms/Select";

// ─── Options ─────────────────────────────────────────────────────────────────
const educationOptions = [
  { value: "illiterate", label: "Illiterate", labelHi: "अशिक्षित" },
  { value: "5th", label: "5th Pass", labelHi: "5वीं पास" },
  { value: "8th", label: "8th Pass", labelHi: "8वीं पास" },
  { value: "10th", label: "10th Pass", labelHi: "10वीं पास" },
  { value: "12th", label: "12th Pass", labelHi: "12वीं पास" },
  { value: "graduate", label: "Graduate", labelHi: "स्नातक" },
  { value: "postgraduate", label: "Post Graduate", labelHi: "स्नातकोत्तर" },
  { value: "phd", label: "PhD", labelHi: "पीएचडी" },
];

const genderOptions = [
  { value: "male", label: "Male", labelHi: "पुरुष" },
  { value: "female", label: "Female", labelHi: "महिला" },
  { value: "other", label: "Other", labelHi: "अन्य" },
];

// ─── FormInput ────────────────────────────────────────────────────────────────
const FormInput = ({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
  maxLength,
  required = false,
  icon,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  keyboardType?: "default" | "numeric" | "email-address" | "phone-pad";
  maxLength?: number;
  required?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
}) => {
  const [focused, setFocused] = useState(false);
  return (
    <View style={fi.wrap}>
      <View style={fi.labelRow}>
        {icon && <Ionicons name={icon} size={13} color="#6B7280" style={{ marginRight: 5 }} />}
        <Text style={fi.label}>{label}</Text>
        {required && <Text style={fi.required}> *</Text>}
      </View>
      <TextInput
        style={[fi.input, focused && fi.inputFocused]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#C4C9D4"
        keyboardType={keyboardType}
        maxLength={maxLength}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </View>
  );
};

const fi = StyleSheet.create({
  wrap: { marginBottom: 18 },
  labelRow: { flexDirection: "row", alignItems: "center", marginBottom: 7 },
  label: { color: "#374151", fontSize: 13, fontWeight: "600" },
  required: { color: "#EF4444", fontSize: 13 },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    color: "#1F2937",
  },
  inputFocused: {
    borderColor: "#2563EB",
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 1,
  },
});

// ─── Counter Input ────────────────────────────────────────────────────────────
const CounterInput = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) => (
  <View style={ci.wrap}>
    <Text style={ci.label}>{label}</Text>
    <View style={ci.row}>
      <Pressable
        onPress={() => onChange(Math.max(0, value - 1))}
        style={({ pressed }) => [ci.btn, ci.btnMinus, pressed && { opacity: 0.7 }]}
      >
        <Ionicons name="remove" size={16} color="#6B7280" />
      </Pressable>
      <TextInput
        style={ci.input}
        value={value.toString()}
        onChangeText={(t) => onChange(parseInt(t) || 0)}
        keyboardType="numeric"
        placeholder="0"
        placeholderTextColor="#C4C9D4"
        textAlign="center"
      />
      <Pressable
        onPress={() => onChange(value + 1)}
        style={({ pressed }) => [ci.btn, ci.btnPlus, pressed && { opacity: 0.7 }]}
      >
        <Ionicons name="add" size={16} color="#2563EB" />
      </Pressable>
    </View>
  </View>
);

const ci = StyleSheet.create({
  wrap: { flex: 1 },
  label: { color: "#6B7280", fontSize: 12, fontWeight: "500", marginBottom: 8 },
  row: { flexDirection: "row", alignItems: "center", gap: 4 },
  btn: {
    width: 34,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
  },
  btnMinus: { borderColor: "#E5E7EB", backgroundColor: "#F9FAFB" },
  btnPlus: { borderColor: "#BFDBFE", backgroundColor: "#EFF6FF" },
  input: {
    flex: 1,
    height: 40,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    fontSize: 15,
    fontWeight: "700",
    color: "#1F2937",
    textAlign: "center",
  },
});

// ─── Section Header ───────────────────────────────────────────────────────────
const SectionHeader = ({
  icon,
  title,
  iconBg,
  iconColor,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  iconBg: string;
  iconColor: string;
}) => (
  <View style={sh.row}>
    <View style={[sh.iconBox, { backgroundColor: iconBg }]}>
      <Ionicons name={icon} size={18} color={iconColor} />
    </View>
    <Text style={sh.title}>{title}</Text>
  </View>
);

const sh = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", marginBottom: 20, gap: 12 },
  iconBox: { width: 38, height: 38, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 17, fontWeight: "700", color: "#111827" },
});

// ─── Map Card (address auto-fill button) ─────────────────────────────────────
const mapCard = StyleSheet.create({
  btn: {
    backgroundColor: "#14532D",
    borderRadius: 18,
    marginBottom: 22,
    overflow: "hidden",
    shadowColor: "#052e16",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  btnPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.985 }],
  },
  innerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 18,
    gap: 14,
    // subtle lighter top strip for depth illusion
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.08)",
  },
  iconOuter: {
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  iconRing: {
    position: "absolute",
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: "rgba(134,239,172,0.35)",
  },
  iconWrap: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#16A34A",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#16A34A",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.55,
    shadowRadius: 6,
    elevation: 6,
  },
  textWrap: { flex: 1, gap: 4 },
  chipRow: { flexDirection: "row" },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "rgba(134,239,172,0.18)",
    borderWidth: 1,
    borderColor: "rgba(134,239,172,0.35)",
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 2,
    alignSelf: "flex-start",
    marginBottom: 4,
  },
  chipText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#86EFAC",
    letterSpacing: 0.8,
  },
  title: {
    fontSize: 16,
    fontWeight: "800",
    color: "#14532D",
    letterSpacing: -0.2,
    marginBottom: 4,
  },
  sub: {
    fontSize: 14,
    color: "#166534",
    lineHeight: 17,
  },
  chevronWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
});

// ─── Main Form ────────────────────────────────────────────────────────────────
export default function PersonalDetailsForm({
  initialData,
  addressOverride,
  onSave,
  onCancel,
  onOpenMap,
}: PersonalDetailsFormProps) {
  const [formData, setFormData] = useState<PersonalDetails>(initialData);

  // Apply map-returned address fields without wiping personal/family data.
  // We use a ref to skip the very first render (initial mount) so we only
  // patch when a *new* override arrives after the user returns from the map.
  const prevOverrideRef = useRef<Record<string, string> | undefined>(undefined);
  useEffect(() => {
    if (!addressOverride) return;
    if (addressOverride === prevOverrideRef.current) return;
    prevOverrideRef.current = addressOverride;

    setFormData((prev) => ({
      ...prev,
      ...(addressOverride.state ? { state: addressOverride.state } : {}),
      ...(addressOverride.district ? { district: addressOverride.district } : {}),
      ...(addressOverride.tehsil ? { tehsil: addressOverride.tehsil } : {}),
      ...(addressOverride.block ? { block: addressOverride.block } : {}),
      ...(addressOverride.village ? { village: addressOverride.village } : {}),
      ...(addressOverride.pinCode ? { pinCode: addressOverride.pinCode } : {}),
    }));
  }, [addressOverride]);

  const stateOptions = useMemo(() => getStateOptions(), []);
  const districtOptions = useMemo(
    () => (formData.state ? getDistrictOptions(formData.state) : []),
    [formData.state]
  );

  const tehsilOptions = useMemo(
    () => (formData.district ? getTehsilOptions(formData.state, formData.district) : []),
    [formData.state, formData.district]
  );

  const blockOptions = useMemo(
    () => (formData.tehsil ? getBlockOptions(formData.state, formData.district, formData.tehsil) : []),
    [formData.state, formData.district, formData.tehsil]
  );

  const villageOptions = useMemo(
    () => (formData.block ? getVillageOptions(formData.state, formData.district, formData.tehsil, formData.block) : []),
    [formData.state, formData.district, formData.tehsil, formData.block]
  );

  const handleSave = () => {
    if (!formData.name.trim()) {
      Alert.alert("Validation Error", "Name is required to save your profile.");
      return;
    }
    onSave(formData);
  };

  const update = (field: keyof PersonalDetails, value: string | number) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  return (
    <ScrollView
      style={s.scroll}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={s.scrollContent}
    >
      {/* ── Personal Information ── */}
      <View style={s.card}>
        <SectionHeader icon="person" title={String(T.translate("personalDetails.personalInformation") || "Personal Information")} iconBg="#EFF6FF" iconColor="#2563EB" />

        <FormInput
          label={String(T.translate("personalDetails.name") || "Full Name")}
          value={formData.name}
          onChangeText={(v) => update("name", v)}
          placeholder="Enter your full name"
          icon="person-outline"
          required
        />

        {/* Age + Gender row */}
        <View style={s.twoCol}>
          <View style={{ flex: 1 }}>
            <View style={fi.labelRow}>
              <Ionicons name="calendar-outline" size={13} color="#6B7280" style={{ marginRight: 5 }} />
              <Text style={fi.label}>{String(T.translate("personalDetails.age") || "Age")}</Text>
            </View>
            <TextInput
              style={fi.input}
              value={formData.age > 0 ? formData.age.toString() : ""}
              onChangeText={(t) => update("age", parseInt(t) || 0)}
              keyboardType="numeric"
              placeholder="Years"
              placeholderTextColor="#C4C9D4"
            />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={[fi.label, { marginBottom: 7 }]}>{String(T.translate("personalDetails.gender") || "Gender")}</Text>
            <Select
              value={formData.gender}
              onChange={(v) => update("gender", v)}
              options={genderOptions}
              placeholder="Select..."
            />
          </View>
        </View>
      </View>

      {/* ── Family Information ── */}
      <View style={s.card}>
        <SectionHeader icon="people" title={String(T.translate("personalDetails.familyInformation"))} iconBg="#EFF6FF" iconColor="#3B82F6" />

        <FormInput
          label={String(T.translate("personalDetails.fathersName"))}
          value={formData.fathersName}
          onChangeText={(v) => update("fathersName", v)}
          placeholder="Enter father's name"
          icon="man-outline"
          required
        />

        <FormInput
          label={String(T.translate("personalDetails.mothersName"))}
          value={formData.mothersName}
          onChangeText={(v) => update("mothersName", v)}
          placeholder="Enter mother's name"
          icon="woman-outline"
        />

        <View style={fi.wrap}>
          <Text style={[fi.label, { marginBottom: 7 }]}>{String(T.translate("personalDetails.educationalQualification"))}</Text>
          <Select
            value={formData.educationalQualification}
            onChange={(v) => update("educationalQualification", v)}
            options={educationOptions}
            placeholder="Select education level"
          />
        </View>
      </View>

      {/* ── Family Members ── */}
      <View style={s.card}>
        <SectionHeader icon="home" title={String(T.translate("personalDetails.familyMembers"))} iconBg="#F0FDF4" iconColor="#16A34A" />

        {/* Sons */}
        <Text style={s.subGroupLabel}>{String(T.translate("personalDetails.sonsLabel"))}</Text>
        <View style={[s.twoCol, { marginBottom: 18 }]}>
          <CounterInput
            label={String(T.translate("personalDetails.married"))}
            value={formData.sonsMarried}
            onChange={(v) => update("sonsMarried", v)}
          />
          <CounterInput
            label={String(T.translate("personalDetails.unmarried"))}
            value={formData.sonsUnmarried}
            onChange={(v) => update("sonsUnmarried", v)}
          />
        </View>

        {/* Daughters */}
        <Text style={s.subGroupLabel}>{String(T.translate("personalDetails.daughtersLabel"))}</Text>
        <View style={[s.twoCol, { marginBottom: 18 }]}>
          <CounterInput
            label={String(T.translate("personalDetails.married"))}
            value={formData.daughtersMarried}
            onChange={(v) => update("daughtersMarried", v)}
          />
          <CounterInput
            label={String(T.translate("personalDetails.unmarried"))}
            value={formData.daughtersUnmarried}
            onChange={(v) => update("daughtersUnmarried", v)}
          />
        </View>

        {/* Others */}
        <Text style={s.subGroupLabel}>{String(T.translate("personalDetails.otherFamilyMembers"))}</Text>
        <View style={s.thinRow}>
          <TextInput
            style={[fi.input, { width: 100 }]}
            value={formData.otherFamilyMembers.toString()}
            onChangeText={(t) => update("otherFamilyMembers", parseInt(t) || 0)}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor="#C4C9D4"
          />
        </View>
      </View>

      {/* ── Address Information ── */}
      <View style={s.card}>
        <SectionHeader icon="location" title={String(T.translate("personalDetails.addressInformation"))} iconBg="#FFFBEB" iconColor="#D97706" />

        {/* ── Prominent Map Auto-fill Button ── */}
        {onOpenMap && (
          <Pressable
            onPress={onOpenMap}
            style={({ pressed }) => [mapCard.btn, pressed && mapCard.btnPressed]}
          >
            {/* Dark overlay stripe for premium depth */}
            <View style={mapCard.innerRow}>
              {/* Left: icon block with pulse ring */}
              <View style={mapCard.iconOuter}>
                <View style={mapCard.iconRing} />
                <View style={mapCard.iconWrap}>
                  <Ionicons name="map" size={24} color="#FFFFFF" />
                </View>
              </View>

              {/* Centre: text */}
              <View style={mapCard.textWrap}>
                <Text style={mapCard.title}>
                  {String(T.translate("personalDetails.updateAddressViaMap"))}
                </Text>
                <Text style={mapCard.sub}>
                  {String(T.translate("personalDetails.pinLocationToAutoFill"))}
                </Text>
              </View>

              {/* Right: chevron */}
              <View style={mapCard.chevronWrap}>
                <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.6)" />
              </View>
            </View>
          </Pressable>
        )}

        <View style={fi.wrap}>
          <View style={fi.labelRow}>
            <Ionicons name="map-outline" size={13} color="#6B7280" style={{ marginRight: 5 }} />
            <Text style={fi.label}>{String(T.translate("personalDetails.state"))}</Text>
          </View>
          <Select
            value={formData.state}
            onChange={(v) => { update("state", v); update("district", ""); update("tehsil", ""); update("block", ""); update("village", ""); }}
            options={stateOptions}
            placeholder="Select state"
          />
        </View>

        <View style={fi.wrap}>
          <View style={fi.labelRow}>
            <Ionicons name="business-outline" size={13} color="#6B7280" style={{ marginRight: 5 }} />
            <Text style={fi.label}>{String(T.translate("personalDetails.district"))}</Text>
          </View>
          <Select
            value={formData.district}
            onChange={(v) => { update("district", v); update("tehsil", ""); update("block", ""); update("village", ""); }}
            options={districtOptions}
            placeholder={formData.state ? "Select district" : "Select state first"}
            disabled={!formData.state}
          />
        </View>

        <View style={fi.wrap}>
          <View style={fi.labelRow}>
            <Text style={fi.label}>{String(T.translate("personalDetails.tehsil") || "Tehsil")}</Text>
          </View>
          <Select
            value={formData.tehsil}
            onChange={(v) => { update("tehsil", v); update("block", ""); update("village", ""); }}
            options={tehsilOptions}
            placeholder={formData.district ? "Select tehsil" : "Select district first"}
            disabled={!formData.district}
          />
        </View>

        <View style={fi.wrap}>
          <View style={fi.labelRow}>
            <Text style={fi.label}>{String(T.translate("personalDetails.block") || "Block")}</Text>
          </View>
          <Select
            value={formData.block}
            onChange={(v) => { update("block", v); update("village", ""); }}
            options={blockOptions}
            placeholder={formData.tehsil ? "Select block" : "Select tehsil first"}
            disabled={!formData.tehsil}
          />
        </View>

        <View style={fi.wrap}>
          <View style={fi.labelRow}>
            <Ionicons name="home-outline" size={13} color="#6B7280" style={{ marginRight: 5 }} />
            <Text style={fi.label}>{String(T.translate("personalDetails.village") || "Village")}</Text>
          </View>
          <Select
            value={formData.village}
            onChange={(v) => update("village", v)}
            options={villageOptions}
            placeholder={formData.block ? "Select village" : "Select block first"}
            disabled={!formData.block}
          />
        </View>

        <View style={s.twoCol}>
          <View style={{ flex: 1 }}>
            <FormInput
              label={String(T.translate("personalDetails.gramPanchayat"))}
              value={formData.gramPanchayat}
              onChangeText={(v) => update("gramPanchayat", v)}
              placeholder="Gram panchayat"
            />
          </View>
          <View style={{ flex: 1 }}>
            <FormInput
              label={String(T.translate("personalDetails.nyayPanchayat"))}
              value={formData.nyayPanchayat}
              onChangeText={(v) => update("nyayPanchayat", v)}
              placeholder="Nyay panchayat"
            />
          </View>
        </View>

        <View style={s.twoCol}>
          <View style={{ flex: 1 }}>
            <FormInput
              label={String(T.translate("personalDetails.postOffice"))}
              value={formData.postOffice}
              onChangeText={(v) => update("postOffice", v)}
              placeholder="Post office"
            />
          </View>
          <View style={{ flex: 1 }}>
            <View style={fi.labelRow}>
              <Ionicons name="keypad-outline" size={13} color="#6B7280" style={{ marginRight: 5 }} />
              <Text style={fi.label}>{String(T.translate("personalDetails.pinCode"))}</Text>
            </View>
            <TextInput
              style={fi.input}
              value={formData.pinCode}
              onChangeText={(v) => update("pinCode", v)}
              keyboardType="numeric"
              maxLength={6}
              placeholder="000000"
              placeholderTextColor="#C4C9D4"
            />
          </View>
        </View>


      </View>

      {/* ── Action Buttons ── */}
      <View style={s.btnRow}>
        <Button
          variant="outline"
          label={String(T.translate("personalDetails.cancel"))}
          onPress={onCancel}
          style={{ flex: 1 }}
        />
        <Button
          variant="primary"
          label={String(T.translate("personalDetails.save"))}
          onPress={handleSave}
          style={{ flex: 2, backgroundColor: "#2563EB" }}
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

  twoCol: { flexDirection: "row", gap: 12 },
  subGroupLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 10,
  },
  thinRow: { flexDirection: "row" },

  btnRow: { flexDirection: "row", gap: 12, marginTop: 4, marginBottom: 8 },
});

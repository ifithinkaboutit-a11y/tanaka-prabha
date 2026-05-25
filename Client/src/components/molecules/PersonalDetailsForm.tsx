// src/components/molecules/PersonalDetailsForm.tsx
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect, useRef } from "react";
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
  PersonalDetails,
  PersonalDetailsFormProps,
} from "../../data/interfaces";
import { getStateOptions, getDistrictOptions } from "../../data/indianLocations";
import T from "../../i18n";
import { useLanguageStore } from "../../stores/languageStore";
import Button from "../atoms/Button";
import Select from "../atoms/Select";
import TextArea from "../atoms/TextArea";
import AddressDropdowns, { type AddressValue } from "./AddressDropdowns";
import { theme } from "@/styles/colors";

// ─── Options ─────────────────────────────────────────────────────────────────
const educationOptions = [
  { value: "illiterate", label: "Illiterate / अशिक्षित" },
  { value: "5th", label: "5th Pass / 5वीं पास" },
  { value: "8th", label: "8th Pass / 8वीं पास" },
  { value: "10th", label: "10th Pass / 10वीं पास" },
  { value: "12th", label: "12th Pass / 12वीं पास" },
  { value: "graduate", label: "Graduate / स्नातक" },
  { value: "postgraduate", label: "Post Graduate / स्नातकोत्तर" },
  { value: "phd", label: "PhD / पीएचडी" },
];

const genderOptions = [
  { value: "male", label: "Male / पुरुष" },
  { value: "female", label: "Female / महिला" },
  { value: "other", label: "Other / अन्य" },
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
  label: { color: theme.text.subtle, fontSize: 13, fontWeight: "600" },
  required: { color: "#EF4444", fontSize: 13 },
  input: {
    backgroundColor: theme.background.input,
    borderWidth: 1.5,
    borderColor: theme.border.subtle,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    color: theme.text.secondary,
  },
  inputFocused: {
    borderColor: theme.primary.green,
    shadowColor: theme.primary.green,
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
  label: { color: theme.text.placeholder, fontSize: 12, fontWeight: "500", marginBottom: 8 },
  row: { flexDirection: "row", alignItems: "center", gap: 4 },
  btn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
  },
  btnMinus: { borderColor: theme.border.subtle, backgroundColor: theme.background.neutralSubtle },
  btnPlus: { borderColor: theme.primary.green + "40", backgroundColor: theme.background.successSubtle },
  input: {
    flex: 1,
    height: 44,
    backgroundColor: theme.background.input,
    borderWidth: 1.5,
    borderColor: theme.border.subtle,
    borderRadius: 10,
    fontSize: 15,
    fontWeight: "700",
    color: theme.text.secondary,
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
  title: { fontSize: 17, fontWeight: "700", color: theme.text.primary },
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
  const [genderOtherText, setGenderOtherText] = useState("");

  // Apply map-returned address fields without wiping personal/family data.
  // We use a ref to skip the very first render (initial mount) so we only
  // patch when a *new* override arrives after the user returns from the map.
  const prevOverrideRef = useRef<Record<string, string> | undefined>(undefined);
  useEffect(() => {
    if (!addressOverride) return;
    if (addressOverride === prevOverrideRef.current) return;
    prevOverrideRef.current = addressOverride;

    // Normalize human-readable strings to slug form for dropdown matching
    // e.g. "Uttar Pradesh" → "uttar_pradesh", "Bhadohi" → "bhadohi"
    const toSlug = (val?: string) =>
      val ? val.trim().toLowerCase().replace(/[\s-]+/g, "_") : "";

    setFormData((prev) => ({
      ...prev,
      ...(addressOverride.state ? { state: toSlug(addressOverride.state) } : {}),
      ...(addressOverride.district ? { district: toSlug(addressOverride.district) } : {}),
      ...(addressOverride.tehsil ? { tehsil: addressOverride.tehsil } : {}),
      ...(addressOverride.block ? { block: addressOverride.block } : {}),
      ...(addressOverride.village ? { village: addressOverride.village } : {}),
      ...(addressOverride.pinCode ? { pinCode: addressOverride.pinCode } : {}),
    }));
  }, [addressOverride]);

  const lang = useLanguageStore((s) => s.currentLanguage);
  const stateOptions = getStateOptions(lang);
  const districtOptions = formData.state ? getDistrictOptions(formData.state, lang) : [];
  // Options already contain bilingual labels (Hindi + English)

  const handleSave = () => {
    if (!formData.name.trim()) {
      Alert.alert(
        String(T.translate("validation.validationError")),
        String(T.translate("validation.nameRequiredToSaveProfile"))
      );
      return;
    }
    onSave(formData);
  };

  const update = (field: keyof PersonalDetails, value: string | number) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  return (
    <KeyboardAwareScrollView
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
          placeholder={String(T.translate("personalDetails.placeholders.fullName"))}
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
              placeholder={String(T.translate("personalDetails.placeholders.years"))}
              placeholderTextColor="#C4C9D4"
            />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={[fi.label, { marginBottom: 7 }]}>{String(T.translate("personalDetails.gender") || "Gender")}</Text>
            <Select
              value={formData.gender}
              onChange={(v) => update("gender", v)}
              options={genderOptions}
              placeholder={String(T.translate("common.selectPlaceholder"))}
            />
            {formData.gender === "other" && (
              <TextArea
                value={genderOtherText}
                onChangeText={setGenderOtherText}
                placeholder={String(T.translate("common.specifyOther"))}
                numberOfLines={3}
                style={{ marginTop: 8 }}
              />
            )}
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
          placeholder={String(T.translate("personalDetails.placeholders.fathersName"))}
          icon="man-outline"
          required
        />

        <FormInput
          label={String(T.translate("personalDetails.mothersName"))}
          value={formData.mothersName}
          onChangeText={(v) => update("mothersName", v)}
          placeholder={String(T.translate("personalDetails.placeholders.mothersName"))}
          icon="woman-outline"
        />

        <View style={fi.wrap}>
          <Text style={[fi.label, { marginBottom: 7 }]}>{String(T.translate("personalDetails.educationalQualification"))}</Text>
          <Select
            value={formData.educationalQualification}
            onChange={(v) => update("educationalQualification", v)}
            options={educationOptions}
            placeholder={String(T.translate("personalDetails.placeholders.educationLevel"))}
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
            placeholder={String(T.translate("onboarding.selectState"))}
          />
        </View>

        <View style={fi.wrap}>
          <View style={fi.labelRow}>
            <Ionicons name="business-outline" size={13} color="#6B7280" style={{ marginRight: 5 }} />
            <Text style={fi.label}>{String(T.translate("personalDetails.district"))}</Text>
          </View>
          <Select
            value={formData.district}
            onChange={(v) => { update("district", v); update("tehsil", ""); update("block", ""); update("village", ""); update("gramPanchayat", ""); update("nyayPanchayat", ""); }}
            options={districtOptions}
            placeholder={String(T.translate(formData.state ? "onboarding.selectDistrict" : "onboarding.selectStateFirst"))}
            disabled={!formData.state}
          />
        </View>

        {/* Cascading address dropdowns for Bhadohi/Mirzapur */}
        {(formData.district?.toLowerCase() === "bhadohi" ||
          formData.district?.toLowerCase() === "mirzapur") ? (
          <AddressDropdowns
            district={formData.district}
            value={{
              tehsil: formData.tehsil || "",
              nyayPanchayat: formData.nyayPanchayat || "",
              gramPanchayat: formData.gramPanchayat || "",
              village: formData.village || "",
            }}
            onChange={(v: AddressValue) =>
              setFormData((prev) => ({
                ...prev,
                tehsil: v.tehsil,
                nyayPanchayat: v.nyayPanchayat,
                gramPanchayat: v.gramPanchayat,
                village: v.village,
              }))
            }
            language={lang as "en" | "hi"}
          />
        ) : (
          <>
            {/* Keep existing free-text inputs for non-Bhadohi/Mirzapur districts */}
            <FormInput
              label={String(T.translate("personalDetails.tehsil") || "Tehsil")}
              value={formData.tehsil}
              onChangeText={(v) => update("tehsil", v)}
              placeholder={String(T.translate("personalDetails.placeholders.tehsilExample"))}
              icon="layers-outline"
            />
            <FormInput
              label={String(T.translate("personalDetails.village") || "Village / Town")}
              value={formData.village}
              onChangeText={(v) => update("village", v)}
              placeholder={String(T.translate("personalDetails.placeholders.villageExample"))}
              icon="home-outline"
            />
            <View style={s.twoCol}>
              <View style={{ flex: 1 }}>
                <FormInput
                  label={String(T.translate("personalDetails.gramPanchayat"))}
                  value={formData.gramPanchayat}
                  onChangeText={(v) => update("gramPanchayat", v)}
                  placeholder={String(T.translate("personalDetails.placeholders.gramPanchayat"))}
                />
              </View>
              <View style={{ flex: 1 }}>
                <FormInput
                  label={String(T.translate("personalDetails.nyayPanchayat"))}
                  value={formData.nyayPanchayat}
                  onChangeText={(v) => update("nyayPanchayat", v)}
                  placeholder={String(T.translate("personalDetails.placeholders.nyayPanchayat"))}
                />
              </View>
            </View>
          </>
        )}

        <FormInput
          label={String(T.translate("personalDetails.block") || "Block")}
          value={formData.block}
          onChangeText={(v) => update("block", v)}
          placeholder={String(T.translate("personalDetails.placeholders.blockExample"))}
          icon="grid-outline"
        />

        <View style={s.twoCol}>
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
              returnKeyType="next"
            />
          </View>
          <View style={{ flex: 1 }} className="mb-[5rem]">
            <FormInput
              label={String(T.translate("personalDetails.postOffice"))}
              value={formData.postOffice}
              onChangeText={(v) => update("postOffice", v)}
              placeholder={String(T.translate("personalDetails.placeholders.postOffice"))}
            />
          </View>
        </View>
        {/* Extra space so keyboard doesn't cover the last field */}
        <View style={{ height: 100 }} />
      </View>
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
          style={{ flex: 2 }}
        />
      </View>
    </KeyboardAwareScrollView>
  );
}

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

  twoCol: { flexDirection: "row", gap: 12 },
  subGroupLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.text.subtle,
    marginBottom: 10,
  },
  thinRow: { flexDirection: "row" },

  btnRow: { flexDirection: "row", gap: 12, marginTop: 4, marginBottom: 8 },
});

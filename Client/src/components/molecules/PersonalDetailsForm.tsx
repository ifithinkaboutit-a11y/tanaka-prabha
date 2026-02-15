// src/components/molecules/PersonalDetailsForm.tsx
import { Ionicons } from "@expo/vector-icons";
import { useState, useMemo } from "react";
import { Alert, Pressable, ScrollView, TextInput, View } from "react-native";
import {
  PersonalDetails,
  PersonalDetailsFormProps,
} from "../../data/interfaces";
import { getStateOptions, getDistrictOptions } from "../../data/indianLocations";
import { useTranslation } from "../../i18n";
import AppText from "../atoms/AppText";
import Select from "../atoms/Select";

const educationOptions = [
  { value: "illiterate", label: "Illiterate", labelHi: "à¤…à¤¶à¤¿à¤•à¥à¤·à¤¿à¤¤" },
  { value: "5th", label: "5th Pass", labelHi: "5à¤µà¥€à¤‚ à¤ªà¤¾à¤¸" },
  { value: "8th", label: "8th Pass", labelHi: "8à¤µà¥€à¤‚ à¤ªà¤¾à¤¸" },
  { value: "10th", label: "10th Pass", labelHi: "10à¤µà¥€à¤‚ à¤ªà¤¾à¤¸" },
  { value: "12th", label: "12th Pass", labelHi: "12à¤µà¥€à¤‚ à¤ªà¤¾à¤¸" },
  { value: "graduate", label: "Graduate", labelHi: "à¤¸à¥à¤¨à¤¾à¤¤à¤•" },
  { value: "postgraduate", label: "Post Graduate", labelHi: "à¤¸à¥à¤¨à¤¾à¤¤à¤•à¥‹à¤¤à¥à¤¤à¤°" },
  { value: "phd", label: "PhD", labelHi: "à¤ªà¥€à¤à¤šà¤¡à¥€" },
];

const genderOptions = [
  { value: "male", label: "Male", labelHi: "à¤ªà¥à¤°à¥à¤·" },
  { value: "female", label: "Female", labelHi: "à¤®à¤¹à¤¿à¤²à¤¾" },
  { value: "other", label: "Other", labelHi: "à¤…à¤¨à¥à¤¯" },
];

// Helper component for form inputs
const FormInput = ({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
  maxLength,
  required = false,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  keyboardType?: "default" | "numeric" | "email-address" | "phone-pad";
  maxLength?: number;
  required?: boolean;
}) => (
  <View style={{ marginBottom: 20 }}>
    <AppText
      variant="bodySm"
      style={{ color: "#374151", fontWeight: "600", marginBottom: 8 }}
    >
      {label} {required && <AppText style={{ color: "#DC2626" }}>*</AppText>}
    </AppText>
    <TextInput
      style={{
        backgroundColor: "#F9FAFB",
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderRadius: 12,
        padding: 14,
        fontSize: 16,
        color: "#1F2937",
      }}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#9CA3AF"
      keyboardType={keyboardType}
      maxLength={maxLength}
    />
  </View>
);

// Helper component for number inputs in rows
const NumberInput = ({
  label,
  value,
  onChangeText,
}: {
  label: string;
  value: number;
  onChangeText: (value: number) => void;
}) => (
  <View style={{ flex: 1 }}>
    <AppText
      variant="bodySm"
      style={{ color: "#6B7280", marginBottom: 8, fontSize: 13 }}
    >
      {label}
    </AppText>
    <TextInput
      style={{
        backgroundColor: "#F9FAFB",
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderRadius: 12,
        padding: 12,
        fontSize: 16,
        color: "#1F2937",
        textAlign: "center",
      }}
      value={value.toString()}
      onChangeText={(text) => onChangeText(parseInt(text) || 0)}
      keyboardType="numeric"
      placeholder="0"
      placeholderTextColor="#9CA3AF"
    />
  </View>
);

export default function PersonalDetailsForm({
  initialData,
  onSave,
  onCancel,
}: PersonalDetailsFormProps) {
  const { t, currentLanguage } = useTranslation();
  const [formData, setFormData] = useState<PersonalDetails>(initialData);

  // Get state and district options
  const stateOptions = useMemo(() => getStateOptions(), []);
  const districtOptions = useMemo(
    () => (formData.state ? getDistrictOptions(formData.state) : []),
    [formData.state]
  );

  const handleSave = () => {
    // Basic validation
    if (!formData.name.trim()) {
      Alert.alert("Error", "Name is required");
      return;
    }
    onSave(formData);
  };

  const updateField = (
    field: keyof PersonalDetails,
    value: string | number
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <ScrollView 
      style={{ flex: 1 }} 
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      {/* Personal Information Section */}
      <View
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: 16,
          padding: 20,
          marginBottom: 16,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 2,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 20 }}>
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              backgroundColor: "#F0FDF4",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 12,
            }}
          >
            <Ionicons name="person" size={20} color="#386641" />
          </View>
          <AppText variant="h3" style={{ fontWeight: "700", color: "#1F2937", fontSize: 18 }}>
            {t("personalDetails.personalInformation") || "Personal Information"}
          </AppText>
        </View>

        <FormInput
          label={String(t("personalDetails.name") || "Name")}
          value={formData.name}
          onChangeText={(value) => updateField("name", value)}
          placeholder="Enter your name"
          required
        />

        <View style={{ marginBottom: 20 }}>
          <AppText
            variant="bodySm"
            style={{ color: "#374151", fontWeight: "600", marginBottom: 8 }}
          >
            {t("personalDetails.age") || "Age"}
          </AppText>
          <TextInput
            style={{
              backgroundColor: "#F9FAFB",
              borderWidth: 1,
              borderColor: "#E5E7EB",
              borderRadius: 12,
              padding: 14,
              fontSize: 16,
              color: "#1F2937",
              width: 100,
            }}
            value={formData.age > 0 ? formData.age.toString() : ''}
            onChangeText={(text) => updateField("age", parseInt(text) || 0)}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <View style={{ marginBottom: 0 }}>
          <AppText
            variant="bodySm"
            style={{ color: "#374151", fontWeight: "600", marginBottom: 8 }}
          >
            {t("personalDetails.gender") || "Gender"}
          </AppText>
          <Select
            value={formData.gender}
            onChange={(value) => updateField("gender", value)}
            options={genderOptions}
            placeholder="Select gender"
          />
        </View>
      </View>

      {/* Family Information Section */}
      <View
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: 16,
          padding: 20,
          marginBottom: 16,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 2,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 20 }}>
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              backgroundColor: "#EFF6FF",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 12,
            }}
          >
            <Ionicons name="people" size={20} color="#3B82F6" />
          </View>
          <AppText variant="h3" style={{ fontWeight: "700", color: "#1F2937", fontSize: 18 }}>
            {t("personalDetails.familyInformation")}
          </AppText>
        </View>

        <FormInput
          label={String(t("personalDetails.fathersName"))}
          value={formData.fathersName}
          onChangeText={(value) => updateField("fathersName", value)}
          placeholder="Enter father's name"
          required
        />

        <FormInput
          label={String(t("personalDetails.mothersName"))}
          value={formData.mothersName}
          onChangeText={(value) => updateField("mothersName", value)}
          placeholder="Enter mother's name"
        />

        <View style={{ marginBottom: 20 }}>
          <AppText
            variant="bodySm"
            style={{ color: "#374151", fontWeight: "600", marginBottom: 8 }}
          >
            {t("personalDetails.educationalQualification")}
          </AppText>
          <Select
            value={formData.educationalQualification}
            onChange={(value) => updateField("educationalQualification", value)}
            options={educationOptions}
            placeholder="Select education level"
          />
        </View>
      </View>

      {/* Family Members Section */}
      <View
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: 16,
          padding: 20,
          marginBottom: 16,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 2,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 20 }}>
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              backgroundColor: "#F0FDF4",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 12,
            }}
          >
            <Ionicons name="home" size={20} color="#16A34A" />
          </View>
          <AppText variant="h3" style={{ fontWeight: "700", color: "#1F2937", fontSize: 18 }}>
            {t("personalDetails.familyMembers")}
          </AppText>
        </View>

        {/* Sons Row */}
        <View style={{ marginBottom: 16 }}>
          <AppText
            variant="bodySm"
            style={{ color: "#374151", fontWeight: "600", marginBottom: 12 }}
          >
            {t("personalDetails.sonsLabel")}
          </AppText>
          <View style={{ flexDirection: "row", gap: 12 }}>
            <NumberInput
              label={String(t("personalDetails.married"))}
              value={formData.sonsMarried}
              onChangeText={(value) => updateField("sonsMarried", value)}
            />
            <NumberInput
              label={String(t("personalDetails.unmarried"))}
              value={formData.sonsUnmarried}
              onChangeText={(value) => updateField("sonsUnmarried", value)}
            />
          </View>
        </View>

        {/* Daughters Row */}
        <View style={{ marginBottom: 16 }}>
          <AppText
            variant="bodySm"
            style={{ color: "#374151", fontWeight: "600", marginBottom: 12 }}
          >
            {t("personalDetails.daughtersLabel")}
          </AppText>
          <View style={{ flexDirection: "row", gap: 12 }}>
            <NumberInput
              label={String(t("personalDetails.married"))}
              value={formData.daughtersMarried}
              onChangeText={(value) => updateField("daughtersMarried", value)}
            />
            <NumberInput
              label={String(t("personalDetails.unmarried"))}
              value={formData.daughtersUnmarried}
              onChangeText={(value) => updateField("daughtersUnmarried", value)}
            />
          </View>
        </View>

        {/* Other Family Members */}
        <View>
          <AppText
            variant="bodySm"
            style={{ color: "#374151", fontWeight: "600", marginBottom: 8 }}
          >
            {t("personalDetails.otherFamilyMembers")}
          </AppText>
          <TextInput
            style={{
              backgroundColor: "#F9FAFB",
              borderWidth: 1,
              borderColor: "#E5E7EB",
              borderRadius: 12,
              padding: 14,
              fontSize: 16,
              color: "#1F2937",
              width: 100,
            }}
            value={formData.otherFamilyMembers.toString()}
            onChangeText={(text) => updateField("otherFamilyMembers", parseInt(text) || 0)}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor="#9CA3AF"
          />
        </View>
      </View>

      {/* Address Information Section */}
      <View
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: 16,
          padding: 20,
          marginBottom: 16,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 2,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 20 }}>
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              backgroundColor: "#FEF3C7",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 12,
            }}
          >
            <Ionicons name="location" size={20} color="#D97706" />
          </View>
          <AppText variant="h3" style={{ fontWeight: "700", color: "#1F2937", fontSize: 18 }}>
            {t("personalDetails.addressInformation")}
          </AppText>
        </View>

        <FormInput
          label={String(t("personalDetails.village"))}
          value={formData.village}
          onChangeText={(value) => updateField("village", value)}
          placeholder="Enter village name"
        />

        <FormInput
          label={String(t("personalDetails.gramPanchayat"))}
          value={formData.gramPanchayat}
          onChangeText={(value) => updateField("gramPanchayat", value)}
          placeholder="Enter gram panchayat"
        />

        <FormInput
          label={String(t("personalDetails.nyayPanchayat"))}
          value={formData.nyayPanchayat}
          onChangeText={(value) => updateField("nyayPanchayat", value)}
          placeholder="Enter nyay panchayat"
        />

        <FormInput
          label={String(t("personalDetails.postOffice"))}
          value={formData.postOffice}
          onChangeText={(value) => updateField("postOffice", value)}
          placeholder="Enter post office"
        />

        <FormInput
          label={String(t("personalDetails.tehsil"))}
          value={formData.tehsil}
          onChangeText={(value) => updateField("tehsil", value)}
          placeholder="Enter tehsil"
        />

        <FormInput
          label={String(t("personalDetails.block"))}
          value={formData.block}
          onChangeText={(value) => updateField("block", value)}
          placeholder="Enter block"
        />

        <View style={{ marginBottom: 20 }}>
          <AppText
            variant="bodySm"
            style={{ color: "#374151", fontWeight: "600", marginBottom: 8 }}
          >
            {t("personalDetails.state")}
          </AppText>
          <Select
            value={formData.state}
            onChange={(value) => {
              updateField("state", value);
              // Reset district when state changes
              updateField("district", "");
            }}
            options={stateOptions}
            placeholder="Select state"
          />
        </View>

        <View style={{ marginBottom: 20 }}>
          <AppText
            variant="bodySm"
            style={{ color: "#374151", fontWeight: "600", marginBottom: 8 }}
          >
            {t("personalDetails.district")}
          </AppText>
          <Select
            value={formData.district}
            onChange={(value) => updateField("district", value)}
            options={districtOptions}
            placeholder={formData.state ? "Select district" : "Select state first"}
            disabled={!formData.state}
          />
        </View>

        <View style={{ marginBottom: 0 }}>
          <AppText
            variant="bodySm"
            style={{ color: "#374151", fontWeight: "600", marginBottom: 8 }}
          >
            {t("personalDetails.pinCode")}
          </AppText>
          <TextInput
            style={{
              backgroundColor: "#F9FAFB",
              borderWidth: 1,
              borderColor: "#E5E7EB",
              borderRadius: 12,
              padding: 14,
              fontSize: 16,
              color: "#1F2937",
              width: 150,
            }}
            value={formData.pinCode}
            onChangeText={(value) => updateField("pinCode", value)}
            keyboardType="numeric"
            maxLength={6}
            placeholder="000000"
            placeholderTextColor="#9CA3AF"
          />
        </View>
      </View>

      {/* Action Buttons */}
      <View
        style={{
          flexDirection: "row",
          gap: 12,
          marginTop: 8,
        }}
      >
        <Pressable
          onPress={onCancel}
          style={({ pressed }) => ({
            flex: 1,
            paddingVertical: 16,
            borderRadius: 25,
            backgroundColor: pressed ? "#F3F4F6" : "#FFFFFF",
            borderWidth: 1,
            borderColor: "#D1D5DB",
            alignItems: "center",
          })}
        >
          <AppText
            variant="bodyMd"
            style={{ color: "#6B7280", fontWeight: "600" }}
          >
            {t("personalDetails.cancel")}
          </AppText>
        </Pressable>
        <Pressable
          onPress={handleSave}
          style={({ pressed }) => ({
            flex: 2,
            paddingVertical: 16,
            borderRadius: 25,
            backgroundColor: pressed ? "#2F5233" : "#386641",
            alignItems: "center",
          })}
        >
          <AppText
            variant="bodyMd"
            style={{ color: "#FFFFFF", fontWeight: "700" }}
          >
            {t("personalDetails.save")}
          </AppText>
        </Pressable>
      </View>
    </ScrollView>
  );
}

// src/components/molecules/PersonalDetailsForm.tsx
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Alert, Pressable, ScrollView, TextInput, View } from "react-native";
import {
  PersonalDetails,
  PersonalDetailsFormProps,
} from "../../data/interfaces";
import T from "../../i18n";
import AppText from "../atoms/AppText";
import Select from "../atoms/Select";

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
  const [formData, setFormData] = useState<PersonalDetails>(initialData);

  const handleSave = () => {
    // Basic validation
    if (!formData.fathersName.trim()) {
      Alert.alert("Error", "Father's name is required");
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
            {T.translate("personalDetails.familyInformation")}
          </AppText>
        </View>

        <FormInput
          label={String(T.translate("personalDetails.fathersName"))}
          value={formData.fathersName}
          onChangeText={(value) => updateField("fathersName", value)}
          placeholder="Enter father's name"
          required
        />

        <FormInput
          label={String(T.translate("personalDetails.mothersName"))}
          value={formData.mothersName}
          onChangeText={(value) => updateField("mothersName", value)}
          placeholder="Enter mother's name"
        />

        <View style={{ marginBottom: 20 }}>
          <AppText
            variant="bodySm"
            style={{ color: "#374151", fontWeight: "600", marginBottom: 8 }}
          >
            {T.translate("personalDetails.educationalQualification")}
          </AppText>
          <Select
            value={formData.educationalQualification}
            onValueChange={(value) => updateField("educationalQualification", value)}
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
            {T.translate("personalDetails.familyMembers")}
          </AppText>
        </View>

        {/* Sons Row */}
        <View style={{ marginBottom: 16 }}>
          <AppText
            variant="bodySm"
            style={{ color: "#374151", fontWeight: "600", marginBottom: 12 }}
          >
            {T.translate("personalDetails.sonsLabel")}
          </AppText>
          <View style={{ flexDirection: "row", gap: 12 }}>
            <NumberInput
              label={String(T.translate("personalDetails.married"))}
              value={formData.sonsMarried}
              onChangeText={(value) => updateField("sonsMarried", value)}
            />
            <NumberInput
              label={String(T.translate("personalDetails.unmarried"))}
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
            {T.translate("personalDetails.daughtersLabel")}
          </AppText>
          <View style={{ flexDirection: "row", gap: 12 }}>
            <NumberInput
              label={String(T.translate("personalDetails.married"))}
              value={formData.daughtersMarried}
              onChangeText={(value) => updateField("daughtersMarried", value)}
            />
            <NumberInput
              label={String(T.translate("personalDetails.unmarried"))}
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
            {T.translate("personalDetails.otherFamilyMembers")}
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
            {T.translate("personalDetails.addressInformation")}
          </AppText>
        </View>

        <FormInput
          label={String(T.translate("personalDetails.village"))}
          value={formData.village}
          onChangeText={(value) => updateField("village", value)}
          placeholder="Enter village name"
        />

        <FormInput
          label={String(T.translate("personalDetails.gramPanchayat"))}
          value={formData.gramPanchayat}
          onChangeText={(value) => updateField("gramPanchayat", value)}
          placeholder="Enter gram panchayat"
        />

        <FormInput
          label={String(T.translate("personalDetails.nyayPanchayat"))}
          value={formData.nyayPanchayat}
          onChangeText={(value) => updateField("nyayPanchayat", value)}
          placeholder="Enter nyay panchayat"
        />

        <FormInput
          label={String(T.translate("personalDetails.postOffice"))}
          value={formData.postOffice}
          onChangeText={(value) => updateField("postOffice", value)}
          placeholder="Enter post office"
        />

        <FormInput
          label={String(T.translate("personalDetails.tehsil"))}
          value={formData.tehsil}
          onChangeText={(value) => updateField("tehsil", value)}
          placeholder="Enter tehsil"
        />

        <FormInput
          label={String(T.translate("personalDetails.block"))}
          value={formData.block}
          onChangeText={(value) => updateField("block", value)}
          placeholder="Enter block"
        />

        <FormInput
          label={String(T.translate("personalDetails.district"))}
          value={formData.district}
          onChangeText={(value) => updateField("district", value)}
          placeholder="Enter district"
        />

        <FormInput
          label={String(T.translate("personalDetails.state"))}
          value={formData.state}
          onChangeText={(value) => updateField("state", value)}
          placeholder="Enter state"
        />

        <View style={{ marginBottom: 0 }}>
          <AppText
            variant="bodySm"
            style={{ color: "#374151", fontWeight: "600", marginBottom: 8 }}
          >
            {T.translate("personalDetails.pinCode")}
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
            {T.translate("personalDetails.cancel")}
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
            {T.translate("personalDetails.save")}
          </AppText>
        </Pressable>
      </View>
    </ScrollView>
  );
}

// src/components/molecules/LandDetailsForm.tsx
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Alert, Pressable, ScrollView, TextInput, View } from "react-native";
import { LandDetails, LandDetailsFormProps } from "../../data/interfaces";
import T from "../../i18n";
import AppText from "../atoms/AppText";
import Select from "../atoms/Select";

const cropOptions = [
  { value: "wheat", label: "Wheat", labelHi: "गेहूं" },
  { value: "rice", label: "Rice", labelHi: "चावल" },
  { value: "maize", label: "Maize", labelHi: "मक्का" },
  { value: "cotton", label: "Cotton", labelHi: "कपास" },
  { value: "sugarcane", label: "Sugarcane", labelHi: "गन्ना" },
  { value: "soybean", label: "Soybean", labelHi: "सोयाबीन" },
  { value: "moong", label: "Moong", labelHi: "मूंग" },
  { value: "urad", label: "Urad", labelHi: "उड़द" },
  { value: "groundnut", label: "Groundnut", labelHi: "मूंगफली" },
  { value: "mustard", label: "Mustard", labelHi: "सरसों" },
  { value: "potato", label: "Potato", labelHi: "आलू" },
  { value: "onion", label: "Onion", labelHi: "प्याज" },
  { value: "tomato", label: "Tomato", labelHi: "टमाटर" },
  { value: "watermelon", label: "Watermelon", labelHi: "तरबूज" },
  { value: "cucumber", label: "Cucumber", labelHi: "खीरा" },
  { value: "other", label: "Other", labelHi: "अन्य" },
];

const unitOptions = [
  { value: "acre", label: "Acres", labelHi: "एकड़" },
  { value: "hectare", label: "Hectares", labelHi: "हेक्टेयर" },
  { value: "bigha", label: "Bigha", labelHi: "बीघा" },
];

export default function LandDetailsForm({
  initialData,
  onSave,
  onCancel,
}: LandDetailsFormProps) {
  const [formData, setFormData] = useState<LandDetails>(initialData);
  const [unit, setUnit] = useState("acre");

  const handleSave = () => {
    // Basic validation
    if (formData.totalLandArea < 0) {
      Alert.alert("Error", "Land area cannot be negative");
      return;
    }
    onSave(formData);
  };

  const updateField = (field: keyof LandDetails, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <ScrollView 
      style={{ flex: 1 }} 
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      {/* Land Area Section */}
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
              backgroundColor: "#DCFCE7",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 12,
            }}
          >
            <Ionicons name="map" size={20} color="#16A34A" />
          </View>
          <AppText variant="h3" style={{ fontWeight: "700", color: "#1F2937", fontSize: 18 }}>
            {T.translate("landDetails.landInformation")}
          </AppText>
        </View>

        <View style={{ marginBottom: 0 }}>
          <AppText
            variant="bodySm"
            style={{ color: "#374151", fontWeight: "600", marginBottom: 8 }}
          >
            {T.translate("landDetails.totalLandArea")}
          </AppText>
          <View style={{ flexDirection: "row", gap: 12 }}>
            <View style={{ flex: 1 }}>
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
                value={formData.totalLandArea > 0 ? formData.totalLandArea.toString() : ""}
                onChangeText={(value) =>
                  updateField("totalLandArea", parseFloat(value) || 0)
                }
                keyboardType="numeric"
                placeholder="0.0"
                placeholderTextColor="#9CA3AF"
              />
            </View>
            <View style={{ width: 130 }}>
              <Select
                value={unit}
                onValueChange={setUnit}
                options={unitOptions}
                placeholder="Unit"
              />
            </View>
          </View>
        </View>
      </View>

      {/* Crop Information Section */}
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
            <Ionicons name="leaf" size={20} color="#D97706" />
          </View>
          <AppText variant="h3" style={{ fontWeight: "700", color: "#1F2937", fontSize: 18 }}>
            {T.translate("landDetails.cropInformation")}
          </AppText>
        </View>

        {/* Rabi Crop */}
        <View style={{ marginBottom: 20 }}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: "#3B82F6",
                marginRight: 8,
              }}
            />
            <AppText
              variant="bodySm"
              style={{ color: "#374151", fontWeight: "600" }}
            >
              {T.translate("landDetails.rabiCrop")}
            </AppText>
            <AppText
              variant="bodySm"
              style={{ color: "#9CA3AF", marginLeft: 8, fontSize: 12 }}
            >
              (Oct - Mar)
            </AppText>
          </View>
          <Select
            value={formData.rabiCrop}
            onValueChange={(value) => updateField("rabiCrop", value)}
            options={cropOptions}
            placeholder="Select rabi crop"
          />
        </View>

        {/* Kharif Crop */}
        <View style={{ marginBottom: 20 }}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: "#16A34A",
                marginRight: 8,
              }}
            />
            <AppText
              variant="bodySm"
              style={{ color: "#374151", fontWeight: "600" }}
            >
              {T.translate("landDetails.kharifCrop")}
            </AppText>
            <AppText
              variant="bodySm"
              style={{ color: "#9CA3AF", marginLeft: 8, fontSize: 12 }}
            >
              (Jun - Sep)
            </AppText>
          </View>
          <Select
            value={formData.kharifCrop}
            onValueChange={(value) => updateField("kharifCrop", value)}
            options={cropOptions}
            placeholder="Select kharif crop"
          />
        </View>

        {/* Zaid Crop */}
        <View style={{ marginBottom: 0 }}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: "#EAB308",
                marginRight: 8,
              }}
            />
            <AppText
              variant="bodySm"
              style={{ color: "#374151", fontWeight: "600" }}
            >
              {T.translate("landDetails.zaidCrop")}
            </AppText>
            <AppText
              variant="bodySm"
              style={{ color: "#9CA3AF", marginLeft: 8, fontSize: 12 }}
            >
              (Mar - Jun)
            </AppText>
          </View>
          <Select
            value={formData.zaidCrop}
            onValueChange={(value) => updateField("zaidCrop", value)}
            options={cropOptions}
            placeholder="Select zaid crop"
          />
        </View>
      </View>

      {/* Info Card */}
      <View
        style={{
          backgroundColor: "#EFF6FF",
          borderRadius: 12,
          padding: 16,
          marginBottom: 16,
          flexDirection: "row",
          alignItems: "flex-start",
        }}
      >
        <Ionicons name="information-circle" size={20} color="#3B82F6" style={{ marginTop: 2 }} />
        <AppText
          variant="bodySm"
          style={{ color: "#1E40AF", marginLeft: 10, flex: 1, lineHeight: 20 }}
        >
          {T.translate("landDetails.infoMessage")}
        </AppText>
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
            {T.translate("landDetails.cancel")}
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
            {T.translate("landDetails.save")}
          </AppText>
        </Pressable>
      </View>
    </ScrollView>
  );
}

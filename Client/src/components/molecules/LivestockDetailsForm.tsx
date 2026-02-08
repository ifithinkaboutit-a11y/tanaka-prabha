// src/components/molecules/LivestockDetailsForm.tsx
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Alert, Pressable, ScrollView, TextInput, View, Image } from "react-native";
import {
  LivestockDetails,
  LivestockDetailsFormProps,
} from "../../data/interfaces";
import T from "../../i18n";
import AppText from "../atoms/AppText";

// Animal icons/emojis for visual representation
const animalData = [
  { key: "cow", icon: "🐄", color: "#FEF3C7", iconColor: "#D97706" },
  { key: "buffalo", icon: "🐃", color: "#E0E7FF", iconColor: "#4F46E5" },
  { key: "sheep", icon: "🐑", color: "#FCE7F3", iconColor: "#DB2777" },
  { key: "goat", icon: "🐐", color: "#DCFCE7", iconColor: "#16A34A" },
  { key: "hen", icon: "🐔", color: "#FEF9C3", iconColor: "#CA8A04" },
  { key: "others", icon: "🐾", color: "#F3F4F6", iconColor: "#6B7280" },
];

// Helper component for animal count input
const AnimalCountInput = ({
  label,
  value,
  onChangeText,
  emoji,
  bgColor,
}: {
  label: string;
  value: number;
  onChangeText: (value: number) => void;
  emoji: string;
  bgColor: string;
}) => (
  <View
    style={{
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: "#F3F4F6",
    }}
  >
    <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          backgroundColor: bgColor,
          alignItems: "center",
          justifyContent: "center",
          marginRight: 14,
        }}
      >
        <AppText style={{ fontSize: 22 }}>{emoji}</AppText>
      </View>
      <AppText
        variant="bodyMd"
        style={{ color: "#374151", fontWeight: "600" }}
      >
        {label}
      </AppText>
    </View>
    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
      <Pressable
        onPress={() => onChangeText(Math.max(0, value - 1))}
        style={({ pressed }) => ({
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: pressed ? "#E5E7EB" : "#F3F4F6",
          alignItems: "center",
          justifyContent: "center",
        })}
      >
        <Ionicons name="remove" size={20} color="#6B7280" />
      </Pressable>
      <TextInput
        style={{
          backgroundColor: "#F9FAFB",
          borderWidth: 1,
          borderColor: "#E5E7EB",
          borderRadius: 10,
          paddingVertical: 8,
          paddingHorizontal: 12,
          fontSize: 16,
          color: "#1F2937",
          width: 60,
          textAlign: "center",
          fontWeight: "600",
        }}
        value={value.toString()}
        onChangeText={(text) => onChangeText(parseInt(text) || 0)}
        keyboardType="numeric"
        placeholder="0"
        placeholderTextColor="#9CA3AF"
      />
      <Pressable
        onPress={() => onChangeText(value + 1)}
        style={({ pressed }) => ({
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: pressed ? "#DCFCE7" : "#F0FDF4",
          alignItems: "center",
          justifyContent: "center",
        })}
      >
        <Ionicons name="add" size={20} color="#16A34A" />
      </Pressable>
    </View>
  </View>
);

export default function LivestockDetailsForm({
  initialData,
  onSave,
  onCancel,
}: LivestockDetailsFormProps) {
  const [formData, setFormData] = useState<LivestockDetails>(initialData);

  const handleSave = () => {
    // Basic validation
    const values = Object.values(formData);
    if (values.some((val) => val < 0)) {
      Alert.alert("Error", "Livestock counts cannot be negative");
      return;
    }
    onSave(formData);
  };

  const updateField = (field: keyof LivestockDetails, value: number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const totalAnimals = Object.values(formData).reduce((sum, val) => sum + val, 0);

  return (
    <ScrollView 
      style={{ flex: 1 }} 
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      {/* Summary Card */}
      <View
        style={{
          backgroundColor: "#F0FDF4",
          borderRadius: 16,
          padding: 20,
          marginBottom: 16,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View
            style={{
              width: 50,
              height: 50,
              borderRadius: 25,
              backgroundColor: "#DCFCE7",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="paw" size={24} color="#16A34A" />
          </View>
          <View style={{ marginLeft: 14 }}>
            <AppText
              variant="bodySm"
              style={{ color: "#15803D", fontSize: 12 }}
            >
              {T.translate("livestockDetails.totalAnimals")}
            </AppText>
            <AppText
              variant="h2"
              style={{ color: "#166534", fontWeight: "700", fontSize: 28 }}
            >
              {totalAnimals}
            </AppText>
          </View>
        </View>
        <View
          style={{
            backgroundColor: "#DCFCE7",
            paddingHorizontal: 14,
            paddingVertical: 8,
            borderRadius: 20,
          }}
        >
          <AppText
            variant="bodySm"
            style={{ color: "#166534", fontWeight: "600" }}
          >
            {totalAnimals > 10 ? "Large Farm" : totalAnimals > 0 ? "Small Farm" : "No Livestock"}
          </AppText>
        </View>
      </View>

      {/* Livestock Count Section */}
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
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
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
            <Ionicons name="list" size={20} color="#D97706" />
          </View>
          <AppText variant="h3" style={{ fontWeight: "700", color: "#1F2937", fontSize: 18 }}>
            {T.translate("livestockDetails.livestockCount")}
          </AppText>
        </View>

        <AnimalCountInput
          label={String(T.translate("livestockDetails.cow"))}
          value={formData.cow}
          onChangeText={(value) => updateField("cow", value)}
          emoji={animalData[0].icon}
          bgColor={animalData[0].color}
        />

        <AnimalCountInput
          label={String(T.translate("livestockDetails.buffalo"))}
          value={formData.buffalo}
          onChangeText={(value) => updateField("buffalo", value)}
          emoji={animalData[1].icon}
          bgColor={animalData[1].color}
        />

        <AnimalCountInput
          label={String(T.translate("livestockDetails.sheep"))}
          value={formData.sheep}
          onChangeText={(value) => updateField("sheep", value)}
          emoji={animalData[2].icon}
          bgColor={animalData[2].color}
        />

        <AnimalCountInput
          label={String(T.translate("livestockDetails.goat"))}
          value={formData.goat}
          onChangeText={(value) => updateField("goat", value)}
          emoji={animalData[3].icon}
          bgColor={animalData[3].color}
        />

        <AnimalCountInput
          label={String(T.translate("livestockDetails.hen"))}
          value={formData.hen}
          onChangeText={(value) => updateField("hen", value)}
          emoji={animalData[4].icon}
          bgColor={animalData[4].color}
        />

        <View style={{ borderBottomWidth: 0 }}>
          <AnimalCountInput
            label={String(T.translate("livestockDetails.others"))}
            value={formData.others}
            onChangeText={(value) => updateField("others", value)}
            emoji={animalData[5].icon}
            bgColor={animalData[5].color}
          />
        </View>
      </View>

      {/* Info Card */}
      <View
        style={{
          backgroundColor: "#FEF3C7",
          borderRadius: 12,
          padding: 16,
          marginBottom: 16,
          flexDirection: "row",
          alignItems: "flex-start",
        }}
      >
        <Ionicons name="bulb" size={20} color="#D97706" style={{ marginTop: 2 }} />
        <AppText
          variant="bodySm"
          style={{ color: "#92400E", marginLeft: 10, flex: 1, lineHeight: 20 }}
        >
          {T.translate("livestockDetails.infoMessage")}
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
            {T.translate("livestockDetails.cancel")}
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
            {T.translate("livestockDetails.save")}
          </AppText>
        </Pressable>
      </View>
    </ScrollView>
  );
}

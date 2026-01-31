// src/components/molecules/LandDetailsForm.tsx
import { useState } from "react";
import { Alert, TextInput, View } from "react-native";
import AppText from "../atoms/AppText";
import Button from "../atoms/Button";
import Card from "../atoms/Card";
import { ScrollView } from "react-native";

interface LandDetails {
  totalLandArea: number;
  rabiCrop: string;
  kharifCrop: string;
  zaidCrop: string;
}

type LandDetailsFormProps = {
  initialData: LandDetails;
  onSave: (data: LandDetails) => void;
  onCancel: () => void;
};

const cropOptions = [
  "Wheat",
  "Rice",
  "Maize",
  "Cotton",
  "Sugarcane",
  "Soybean",
  "Moong",
  "Urad",
  "Groundnut",
  "Mustard",
  "Potato",
  "Onion",
  "Tomato",
  "Other",
];

export default function LandDetailsForm({
  initialData,
  onSave,
  onCancel,
}: LandDetailsFormProps) {
  const [formData, setFormData] = useState<LandDetails>(initialData);

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
    <ScrollView className="flex-1 bg-neutral-surface">
      <View className="p-4">
        <AppText variant="h2" className="text-xl font-bold mb-6">
          Edit Land Details
        </AppText>

        <Card className="p-4 mb-6">
          <AppText variant="h3" className="font-semibold mb-4">
            Land Information
          </AppText>

          <View className="mb-4">
            <AppText variant="bodySm" className="text-neutral-textMedium mb-1">
              Total Land Area (Bighas) *
            </AppText>
            <TextInput
              value={formData.totalLandArea.toString()}
              onChangeText={(value) =>
                updateField("totalLandArea", parseFloat(value) || 0)
              }
              className="border border-neutral-border rounded-lg px-3 py-2 bg-white"
              keyboardType="numeric"
              placeholder="0.0"
            />
          </View>
        </Card>

        <Card className="p-4 mb-6">
          <AppText variant="h3" className="font-semibold mb-4">
            Seasonal Crops
          </AppText>

          <View className="mb-4">
            <AppText variant="bodySm" className="text-neutral-textMedium mb-1">
              Rabi Crop (Winter Season)
            </AppText>
            <TextInput
              value={formData.rabiCrop}
              onChangeText={(value) => updateField("rabiCrop", value)}
              className="border border-neutral-border rounded-lg px-3 py-2 bg-white"
              placeholder="e.g., Wheat, Mustard"
            />
          </View>

          <View className="mb-4">
            <AppText variant="bodySm" className="text-neutral-textMedium mb-1">
              Kharif Crop (Monsoon Season)
            </AppText>
            <TextInput
              value={formData.kharifCrop}
              onChangeText={(value) => updateField("kharifCrop", value)}
              className="border border-neutral-border rounded-lg px-3 py-2 bg-white"
              placeholder="e.g., Rice, Cotton"
            />
          </View>

          <View className="mb-4">
            <AppText variant="bodySm" className="text-neutral-textMedium mb-1">
              Zaid Crop (Summer Season)
            </AppText>
            <TextInput
              value={formData.zaidCrop}
              onChangeText={(value) => updateField("zaidCrop", value)}
              className="border border-neutral-border rounded-lg px-3 py-2 bg-white"
              placeholder="e.g., Moong, Watermelon"
            />
          </View>
        </Card>

        <View className="flex-row justify-between gap-4">
          <Button
            label="Cancel"
            variant="outline"
            onPress={onCancel}
            className="flex-1"
          />
          <Button
            label="Save Changes"
            variant="primary"
            onPress={handleSave}
            className="flex-1"
          />
        </View>
      </View>
    </ScrollView>
  );
}

// src/components/molecules/LandDetailsForm.tsx
import { useState } from "react";
import { Alert, ScrollView, TextInput, View } from "react-native";
import { LandDetails, LandDetailsFormProps } from "../../data/interfaces";
import T from "../../i18n";
import AppText from "../atoms/AppText";
import Button from "../atoms/Button";
import Card from "../atoms/Card";

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
          {T.translate("landDetails.editTitle")}
        </AppText>

        <Card className="p-4 mb-6">
          <AppText variant="h3" className="font-semibold mb-4">
            {T.translate("landDetails.landInformation")}
          </AppText>

          <View className="mb-4">
            <AppText variant="bodySm" className="text-neutral-textMedium mb-1">
              {T.translate("landDetails.totalLandArea")}
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
            {T.translate("landDetails.cropInformation")}
          </AppText>

          <View className="mb-4">
            <AppText variant="bodySm" className="text-neutral-textMedium mb-1">
              {T.translate("landDetails.rabiCrop")}
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
              {T.translate("landDetails.kharifCrop")}
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
              {T.translate("landDetails.zaidCrop")}
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
            label={String(T.translate("landDetails.cancel"))}
            variant="outline"
            onPress={onCancel}
            className="flex-1"
          />
          <Button
            label={T.translate("landDetails.save")}
            variant="primary"
            onPress={handleSave}
            className="flex-1"
          />
        </View>
      </View>
    </ScrollView>
  );
}

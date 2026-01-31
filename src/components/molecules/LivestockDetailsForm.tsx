// src/components/molecules/LivestockDetailsForm.tsx
import { useState } from "react";
import { Alert, ScrollView, TextInput, View } from "react-native";
import {
    LivestockDetails,
    LivestockDetailsFormProps,
} from "../../data/interfaces";
import T from "../../i18n";
import AppText from "../atoms/AppText";
import Button from "../atoms/Button";
import Card from "../atoms/Card";

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

  return (
    <ScrollView className="flex-1 bg-neutral-surface">
      <View className="p-4">
        <AppText variant="h2" className="text-xl font-bold mb-6">
          {T.translate("livestockDetails.editTitle")}
        </AppText>

        <Card className="p-4 mb-6">
          <AppText variant="h3" className="font-semibold mb-4">
            {T.translate("livestockDetails.livestockCount")}
          </AppText>

          <View className="mb-4">
            <AppText variant="bodySm" className="text-neutral-textMedium mb-1">
              {T.translate("livestockDetails.cow")}
            </AppText>
            <TextInput
              value={formData.cow.toString()}
              onChangeText={(value) => updateField("cow", parseInt(value) || 0)}
              className="border border-neutral-border rounded-lg px-3 py-2 bg-white"
              keyboardType="numeric"
              placeholder="0"
            />
          </View>

          <View className="mb-4">
            <AppText variant="bodySm" className="text-neutral-textMedium mb-1">
              {T.translate("livestockDetails.buffalo")}
            </AppText>
            <TextInput
              value={formData.buffalo.toString()}
              onChangeText={(value) =>
                updateField("buffalo", parseInt(value) || 0)
              }
              className="border border-neutral-border rounded-lg px-3 py-2 bg-white"
              keyboardType="numeric"
              placeholder="0"
            />
          </View>

          <View className="mb-4">
            <AppText variant="bodySm" className="text-neutral-textMedium mb-1">
              {T.translate("livestockDetails.sheep")}
            </AppText>
            <TextInput
              value={formData.sheep.toString()}
              onChangeText={(value) =>
                updateField("sheep", parseInt(value) || 0)
              }
              className="border border-neutral-border rounded-lg px-3 py-2 bg-white"
              keyboardType="numeric"
              placeholder="0"
            />
          </View>

          <View className="mb-4">
            <AppText variant="bodySm" className="text-neutral-textMedium mb-1">
              {T.translate("livestockDetails.goat")}
            </AppText>
            <TextInput
              value={formData.goat.toString()}
              onChangeText={(value) =>
                updateField("goat", parseInt(value) || 0)
              }
              className="border border-neutral-border rounded-lg px-3 py-2 bg-white"
              keyboardType="numeric"
              placeholder="0"
            />
          </View>

          <View className="mb-4">
            <AppText variant="bodySm" className="text-neutral-textMedium mb-1">
              {T.translate("livestockDetails.hen")}
            </AppText>
            <TextInput
              value={formData.hen.toString()}
              onChangeText={(value) => updateField("hen", parseInt(value) || 0)}
              className="border border-neutral-border rounded-lg px-3 py-2 bg-white"
              keyboardType="numeric"
              placeholder="0"
            />
          </View>

          <View className="mb-4">
            <AppText variant="bodySm" className="text-neutral-textMedium mb-1">
              {T.translate("livestockDetails.others")}
            </AppText>
            <TextInput
              value={formData.others.toString()}
              onChangeText={(value) =>
                updateField("others", parseInt(value) || 0)
              }
              className="border border-neutral-border rounded-lg px-3 py-2 bg-white"
              keyboardType="numeric"
              placeholder="0"
            />
          </View>
        </Card>

        <View className="flex-row justify-between gap-4">
          <Button
            label={String(T.translate("livestockDetails.cancel"))}
            variant="outline"
            onPress={onCancel}
            className="flex-1"
          />
          <Button
            label={String(T.translate("livestockDetails.save"))}
            variant="primary"
            onPress={handleSave}
            className="flex-1"
          />
        </View>
      </View>
    </ScrollView>
  );
}

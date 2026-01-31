// src/components/molecules/PersonalDetailsForm.tsx
import { useState } from "react";
import { Alert, ScrollView, TextInput, View } from "react-native";
import AppText from "../atoms/AppText";
import Button from "../atoms/Button";
import Card from "../atoms/Card";

interface PersonalDetails {
  fathersName: string;
  mothersName: string;
  educationalQualification: string;
  sonsMarried: number;
  sonsUnmarried: number;
  daughtersMarried: number;
  daughtersUnmarried: number;
  otherFamilyMembers: number;
  village: string;
  gramPanchayat: string;
  nyayPanchayat: string;
  postOffice: string;
  tehsil: string;
  block: string;
  district: string;
  pinCode: string;
  state: string;
}

type PersonalDetailsFormProps = {
  initialData: PersonalDetails;
  onSave: (data: PersonalDetails) => void;
  onCancel: () => void;
};

const educationOptions = [
  "Illiterate",
  "5th Pass",
  "8th Pass",
  "10th Pass",
  "12th Pass",
  "Graduate",
  "Post Graduate",
  "PhD",
];

export default function PersonalDetailsForm({
  initialData,
  onSave,
  onCancel,
}: PersonalDetailsFormProps) {
  const [formData, setFormData] = useState<PersonalDetails>(initialData);

  const handleSave = () => {
    // Basic validation
    if (!formData.fathersName.trim() || !formData.mothersName.trim()) {
      Alert.alert("Error", "Father's and Mother's name are required");
      return;
    }
    onSave(formData);
  };

  const updateField = (
    field: keyof PersonalDetails,
    value: string | number,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <ScrollView className="flex-1 bg-neutral-surface">
      <View className="p-4">
        <AppText variant="h2" className="text-xl font-bold mb-6">
          Edit Personal Details
        </AppText>

        <Card className="p-4 mb-6">
          <AppText variant="h3" className="font-semibold mb-4">
            Family Information
          </AppText>

          <View className="mb-4">
            <AppText variant="bodySm" className="text-neutral-textMedium mb-1">
              Father's Name *
            </AppText>
            <TextInput
              value={formData.fathersName}
              onChangeText={(value) => updateField("fathersName", value)}
              className="border border-neutral-border rounded-lg px-3 py-2 bg-white"
              placeholder="Enter father's name"
            />
          </View>

          <View className="mb-4">
            <AppText variant="bodySm" className="text-neutral-textMedium mb-1">
              Mother's Name *
            </AppText>
            <TextInput
              value={formData.mothersName}
              onChangeText={(value) => updateField("mothersName", value)}
              className="border border-neutral-border rounded-lg px-3 py-2 bg-white"
              placeholder="Enter mother's name"
            />
          </View>

          <View className="mb-4">
            <AppText variant="bodySm" className="text-neutral-textMedium mb-1">
              Educational Qualification
            </AppText>
            <TextInput
              value={formData.educationalQualification}
              onChangeText={(value) =>
                updateField("educationalQualification", value)
              }
              className="border border-neutral-border rounded-lg px-3 py-2 bg-white"
              placeholder="Select education level"
            />
          </View>
        </Card>

        <Card className="p-4 mb-6">
          <AppText variant="h3" className="font-semibold mb-4">
            Family Members
          </AppText>

          <View className="flex-row justify-between mb-4">
            <View className="flex-1 mr-2">
              <AppText
                variant="bodySm"
                className="text-neutral-textMedium mb-1"
              >
                Sons (Married)
              </AppText>
              <TextInput
                value={formData.sonsMarried.toString()}
                onChangeText={(value) =>
                  updateField("sonsMarried", parseInt(value) || 0)
                }
                className="border border-neutral-border rounded-lg px-3 py-2 bg-white"
                keyboardType="numeric"
                placeholder="0"
              />
            </View>
            <View className="flex-1 ml-2">
              <AppText
                variant="bodySm"
                className="text-neutral-textMedium mb-1"
              >
                Sons (Unmarried)
              </AppText>
              <TextInput
                value={formData.sonsUnmarried.toString()}
                onChangeText={(value) =>
                  updateField("sonsUnmarried", parseInt(value) || 0)
                }
                className="border border-neutral-border rounded-lg px-3 py-2 bg-white"
                keyboardType="numeric"
                placeholder="0"
              />
            </View>
          </View>

          <View className="flex-row justify-between mb-4">
            <View className="flex-1 mr-2">
              <AppText
                variant="bodySm"
                className="text-neutral-textMedium mb-1"
              >
                Daughters (Married)
              </AppText>
              <TextInput
                value={formData.daughtersMarried.toString()}
                onChangeText={(value) =>
                  updateField("daughtersMarried", parseInt(value) || 0)
                }
                className="border border-neutral-border rounded-lg px-3 py-2 bg-white"
                keyboardType="numeric"
                placeholder="0"
              />
            </View>
            <View className="flex-1 ml-2">
              <AppText
                variant="bodySm"
                className="text-neutral-textMedium mb-1"
              >
                Daughters (Unmarried)
              </AppText>
              <TextInput
                value={formData.daughtersUnmarried.toString()}
                onChangeText={(value) =>
                  updateField("daughtersUnmarried", parseInt(value) || 0)
                }
                className="border border-neutral-border rounded-lg px-3 py-2 bg-white"
                keyboardType="numeric"
                placeholder="0"
              />
            </View>
          </View>

          <View className="mb-4">
            <AppText variant="bodySm" className="text-neutral-textMedium mb-1">
              Other Family Members
            </AppText>
            <TextInput
              value={formData.otherFamilyMembers.toString()}
              onChangeText={(value) =>
                updateField("otherFamilyMembers", parseInt(value) || 0)
              }
              className="border border-neutral-border rounded-lg px-3 py-2 bg-white"
              keyboardType="numeric"
              placeholder="0"
            />
          </View>
        </Card>

        <Card className="p-4 mb-6">
          <AppText variant="h3" className="font-semibold mb-4">
            Address Information
          </AppText>

          <View className="mb-4">
            <AppText variant="bodySm" className="text-neutral-textMedium mb-1">
              Village
            </AppText>
            <TextInput
              value={formData.village}
              onChangeText={(value) => updateField("village", value)}
              className="border border-neutral-border rounded-lg px-3 py-2 bg-white"
              placeholder="Enter village name"
            />
          </View>

          <View className="mb-4">
            <AppText variant="bodySm" className="text-neutral-textMedium mb-1">
              Gram Panchayat
            </AppText>
            <TextInput
              value={formData.gramPanchayat}
              onChangeText={(value) => updateField("gramPanchayat", value)}
              className="border border-neutral-border rounded-lg px-3 py-2 bg-white"
              placeholder="Enter gram panchayat"
            />
          </View>

          <View className="mb-4">
            <AppText variant="bodySm" className="text-neutral-textMedium mb-1">
              Nyay Panchayat
            </AppText>
            <TextInput
              value={formData.nyayPanchayat}
              onChangeText={(value) => updateField("nyayPanchayat", value)}
              className="border border-neutral-border rounded-lg px-3 py-2 bg-white"
              placeholder="Enter nyay panchayat"
            />
          </View>

          <View className="mb-4">
            <AppText variant="bodySm" className="text-neutral-textMedium mb-1">
              Post Office
            </AppText>
            <TextInput
              value={formData.postOffice}
              onChangeText={(value) => updateField("postOffice", value)}
              className="border border-neutral-border rounded-lg px-3 py-2 bg-white"
              placeholder="Enter post office"
            />
          </View>

          <View className="mb-4">
            <AppText variant="bodySm" className="text-neutral-textMedium mb-1">
              Tehsil
            </AppText>
            <TextInput
              value={formData.tehsil}
              onChangeText={(value) => updateField("tehsil", value)}
              className="border border-neutral-border rounded-lg px-3 py-2 bg-white"
              placeholder="Enter tehsil"
            />
          </View>

          <View className="mb-4">
            <AppText variant="bodySm" className="text-neutral-textMedium mb-1">
              Block
            </AppText>
            <TextInput
              value={formData.block}
              onChangeText={(value) => updateField("block", value)}
              className="border border-neutral-border rounded-lg px-3 py-2 bg-white"
              placeholder="Enter block"
            />
          </View>

          <View className="mb-4">
            <AppText variant="bodySm" className="text-neutral-textMedium mb-1">
              District
            </AppText>
            <TextInput
              value={formData.district}
              onChangeText={(value) => updateField("district", value)}
              className="border border-neutral-border rounded-lg px-3 py-2 bg-white"
              placeholder="Enter district"
            />
          </View>

          <View className="mb-4">
            <AppText variant="bodySm" className="text-neutral-textMedium mb-1">
              State
            </AppText>
            <TextInput
              value={formData.state}
              onChangeText={(value) => updateField("state", value)}
              className="border border-neutral-border rounded-lg px-3 py-2 bg-white"
              placeholder="Enter state"
            />
          </View>

          <View className="mb-4">
            <AppText variant="bodySm" className="text-neutral-textMedium mb-1">
              PIN Code
            </AppText>
            <TextInput
              value={formData.pinCode}
              onChangeText={(value) => updateField("pinCode", value)}
              className="border border-neutral-border rounded-lg px-3 py-2 bg-white"
              keyboardType="numeric"
              maxLength={6}
              placeholder="Enter PIN code"
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

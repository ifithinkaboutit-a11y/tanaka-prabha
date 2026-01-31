// src/app/personal-details.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, ScrollView, View } from "react-native";
import AppText from "../components/atoms/AppText";
import PersonalDetailsForm from "../components/molecules/PersonalDetailsForm";

import { useUserProfile } from "../contexts/UserProfileContext";
import T from "../i18n";

export const unstable_settings = {
  headerShown: false,
};

const PersonalDetailsScreen = () => {
  const router = useRouter();
  const { profile, updatePersonalDetails } = useUserProfile();

  const initialData = {
    fathersName: profile.fathersName,
    mothersName: profile.mothersName,
    educationalQualification: profile.educationalQualification,
    sonsMarried: profile.sonsMarried,
    sonsUnmarried: profile.sonsUnmarried,
    daughtersMarried: profile.daughtersMarried,
    daughtersUnmarried: profile.daughtersUnmarried,
    otherFamilyMembers: profile.otherFamilyMembers,
    village: profile.village,
    gramPanchayat: profile.gramPanchayat,
    nyayPanchayat: profile.nyayPanchayat,
    postOffice: profile.postOffice,
    tehsil: profile.tehsil,
    block: profile.block,
    district: profile.district,
    pinCode: profile.pinCode,
    state: profile.state,
  };

  const handleSave = (data: typeof initialData) => {
    updatePersonalDetails(data);
    router.back();
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <View className="flex-1 bg-neutral-surface">
      {/* Custom Header */}
      <View className="flex-row items-center pt-12 pb-4 px-4 bg-white">
        <Pressable onPress={() => router.back()} className="mr-4 p-2">
          <Ionicons name="arrow-back" size={24} color="#386641" />
        </Pressable>
        <AppText variant="h2" className="text-neutral-textDark flex-1">
          {T.translate("personalDetails.title")}
        </AppText>
      </View>

      <ScrollView className="flex-1">
        <View className="p-4">
          <PersonalDetailsForm
            initialData={initialData}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        </View>
      </ScrollView>
    </View>
  );
};

export default PersonalDetailsScreen;

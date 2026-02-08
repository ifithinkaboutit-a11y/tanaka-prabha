// src/app/land-details.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { ActivityIndicator, Pressable, ScrollView, View } from "react-native";
import AppText from "../components/atoms/AppText";
import LandDetailsForm from "../components/molecules/LandDetailsForm";

import { useUserProfile } from "../contexts/UserProfileContext";
import T from "../i18n";

export const unstable_settings = {
  headerShown: false,
};

const LandDetailsScreen = () => {
  const router = useRouter();
  const { profile, loading, updateLandDetails } = useUserProfile();

  if (loading || !profile) {
    return (
      <View className="flex-1 bg-neutral-surface items-center justify-center">
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  const initialData = {
    totalLandArea: profile.landDetails?.totalLandArea || 0,
    rabiCrop: profile.landDetails?.rabiCrop || '',
    kharifCrop: profile.landDetails?.kharifCrop || '',
    zaidCrop: profile.landDetails?.zaidCrop || '',
  };

  const handleSave = async (data: typeof initialData) => {
    try {
      await updateLandDetails(data);
      router.back();
    } catch (error) {
      console.error("Error saving land details:", error);
    }
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
          {T.translate("landDetails.title")}
        </AppText>
      </View>

      <ScrollView className="flex-1">
        <View className="p-4">
          <LandDetailsForm
            initialData={initialData}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        </View>
      </ScrollView>
    </View>
  );
};

export default LandDetailsScreen;

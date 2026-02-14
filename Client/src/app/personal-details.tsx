// src/app/personal-details.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { ActivityIndicator, Pressable, ScrollView, View } from "react-native";
import AppText from "../components/atoms/AppText";
import PersonalDetailsForm from "../components/molecules/PersonalDetailsForm";

import { useUserProfile } from "../contexts/UserProfileContext";
import T from "../i18n";

export const unstable_settings = {
  headerShown: false,
};

const PersonalDetailsScreen = () => {
  const router = useRouter();
  const { profile, loading, updatePersonalDetails } = useUserProfile();

  if (loading || !profile) {
    return (
      <View style={{ flex: 1, backgroundColor: "#F9FAFB", alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color="#386641" />
        <AppText variant="bodyMd" style={{ color: "#6B7280", marginTop: 12 }}>
          Loading...
        </AppText>
      </View>
    );
  }

  const initialData = {
    name: profile.name || '',
    age: profile.age || 0,
    gender: profile.gender || '',
    fathersName: profile.fathersName || '',
    mothersName: profile.mothersName || '',
    educationalQualification: profile.educationalQualification || '',
    sonsMarried: profile.sonsMarried || 0,
    sonsUnmarried: profile.sonsUnmarried || 0,
    daughtersMarried: profile.daughtersMarried || 0,
    daughtersUnmarried: profile.daughtersUnmarried || 0,
    otherFamilyMembers: profile.otherFamilyMembers || 0,
    village: profile.village || '',
    gramPanchayat: profile.gramPanchayat || '',
    nyayPanchayat: profile.nyayPanchayat || '',
    postOffice: profile.postOffice || '',
    tehsil: profile.tehsil || '',
    block: profile.block || '',
    district: profile.district || '',
    pinCode: profile.pinCode || '',
    state: profile.state || '',
  };

  const handleSave = async (data: typeof initialData) => {
    try {
      await updatePersonalDetails(data);
      router.back();
    } catch (error) {
      console.error("Error saving personal details:", error);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
      {/* Custom Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingTop: 48,
          paddingBottom: 20,
          paddingHorizontal: 20,
          backgroundColor: "#386641",
        }}
      >
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => ({
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: "rgba(255,255,255,0.2)",
            alignItems: "center",
            justifyContent: "center",
            marginRight: 12,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </Pressable>
        <View style={{ flex: 1 }}>
          <AppText variant="h2" style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 22 }}>
            {T.translate("personalDetails.title")}
          </AppText>
          <AppText variant="bodySm" style={{ color: "rgba(255,255,255,0.8)", marginTop: 2 }}>
            {T.translate("personalDetails.editSubtitle")}
          </AppText>
        </View>
      </View>

      <View style={{ flex: 1, padding: 16 }}>
        <PersonalDetailsForm
          initialData={initialData}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </View>
    </View>
  );
};

export default PersonalDetailsScreen;

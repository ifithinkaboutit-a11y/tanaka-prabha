// src/app/livestock-details.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { ActivityIndicator, Pressable, View } from "react-native";
import AppText from "../components/atoms/AppText";
import LivestockDetailsForm from "../components/molecules/LivestockDetailsForm";

import { useUserProfile } from "../contexts/UserProfileContext";
import T from "../i18n";

export const unstable_settings = {
  headerShown: false,
};

const LivestockDetailsScreen = () => {
  const router = useRouter();
  const { profile, loading, updateLivestockDetails } = useUserProfile();

  if (loading || !profile) {
    return (
      <View style={{ flex: 1, backgroundColor: "#F8FAFC", alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color="#386641" />
        <AppText variant="bodyMd" style={{ color: "#6B7280", marginTop: 12 }}>
          Loading...
        </AppText>
      </View>
    );
  }

  const initialData = {
    cow: profile.livestockDetails?.cow || 0,
    buffalo: profile.livestockDetails?.buffalo || 0,
    sheep: profile.livestockDetails?.sheep || 0,
    goat: profile.livestockDetails?.goat || 0,
    hen: profile.livestockDetails?.poultry || 0,
    others: profile.livestockDetails?.others || 0,
  };

  const handleSave = async (data: typeof initialData) => {
    try {
      await updateLivestockDetails(data);
      router.back();
    } catch (error) {
      console.error("Error saving livestock details:", error);
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
            {T.translate("livestockDetails.title")}
          </AppText>
          <AppText variant="bodySm" style={{ color: "rgba(255,255,255,0.8)", marginTop: 2 }}>
            {T.translate("livestockDetails.editSubtitle")}
          </AppText>
        </View>
      </View>

      <View style={{ flex: 1, padding: 16 }}>
        <LivestockDetailsForm
          initialData={initialData}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </View>
    </View>
  );
};

export default LivestockDetailsScreen;

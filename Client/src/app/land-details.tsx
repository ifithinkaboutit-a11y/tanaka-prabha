// src/app/land-details.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import LandDetailsForm from "../components/molecules/LandDetailsForm";
import { useUserProfile } from "../contexts/UserProfileContext";
import { useTranslation } from "../i18n";

export const unstable_settings = { headerShown: false };

const HEADER_COLOR = "#16A34A";

const LandDetailsScreen = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const { profile, loading, saving, updateLandDetails } = useUserProfile();

  if (loading && !profile) {
    return (
      <View style={s.loader}>
        <ActivityIndicator size="large" color={HEADER_COLOR} />
        <Text style={s.loaderText}>Loading your land details...</Text>
      </View>
    );
  }

  const initialData = {
    totalLandArea: profile?.landDetails?.totalLandArea || 0,
    rabiCrop: profile?.landDetails?.rabiCrop || "",
    kharifCrop: profile?.landDetails?.kharifCrop || "",
    zaidCrop: profile?.landDetails?.zaidCrop || "",
  };

  const handleSave = async (data: typeof initialData) => {
    try {
      await updateLandDetails(data);
      Alert.alert("✅ Saved", "Your land details have been updated.");
      router.back();
    } catch (error) {
      Alert.alert("Error", "Failed to save. Please check your connection.");
      console.error("Error saving land details:", error);
    }
  };

  return (
    <View style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <View style={s.decorCircle1} />
        <View style={s.decorCircle2} />

        <View style={s.headerContent}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [s.backBtn, pressed && { opacity: 0.7 }]}
          >
            <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
          </Pressable>

          <View style={s.headerTextBlock}>
            <View style={s.headerIconBg}>
              <Ionicons name="leaf" size={18} color={HEADER_COLOR} />
            </View>
            <View>
              <Text style={s.headerTitle}>{t("landDetails.editTitle")}</Text>
              <Text style={s.headerSubtitle}>{t("landDetails.editSubtitle")}</Text>
            </View>
          </View>

          {saving && (
            <View style={s.savingIndicator}>
              <ActivityIndicator size="small" color="#FFFFFF" />
              <Text style={s.savingText}>Saving...</Text>
            </View>
          )}
        </View>
      </View>

      {/* Form */}
      <View style={s.formContainer}>
        <LandDetailsForm
          initialData={initialData}
          onSave={handleSave}
          onCancel={() => router.back()}
        />
      </View>
    </View>
  );
};

export default LandDetailsScreen;

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F1F5F9" },

  loader: { flex: 1, backgroundColor: "#F1F5F9", alignItems: "center", justifyContent: "center", gap: 12 },
  loaderText: { color: "#6B7280", fontSize: 15 },

  header: {
    backgroundColor: HEADER_COLOR,
    paddingTop: 52,
    paddingBottom: 24,
    paddingHorizontal: 20,
    overflow: "hidden",
  },
  decorCircle1: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(255,255,255,0.06)",
    top: -40,
    right: -30,
  },
  decorCircle2: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.04)",
    top: 20,
    right: 80,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  headerTextBlock: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerIconBg: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.95)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  headerSubtitle: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    marginTop: 2,
  },
  savingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  savingText: { color: "#FFFFFF", fontSize: 11, fontWeight: "600" },

  formContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
});

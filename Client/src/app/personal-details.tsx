// src/app/personal-details.tsx
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Alert,
  StyleSheet,
  Text,
  View,
} from "react-native";
import PersonalDetailsForm from "../components/molecules/PersonalDetailsForm";
import { useUserProfile } from "../contexts/UserProfileContext";
import { useTranslation } from "../i18n";
import { useOnboardingStore } from "../stores/onboardingStore";

// ── Normalise a human-readable location string to its slug (snake_case) form ──
// Backend may store "Uttar Pradesh" or "uttar pradesh" – dropdowns need "uttar_pradesh"
function toSlug(val?: string | null): string {
  if (!val) return "";
  return val.trim().toLowerCase().replace(/[\s-]+/g, "_");
}

export const unstable_settings = { headerShown: false };

const PersonalDetailsScreen = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const { profile, loading, saving, updatePersonalDetails } = useUserProfile();

  // ── Map address override: written by location-picker, read here ──
  const setProfileAddressOverride = useOnboardingStore((s) => s.setProfileAddressOverride);

  // Track override locally with state so form key changes reliably on update
  const [addressOverride, setAddressOverride] = useState<Record<string, string> | null>(null);

  // Auto-apply map address override every time this screen comes into focus
  // (e.g. when the user returns from the location picker)
  useFocusEffect(
    useCallback(() => {
      const override = useOnboardingStore.getState().profileAddressOverride;
      if (override && Object.keys(override).length > 0) {
        setAddressOverride(override);
        // Clear from store immediately after consuming so it doesn't persist
        setProfileAddressOverride(null);
      }
    }, [setProfileAddressOverride])
  );

  if (loading && !profile) {
    return (
      <View style={s.loader}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={s.loaderText}>Loading your details...</Text>
      </View>
    );
  }

  // ── Build initialData: normalise backend strings → slugs, apply map overrides ──
  const ov = addressOverride ?? {};
  const initialData = {
    name: profile?.name || "",
    age: profile?.age || 0,
    gender: profile?.gender || "",
    aadhaar: "",
    fathersName: profile?.fathersName || "",
    mothersName: profile?.mothersName || "",
    educationalQualification: profile?.educationalQualification || "",
    sonsMarried: profile?.sonsMarried || 0,
    sonsUnmarried: profile?.sonsUnmarried || 0,
    daughtersMarried: profile?.daughtersMarried || 0,
    daughtersUnmarried: profile?.daughtersUnmarried || 0,
    otherFamilyMembers: profile?.otherFamilyMembers || 0,
    state: ov.state ?? toSlug(profile?.state),
    district: ov.district ?? toSlug(profile?.district),
    tehsil: ov.tehsil ?? toSlug(profile?.tehsil),
    block: ov.block ?? toSlug(profile?.block),
    village: ov.village ?? (profile?.village || ""),
    gramPanchayat: profile?.gramPanchayat || "",
    nyayPanchayat: profile?.nyayPanchayat || "",
    postOffice: profile?.postOffice || "",
    pinCode: ov.pinCode ?? (profile?.pinCode || ""),
  };

  const handleSave = async (data: typeof initialData) => {
    try {
      await updatePersonalDetails(data);
      Alert.alert("✅ Saved", "Your personal details have been updated.");
      router.back();
    } catch (error) {
      Alert.alert("Error", "Failed to save. Please check your connection.");
      console.error("Error saving personal details:", error);
    }
  };

  const handleOpenMap = () => {
    router.push({
      pathname: "/location-picker" as any,
      params: { purpose: "profile" },
    });
  };

  // Key changes when override arrives → form re-mounts with new initialData
  const formKey = addressOverride
    ? JSON.stringify(addressOverride)
    : "default";

  return (
    <View style={s.root}>
      {/* Header */}
      <View style={s.header}>
        {/* Decorative circles */}
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
              <Ionicons name="person" size={18} color="#2563EB" />
            </View>
            <View>
              <Text style={s.headerTitle}>{t("personalDetails.title")}</Text>
              <Text style={s.headerSubtitle}>{t("personalDetails.editSubtitle")}</Text>
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

      {/* Map auto-fill success banner */}
      {!!addressOverride && (
        <View style={s.mapBanner}>
          <Ionicons name="checkmark-circle" size={16} color="#16A34A" />
          <Text style={s.mapBannerText}>
            {t("personalDetails.addressAutoFilled")}
          </Text>
        </View>
      )}

      {/* Form — passes addressOverride so only address fields update without full remount */}
      <View style={s.formContainer}>
        <PersonalDetailsForm
          initialData={initialData}
          addressOverride={addressOverride ?? undefined}
          onSave={handleSave}
          onCancel={() => router.back()}
          onOpenMap={handleOpenMap}
        />
      </View>
    </View>
  );
};

export default PersonalDetailsScreen;

const HEADER_COLOR = "#2563EB";

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

  mapBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#DCFCE7",
    borderBottomWidth: 1,
    borderBottomColor: "#BBF7D0",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  mapBannerText: { color: "#166534", fontSize: 13, fontWeight: "600", flex: 1 },

  formContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
});
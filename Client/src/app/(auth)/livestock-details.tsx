// src/app/(auth)/livestock-details.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StatusBar,
  StyleSheet,
  View,
  TextInput,
} from "react-native";
import KeyboardAwareScrollView from "../../components/atoms/KeyboardAwareScrollView";
import AppText from "../../components/atoms/AppText";
import Toggle from "../../components/atoms/Toggle";
import Select from "../../components/atoms/Select";
import TextArea from "../../components/atoms/TextArea";
import { useOnboardingStore, LivestockEntry } from "../../stores/onboardingStore";
import { useAuth } from "../../contexts/AuthContext";
import { useTranslation } from "../../i18n";
import {
  animalTypes,
  cropTypes,
  getLocalizedOptions,
  indianStates as stateOptions,
} from "../../data/content/onboardingOptions";
import { theme } from "../../styles/colors";
import { indianDistricts } from "../../data/indianLocations";
import { validateLivestockEntry, validateLivestockCount } from "../../utils/validation";
import { translateKnownError } from "../../utils/translatedErrors";

import { userApi } from "../../services/apiService";

// ── helpers: resolve slug value → human-readable label ──────────────────────
function resolveStateLabel(value: string, lang: string = "en"): string {
  const found = stateOptions.find((s) => s.value === value);
  if (!found) return value;
  return lang === "hi" ? (found.labelHi ?? found.label) : found.label;
}

function resolveDistrictLabel(value: string, lang: string): string {
  const found = indianDistricts.find((d) => d.value === value);
  if (!found) return value;
  return lang === "hi" ? (found.labelHi ?? found.label) : found.label;
}

function resolveCropLabel(value: string, lang: string): string {
  const found = cropTypes.find((c) => c.value === value);
  if (!found) return value;
  return lang === "hi" ? (found.labelHi ?? found.label) : found.label;
}

function resolveAnimalLabel(type: string, lang: string): string {
  const item = animalTypes.find((a) => a.value === type);
  if (!item) return type;
  return lang === "hi" ? (item.labelHi ?? item.label) : item.label;
}

export const unstable_settings = {
  headerShown: false,
};

// Unique accent colors for each livestock entry (cycles if more than 6 entries)
const ENTRY_ACCENT_COLORS = [
  "#16A34A", // green
  "#2563EB", // blue
  "#D97706", // amber
  "#9333EA", // purple
  "#DC2626", // red
  "#0891B2", // cyan
];

interface EntryErrors {
  [entryId: string]: {
    type?: string;
    count?: string;
  };
}

const AuthLivestockDetailsScreen = () => {
  const router = useRouter();
  const { t, currentLanguage } = useTranslation();
  const { refreshUser, completeOnboarding } = useAuth();
  const {
    hasLivestock,
    setHasLivestock,
    livestockEntries,
    addLivestockEntry,
    removeLivestockEntry,
    updateLivestockEntry,
    personalDetails,
    hasLand,
    landEntries,
    locationData,
    landLocationData,
    resetOnboarding,
  } = useOnboardingStore();

  const [errors, setErrors] = useState<EntryErrors>({});
  const [touched, setTouched] = useState<Record<string, Record<string, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [otherTypeText, setOtherTypeText] = useState<Record<string, string>>({});

  const animalOptions = getLocalizedOptions(animalTypes, currentLanguage);

  const validateAllEntries = (): boolean => {
    if (!hasLivestock) return true;

    let allValid = true;
    const newErrors: EntryErrors = {};

    livestockEntries.forEach((entry) => {
      const validation = validateLivestockEntry({
        type: entry.type,
        count: entry.count,
      });

      if (!validation.isValid) {
        allValid = false;
        const entryErrors: { type?: string; count?: string } = {};

        validation.errors.forEach((error) => {
          if (error.toLowerCase().includes("type") || error.toLowerCase().includes("animal")) {
            entryErrors.type = translateKnownError(error, t) || error;
          } else if (error.toLowerCase().includes("count")) {
            entryErrors.count = translateKnownError(error, t) || error;
          }
        });

        newErrors[entry.id] = entryErrors;
      }
    });

    setErrors(newErrors);
    return allValid;
  };

  const handleCountChange = (entryId: string, text: string) => {
    const num = parseInt(text) || 0;
    updateLivestockEntry(entryId, { count: num });

    if (touched[entryId]?.count) {
      const validation = validateLivestockCount(num);
      setErrors((prev) => ({
        ...prev,
        [entryId]: {
          ...prev[entryId],
          count: translateKnownError(validation.errors[0], t),
        },
      }));
    }
  };

  const handleCountBlur = (entryId: string, count: number) => {
    setTouched((prev) => ({
      ...prev,
      [entryId]: { ...prev[entryId], count: true },
    }));

    const validation = validateLivestockCount(count);
    if (count <= 0) {
      setErrors((prev) => ({
        ...prev,
        [entryId]: { ...prev[entryId], count: t("validation.animalCountPositive") },
      }));
    } else if (!validation.isValid) {
      setErrors((prev) => ({
        ...prev,
        [entryId]: {
          ...prev[entryId],
          count: translateKnownError(validation.errors[0], t),
        },
      }));
    } else {
      setErrors((prev) => ({
        ...prev,
        [entryId]: { ...prev[entryId], count: undefined },
      }));
    }
  };

  const handleTypeChange = (entryId: string, type: string) => {
    updateLivestockEntry(entryId, { type });

    if (type) {
      setErrors((prev) => ({
        ...prev,
        [entryId]: { ...prev[entryId], type: undefined },
      }));
    }
  };

  const saveOnboardingData = async () => {
    try {
      const profileData: any = {
        // ── Personal info (ALL fields, matching seed script exactly) ──
        name: personalDetails.name || undefined,
        age: personalDetails.age || undefined,
        // gender must be lowercase — DB constraint: 'male' | 'female' | 'other'
        gender: personalDetails.gender?.toLowerCase() || undefined,
        aadhaar_number: personalDetails.aadhaar || undefined,
        fathers_name: personalDetails.fathersName || undefined,
        mothers_name: personalDetails.mothersName || undefined,
        educational_qualification: personalDetails.educationalQualification || undefined,
        sons_married: personalDetails.sonsMarried || 0,
        sons_unmarried: personalDetails.sonsUnmarried || 0,
        daughters_married: personalDetails.daughtersMarried || 0,
        daughters_unmarried: personalDetails.daughtersUnmarried || 0,
        other_family_members: personalDetails.otherFamilyMembers || 0,
        village: personalDetails.village || undefined,
        gram_panchayat: personalDetails.gramPanchayat || undefined,
        nyay_panchayat: personalDetails.nyayPanchayat || undefined,
        post_office: personalDetails.postOffice || undefined,
        tehsil: personalDetails.tehsil || undefined,
        block: personalDetails.block || undefined,
        pin_code: personalDetails.pinCode || undefined,
        // Resolve slug values → human-readable labels to match seed format
        state: personalDetails.state ? resolveStateLabel(personalDetails.state, currentLanguage) : undefined,
        district: personalDetails.district ? resolveDistrictLabel(personalDetails.district, currentLanguage) : undefined,
      };

      // Attach confirmed GPS location from the location picker
      if (locationData && locationData.method === 'gps' && locationData.lat && locationData.lng) {
        profileData.latitude = locationData.lat;
        profileData.longitude = locationData.lng;
      }

      if (hasLand && landEntries.length > 0) {
        let totalArea = 0;
        const allCropLabels: string[] = [];

        landEntries.forEach((entry) => {
          // Convert to Bigha (the unit used in seed data)
          let areaInBigha = entry.area;
          if (entry.unit === "acre") {
            areaInBigha = entry.area * 1.613; // 1 acre ≈ 1.613 bigha
          } else if (entry.unit === "hectare") {
            areaInBigha = entry.area * 3.987; // 1 hectare ≈ 3.987 bigha
          }
          totalArea += areaInBigha;

          // Resolve crop slugs to labels
          if (entry.crops) {
            entry.crops.forEach((crop) => {
              const label = resolveCropLabel(crop, currentLanguage);
              if (!allCropLabels.includes(label)) {
                allCropLabels.push(label);
              }
            });
          }
        });

        // Season classification — case-insensitive match on label
        const rabiKeywords = ["wheat", "mustard", "gram", "barley", "pea", "lentil"];
        const kharifKeywords = ["rice", "maize", "cotton", "soybean", "groundnut", "sugarcane", "onion", "potato", "tomato", "pulses"];
        const zaidKeywords = ["vegetables", "fruits", "watermelon", "fodder", "moong"];

        const rabiCrops = allCropLabels.filter((l) => rabiKeywords.some((k) => l.toLowerCase().includes(k)));
        const kharifCrops = allCropLabels.filter((l) => kharifKeywords.some((k) => l.toLowerCase().includes(k)));
        const zaidCrops = allCropLabels.filter((l) => zaidKeywords.some((k) => l.toLowerCase().includes(k)));
        // Any unclassified go to zaid
        const classified = [...rabiCrops, ...kharifCrops, ...zaidCrops];
        const otherCrops = allCropLabels.filter((l) => !classified.includes(l));

        profileData.land_details = {
          total_land_area: Math.round(totalArea * 100) / 100,
          rabi_crop: rabiCrops.join(", ") || otherCrops.join(", ") || undefined,
          kharif_crop: kharifCrops.join(", ") || undefined,
          zaid_crop: zaidCrops.length > 0 ? zaidCrops.join(", ") : undefined,
        };

        if (landLocationData && landLocationData.method === 'gps' && landLocationData.lat && landLocationData.lng) {
          profileData.land_details.latitude = landLocationData.lat;
          profileData.land_details.longitude = landLocationData.lng;
          profileData.land_details.location_address = landLocationData.address;
        }
      }

      if (hasLivestock && livestockEntries.length > 0) {
        const livestockData: any = {
          cow: 0, buffalo: 0, goat: 0, sheep: 0,
          pig: 0, poultry: 0, others: 0,
        };

        livestockEntries.forEach((entry) => {
          const type = entry.type.toLowerCase();
          if (type in livestockData) {
            livestockData[type] += entry.count;
          } else {
            livestockData.others += entry.count;
          }
        });

        profileData.livestock_details = livestockData;
      }

      console.log("📤 Saving onboarding data:", JSON.stringify(profileData, null, 2));

      const response = await userApi.updateProfile(profileData);

      if (response.status === "success") {
        console.log("✅ Onboarding data saved successfully");
        await refreshUser();
        resetOnboarding();
        return true;
      } else {
        throw new Error(response.message || "Failed to save profile");
      }
    } catch (error) {
      console.error("❌ Failed to save onboarding data:", error);
      throw error;
    }
  };

  const handleFinish = async () => {
    if (hasLivestock && !validateAllEntries()) {
      const firstErrorEntry = Object.values(errors).find((e) => e.type || e.count);
      const errorMessage =
        firstErrorEntry?.type ||
        firstErrorEntry?.count ||
        t("validation.livestockDetailsError") ||
        "Please fill in all livestock details correctly";

      Alert.alert(t("validation.validationError") || "Validation Error", errorMessage);

      const newTouched: Record<string, Record<string, boolean>> = {};
      livestockEntries.forEach((entry) => {
        newTouched[entry.id] = { type: true, count: true };
      });
      setTouched(newTouched);
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Save all onboarding data to the backend and refresh the local auth user.
      //    saveOnboardingData() calls userApi.updateProfile() then refreshUser() so
      //    the dashboard immediately reflects the new name, district, land & livestock.
      await saveOnboardingData();

      // 2. Mark onboarding as complete and navigate to the main tabs.
      //    We do NOT pass `data` here because the API write is already done above.
      //    completeOnboarding(undefined) just sets needsOnboarding=false and routes.
      await completeOnboarding();
    } catch (error) {
      Alert.alert(
        t("common.error") || "Error",
        error instanceof Error
          ? translateKnownError(error.message, t) || error.message
          : t("validation.profileSaveFailed")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = async () => {
    setIsSubmitting(true);
    try {
      // Best-effort save — if it fails we still let the user proceed
      await saveOnboardingData();
    } catch (error) {
      console.warn("Could not save onboarding data on skip:", error);
    } finally {
      setIsSubmitting(false);
    }
    // Navigate regardless — data is persisted in the store and can sync later
    await completeOnboarding();
  };

  const handleBack = () => {
    router.back();
  };

  const isValid = () => {
    if (!hasLivestock) return true;
    return livestockEntries.some((entry) => entry.type !== "" && entry.count > 0);
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background.input }}>
      <StatusBar barStyle="light-content" backgroundColor={theme.primary.green} />
      {/* Static Header */}
      <View style={headerStyles.header}>
        <View style={headerStyles.progressTrack}>
          <View style={[headerStyles.progressFill, { width: "100%" }]} />
        </View>
        <AppText variant="h2" style={headerStyles.headerTitle}>
          {t("onboarding.livestockTitle") || "Livestock Details"}
        </AppText>
        <AppText variant="bodySm" style={headerStyles.headerSubtitle}>
          {t("onboarding.livestockSubtitle") || "Tell us about your livestock"}
        </AppText>
      </View>

      <View style={{ flex: 1 }}>
        <KeyboardAwareScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Has Livestock Toggle */}
          <View className="bg-gray-50 rounded-2xl p-5 mb-4">
            <View className="flex-row justify-between items-center">
              <AppText variant="bodyMd" className="font-semibold text-gray-700">
                {t("onboarding.hasLivestock")}
              </AppText>
              <Toggle
                checked={hasLivestock}
                onChange={(value) => {
                  setHasLivestock(value);
                  if (value && livestockEntries.length === 0) {
                    addLivestockEntry({ type: "", count: 0 });
                  }
                }}
              />
            </View>
          </View>

          {/* Livestock Entries */}
          {hasLivestock && (
            <>
              {livestockEntries.map((entry, index) => {
                const accentColor = ENTRY_ACCENT_COLORS[index % ENTRY_ACCENT_COLORS.length];
                return (
                <View
                  key={entry.id}
                  className="bg-white rounded-2xl p-5 mb-4 shadow-sm elevation-2"
                  style={{ borderLeftColor: accentColor, borderLeftWidth: 4 }}
                >
                  {/* Entry Header */}
                  <View className="flex-row justify-between items-center mb-4">
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                      <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: accentColor, alignItems: "center", justifyContent: "center" }}>
                        <AppText variant="bodySm" style={{ color: "#fff", fontWeight: "700" }}>
                          {index + 1}
                        </AppText>
                      </View>
                      <AppText variant="bodyMd" className="font-bold text-gray-800">
                        {t("onboarding.livestockEntry")} {index + 1}
                      </AppText>
                    </View>
                    {livestockEntries.length > 1 && (
                      <Pressable
                        onPress={() => removeLivestockEntry(entry.id)}
                        className="p-2 active:opacity-70"
                      >
                        <Ionicons name="trash-outline" size={20} color={theme.semantic.like} />
                      </Pressable>
                    )}
                  </View>

                  {/* Animal Type */}
                  <View className="mb-4">
                    <AppText variant="bodySm" className="text-gray-500 mb-2">
                      {t("onboarding.animalType")}
                    </AppText>
                    <View
                      style={{
                        borderWidth: errors[entry.id]?.type && touched[entry.id]?.type ? 1 : 0,
                        borderColor: errors[entry.id]?.type && touched[entry.id]?.type ? theme.semantic.errorLight : "transparent",
                        borderRadius: 12,
                      }}
                    >
                      <Select
                        value={entry.type}
                        onChange={(value) => handleTypeChange(entry.id, value)}
                        options={animalOptions}
                        placeholder={t("onboarding.selectAnimal")}
                      />
                    </View>
                    {errors[entry.id]?.type && touched[entry.id]?.type && (
                      <AppText variant="bodySm" className="text-red-500 mt-1">
                        {errors[entry.id].type}
                      </AppText>
                    )}
                  </View>

                  {/* Count Input */}
                  <View>
                    <AppText variant="bodySm" className="text-gray-500 mb-2">
                      {t("onboarding.animalCount")}
                    </AppText>
                    <TextInput
                      style={{
                        backgroundColor: theme.background.neutralSubtle,
                        borderWidth: 1,
                        borderColor: errors[entry.id]?.count && touched[entry.id]?.count ? theme.semantic.errorLight : theme.border.subtle,
                        borderRadius: 12,
                        padding: 14,
                        fontSize: 16,
                        color: theme.text.secondary,
                      }}
                      value={entry.count > 0 ? String(entry.count) : ""}
                      onChangeText={(text) => handleCountChange(entry.id, text)}
                      onBlur={() => handleCountBlur(entry.id, entry.count)}
                      keyboardType="numeric"
                      placeholder="0"
                      placeholderTextColor={theme.text.placeholder}
                    />
                    {errors[entry.id]?.count && touched[entry.id]?.count && (
                      <AppText variant="bodySm" className="text-red-500 mt-1">
                        {errors[entry.id].count}
                      </AppText>
                    )}
                  </View>
                </View>
                );
              })}

              {/* Add Another Entry */}
              <Pressable
                onPress={() => addLivestockEntry({ type: "", count: 0 })}
                className="flex-row items-center justify-center rounded-xl p-4 mb-4 border-2 border-yellow-300 border-dashed active:bg-yellow-100 bg-yellow-50"
              >
                <Ionicons name="add-circle-outline" size={20} color={theme.semantic.ongoingAction} />
                <AppText variant="bodySm" className="text-amber-600 font-semibold ml-2">
                  {t("onboarding.addAnotherLivestock")}
                </AppText>
              </Pressable>
            </>
          )}

          {/* Completion Message */}
          <View style={{ backgroundColor: theme.background.successSubtle, borderRadius: 14, padding: 16, marginTop: 8, flexDirection: "row", alignItems: "center", gap: 12, borderWidth: 1, borderColor: theme.semantic.successBackground }}>
            <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: theme.semantic.successBackground, alignItems: "center", justifyContent: "center" }}>
              <Ionicons name="checkmark" size={20} color={theme.semantic.successText} />
            </View>
            <View style={{ flex: 1 }}>
              <AppText variant="bodyMd" style={{ color: theme.semantic.successText, fontWeight: "700" }}>
                {t("onboarding.almostDone")}
              </AppText>
              <AppText variant="bodySm" style={{ color: theme.semantic.successText, marginTop: 2 }}>
                {t("onboarding.finishMessage")}
              </AppText>
            </View>
          </View>
        </KeyboardAwareScrollView>

        {/* Bottom Buttons */}
        <View style={{ padding: 20, backgroundColor: theme.background.input, borderTopWidth: 1, borderTopColor: theme.border.subtle, flexDirection: "row", gap: 12 }}>
          {/* <Pressable
            onPress={handleSkip}
            disabled={isSubmitting}
            style={{ flex: 1, paddingVertical: 16, borderRadius: 999, backgroundColor: theme.background.input, borderWidth: 1, borderColor: theme.border.card, alignItems: "center", opacity: isSubmitting ? 0.5 : 1 }}
          >
            <AppText variant="bodyMd" style={{ color: theme.text.muted, fontWeight: "600" }}>
              {t("common.skip")}
            </AppText>
          </Pressable> */}

          <Pressable
            onPress={handleFinish}
            disabled={!isValid() || isSubmitting}
            style={{ flex: 2, paddingVertical: 16, borderRadius: 999, alignItems: "center", flexDirection: "row", justifyContent: "center", backgroundColor: isValid() && !isSubmitting ? theme.primary.green : theme.border.card }}
          >
            {isSubmitting ? (
              <ActivityIndicator color={theme.text.onPrimary} size="small" />
            ) : (
              <>
                <AppText variant="bodyMd" style={{ color: "#fff", fontWeight: "700" }}>
                  {t("onboarding.finish")}
                </AppText>
                <Ionicons name="checkmark-circle" size={20} color={theme.text.onPrimary} style={{ marginLeft: 8 }} />
              </>
            )}
          </Pressable>
        </View>
      </View>
    </View>
  );
};

export default AuthLivestockDetailsScreen;

const headerStyles = StyleSheet.create({
  header: {
    backgroundColor: theme.primary.green,
    paddingTop: 56,
    paddingBottom: 28,
    paddingHorizontal: 24,
  },
  progressTrack: {
    height: 4,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 2,
    marginBottom: 16,
    overflow: "hidden",
  },
  progressFill: {
    height: 4,
    backgroundColor: theme.text.onPrimary,
    borderRadius: 2,
  },
  headerTitle: {
    color: theme.text.onPrimary,
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: -0.5,
    marginBottom: 6,
    textTransform: "uppercase",
  },
  headerSubtitle: {
    color: "rgba(255,255,255,0.82)",
    fontSize: 14,
    lineHeight: 20,
  },
});

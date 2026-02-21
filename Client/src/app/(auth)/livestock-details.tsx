// src/app/(auth)/livestock-details.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  View,
  TextInput,
  Dimensions,
} from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";
import MediaPath from "../../constants/MediaPath";
import AppText from "../../components/atoms/AppText";
import Toggle from "../../components/atoms/Toggle";
import Select from "../../components/atoms/Select";
import { useOnboardingStore, LivestockEntry } from "../../stores/onboardingStore";
import { useAuth } from "../../contexts/AuthContext";
import { useTranslation } from "../../i18n";
import {
  animalTypes,
  getLocalizedOptions,
} from "../../data/content/onboardingOptions";
import { validateLivestockEntry, validateLivestockCount } from "../../utils/validation";
import { userApi } from "../../services/apiService";

export const unstable_settings = {
  headerShown: false,
};

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
    resetOnboarding,
  } = useOnboardingStore();

  const [errors, setErrors] = useState<EntryErrors>({});
  const [touched, setTouched] = useState<Record<string, Record<string, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
            entryErrors.type = error;
          } else if (error.toLowerCase().includes("count")) {
            entryErrors.count = error;
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
        [entryId]: { ...prev[entryId], count: validation.errors[0] },
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
        [entryId]: { ...prev[entryId], count: "Animal count must be greater than 0" },
      }));
    } else if (!validation.isValid) {
      setErrors((prev) => ({
        ...prev,
        [entryId]: { ...prev[entryId], count: validation.errors[0] },
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
        fathers_name: personalDetails.fathersName,
        mothers_name: personalDetails.mothersName,
        educational_qualification: personalDetails.educationalQualification,
        sons_married: personalDetails.sonsMarried || 0,
        sons_unmarried: personalDetails.sonsUnmarried || 0,
        daughters_married: personalDetails.daughtersMarried || 0,
        daughters_unmarried: personalDetails.daughtersUnmarried || 0,
        other_family_members: personalDetails.otherFamilyMembers || 0,
        village: personalDetails.village,
        gram_panchayat: personalDetails.gramPanchayat,
        nyay_panchayat: personalDetails.nyayPanchayat,
        post_office: personalDetails.postOffice,
        tehsil: personalDetails.tehsil,
        block: personalDetails.block,
        district: personalDetails.district,
        pin_code: personalDetails.pinCode,
        state: personalDetails.state,
      };

      // Attach confirmed GPS location if user pinned their farm.
      // Sends as flat latitude/longitude — the existing User.update() on the server
      // already converts these into a PostGIS GEOGRAPHY point correctly.
      // The full nested location object (address, accuracy, method) will be re-enabled
      // once the server migration (002_add_location_picker_columns.sql) is deployed.
      if (locationData && locationData.method === 'gps' && locationData.lat && locationData.lng) {
        profileData.latitude = locationData.lat;
        profileData.longitude = locationData.lng;
      }

      if (hasLand && landEntries.length > 0) {
        let totalArea = 0;
        const crops: string[] = [];

        landEntries.forEach((entry) => {
          let areaInAcres = entry.area;
          if (entry.unit === "bigha") {
            areaInAcres = entry.area * 0.62;
          } else if (entry.unit === "hectare") {
            areaInAcres = entry.area * 2.47;
          }
          totalArea += areaInAcres;

          if (entry.crops) {
            entry.crops.forEach((crop) => {
              if (!crops.includes(crop)) {
                crops.push(crop);
              }
            });
          }
        });

        profileData.land_details = {
          total_land_area: Math.round(totalArea * 100) / 100,
          kharif_crop: crops.filter((c) => ["rice", "maize", "cotton", "soybean"].includes(c)).join(", "),
          rabi_crop: crops.filter((c) => ["wheat", "mustard", "gram", "barley"].includes(c)).join(", "),
          zaid_crop: crops.filter((c) => ["vegetables", "fruits", "fodder"].includes(c)).join(", "),
        };
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
      await saveOnboardingData();
      completeOnboarding();
    } catch (error) {
      Alert.alert(
        t("common.error") || "Error",
        error instanceof Error ? error.message : "Failed to save your profile. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = async () => {
    setIsSubmitting(true);
    try {
      await saveOnboardingData();
      completeOnboarding();
    } catch (error) {
      console.error("Failed to save on skip:", error);
      completeOnboarding();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const isValid = () => {
    if (!hasLivestock) return true;
    return livestockEntries.some((entry) => entry.type !== "" && entry.count > 0);
  };

  const { height: screenHeight } = Dimensions.get("window");
  const videoHeight = screenHeight * 0.28;

  const player = useVideoPlayer(MediaPath.videos.authBackground, (player) => {
    player.loop = true;
    player.muted = true;
    player.play();
  });

  return (
    <View className="flex-1 bg-[#F8FAFC]">
      {/* Video Background Header */}
      <View style={{ height: videoHeight, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, overflow: 'hidden' }} className="relative">
        <VideoView
          player={player}
          style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, width: "100%", height: "100%" }}
          contentFit="cover"
          nativeControls={false}
          allowsPictureInPicture={false}
        />
        {/* Progress Bar */}
        <View
          className="absolute left-5 right-5 h-1.5 rounded-full bg-white/30"
          style={{ top: 50 }}
        >
          <View className="w-full h-full bg-amber-400 rounded-full" />
        </View>
      </View>

      {/* Content Card */}
      <View className="flex-1 bg-white" style={{ borderTopLeftRadius: 24, borderTopRightRadius: 24, marginTop: -24, paddingTop: 24 }}>
        {/* Title Section */}
        <View className="items-center px-5 mb-4">
          <AppText
            variant="h3"
            className="font-bold text-gray-800 text-[22px] text-center"
          >
            {t("onboarding.livestockTitle")}
          </AppText>
          <AppText
            variant="bodySm"
            className="text-gray-500 mt-1.5 text-center"
          >
            {t("onboarding.livestockSubtitle")}
          </AppText>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <ScrollView
            className="flex-1"
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
                {livestockEntries.map((entry, index) => (
                  <View
                    key={entry.id}
                    className="bg-white rounded-2xl p-5 mb-4 shadow-sm elevation-2"
                  >
                    {/* Entry Header */}
                    <View className="flex-row justify-between items-center mb-4">
                      <AppText variant="bodyMd" className="font-bold text-gray-800">
                        {t("onboarding.livestockEntry")} {index + 1}
                      </AppText>
                      {livestockEntries.length > 1 && (
                        <Pressable
                          onPress={() => removeLivestockEntry(entry.id)}
                          className="p-2 active:opacity-70"
                        >
                          <Ionicons name="trash-outline" size={20} color="#DC2626" />
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
                          borderColor: "#EF4444",
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
                          backgroundColor: "#F9FAFB",
                          borderWidth: 1,
                          borderColor: errors[entry.id]?.count && touched[entry.id]?.count ? "#EF4444" : "#E5E7EB",
                          borderRadius: 12,
                          padding: 14,
                          fontSize: 16,
                          color: "#1F2937",
                        }}
                        value={entry.count > 0 ? String(entry.count) : ""}
                        onChangeText={(text) => handleCountChange(entry.id, text)}
                        onBlur={() => handleCountBlur(entry.id, entry.count)}
                        keyboardType="numeric"
                        placeholder="0"
                        placeholderTextColor="#9CA3AF"
                      />
                      {errors[entry.id]?.count && touched[entry.id]?.count && (
                        <AppText variant="bodySm" className="text-red-500 mt-1">
                          {errors[entry.id].count}
                        </AppText>
                      )}
                    </View>
                  </View>
                ))}

                {/* Add Another Entry */}
                <Pressable
                  onPress={() => addLivestockEntry({ type: "", count: 0 })}
                  className="flex-row items-center justify-center rounded-xl p-4 mb-4 border-2 border-yellow-300 border-dashed active:bg-yellow-100 bg-yellow-50"
                >
                  <Ionicons name="add-circle-outline" size={20} color="#D97706" />
                  <AppText variant="bodySm" className="text-amber-600 font-semibold ml-2">
                    {t("onboarding.addAnotherLivestock")}
                  </AppText>
                </Pressable>
              </>
            )}

            {/* Completion Message */}
            <View className="bg-green-100 rounded-2xl p-5 mt-2 items-center">
              <Ionicons name="checkmark-circle" size={48} color="#16A34A" />
              <AppText variant="bodyMd" className="text-green-800 font-semibold mt-3 text-center">
                {t("onboarding.almostDone")}
              </AppText>
              <AppText variant="bodySm" className="text-green-700 mt-1 text-center">
                {t("onboarding.finishMessage")}
              </AppText>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Bottom Buttons */}
        <View className="p-5 bg-white border-t border-gray-200 flex-row gap-3">
          <Pressable
            onPress={handleSkip}
            disabled={isSubmitting}
            className="flex-1 py-4 rounded-full bg-white border border-gray-300 items-center active:bg-gray-100"
            style={{ opacity: isSubmitting ? 0.5 : 1 }}
          >
            <AppText variant="bodyMd" className="text-gray-500 font-semibold">
              {t("common.skip")}
            </AppText>
          </Pressable>

          <Pressable
            onPress={handleFinish}
            disabled={!isValid() || isSubmitting}
            className="flex-[2] py-4 rounded-full items-center flex-row justify-center"
            style={{
              backgroundColor: isValid() && !isSubmitting ? "#386641" : "#D1D5DB",
            }}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <AppText variant="bodyMd" className="text-white font-bold">
                  {t("onboarding.finish")}
                </AppText>
                <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" style={{ marginLeft: 8 }} />
              </>
            )}
          </Pressable>
        </View>
      </View>
    </View>
  );
};

export default AuthLivestockDetailsScreen;
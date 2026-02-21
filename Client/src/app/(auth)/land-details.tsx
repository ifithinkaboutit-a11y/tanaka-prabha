// src/app/(auth)/land-details.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  View,
  TextInput,
  Alert,
  Dimensions,
} from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";
import MediaPath from "../../constants/MediaPath";
import AppText from "../../components/atoms/AppText";
import Button from "../../components/atoms/Button";
import Toggle from "../../components/atoms/Toggle";
import MultiSelect from "../../components/atoms/MultiSelect";
import Select from "../../components/atoms/Select";
import { useOnboardingStore, LandEntry } from "../../stores/onboardingStore";
import { useTranslation } from "../../i18n";
import {
  cropTypes,
  landUnits,
  getLocalizedOptions,
} from "../../data/content/onboardingOptions";
import { colors } from "../../styles/colors";
import { validateLandEntry, validateLandArea } from "../../utils/validation";

export const unstable_settings = {
  headerShown: false,
};

interface EntryErrors {
  [entryId: string]: {
    area?: string;
    crops?: string;
  };
}

const AuthLandDetailsScreen = () => {
  const router = useRouter();
  const { t, currentLanguage } = useTranslation();
  const {
    hasLand,
    setHasLand,
    landEntries,
    landLocationData,
    addLandEntry,
    removeLandEntry,
    updateLandEntry,
  } = useOnboardingStore();

  const [errors, setErrors] = useState<EntryErrors>({});
  const [touched, setTouched] = useState<Record<string, Record<string, boolean>>>({});

  const cropOptions = getLocalizedOptions(cropTypes, currentLanguage);
  const unitOptions = getLocalizedOptions(landUnits, currentLanguage);

  const validateEntry = (entry: LandEntry): boolean => {
    const validation = validateLandEntry({
      area: entry.area,
      unit: entry.unit,
      crops: entry.crops || [],
    });

    const entryErrors: { area?: string; crops?: string } = {};
    validation.errors.forEach((error) => {
      if (error.toLowerCase().includes("area") || error.toLowerCase().includes("land")) {
        entryErrors.area = error;
      } else if (error.toLowerCase().includes("crop")) {
        entryErrors.crops = error;
      }
    });

    setErrors((prev) => ({ ...prev, [entry.id]: entryErrors }));
    return validation.isValid;
  };

  const validateAllEntries = (): boolean => {
    if (!hasLand) return true;

    let allValid = true;
    const newErrors: EntryErrors = {};

    landEntries.forEach((entry) => {
      const validation = validateLandEntry({
        area: entry.area,
        unit: entry.unit,
        crops: entry.crops || [],
      });

      if (!validation.isValid) {
        allValid = false;
        const entryErrors: { area?: string; crops?: string } = {};

        validation.errors.forEach((error) => {
          if (error.toLowerCase().includes("area") || error.toLowerCase().includes("land")) {
            entryErrors.area = error;
          } else if (error.toLowerCase().includes("crop")) {
            entryErrors.crops = error;
          }
        });

        newErrors[entry.id] = entryErrors;
      }
    });

    setErrors(newErrors);
    return allValid;
  };

  const handleAreaChange = (entryId: string, text: string) => {
    const num = parseFloat(text) || 0;
    updateLandEntry(entryId, { area: num });

    if (touched[entryId]?.area) {
      const validation = validateLandArea(num);
      setErrors((prev) => ({
        ...prev,
        [entryId]: { ...prev[entryId], area: validation.errors[0] },
      }));
    }
  };

  const handleAreaBlur = (entryId: string, area: number) => {
    setTouched((prev) => ({
      ...prev,
      [entryId]: { ...prev[entryId], area: true },
    }));

    const validation = validateLandArea(area);
    if (area <= 0) {
      setErrors((prev) => ({
        ...prev,
        [entryId]: { ...prev[entryId], area: "Land area must be greater than 0" },
      }));
    } else if (!validation.isValid) {
      setErrors((prev) => ({
        ...prev,
        [entryId]: { ...prev[entryId], area: validation.errors[0] },
      }));
    } else {
      setErrors((prev) => ({
        ...prev,
        [entryId]: { ...prev[entryId], area: undefined },
      }));
    }
  };

  const handleCropsChange = (entryId: string, crops: string[]) => {
    updateLandEntry(entryId, { crops });

    if (crops.length > 0) {
      setErrors((prev) => ({
        ...prev,
        [entryId]: { ...prev[entryId], crops: undefined },
      }));
    }
  };

  const handleNext = () => {
    if (hasLand && !validateAllEntries()) {
      const firstErrorEntry = Object.values(errors).find((e) => e.area || e.crops);
      const errorMessage =
        firstErrorEntry?.area ||
        firstErrorEntry?.crops ||
        t("validation.landDetailsError") ||
        "Please fill in all land details correctly";

      Alert.alert(t("validation.validationError") || "Validation Error", errorMessage);

      const newTouched: Record<string, Record<string, boolean>> = {};
      landEntries.forEach((entry) => {
        newTouched[entry.id] = { area: true, crops: true };
      });
      setTouched(newTouched);
      return;
    }

    router.push("/(auth)/livestock-details");
  };

  const handleSkip = () => {
    router.push("/(auth)/livestock-details");
  };

  const handleBack = () => {
    router.back();
  };

  const isValid = () => {
    if (!hasLand) return true;
    return landEntries.some(
      (entry) => entry.area > 0 && entry.crops && entry.crops.length > 0
    );
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
        {/* Progress Bar — 66% complete */}
        <View
          className="absolute left-5 right-5 h-1.5 rounded-full bg-white/30"
          style={{ top: 50 }}
        >
          <View className="h-full bg-amber-400 rounded-full" style={{ width: "75%" }} />
        </View>
      </View>

      {/* Content Card */}
      <View className="flex-1 bg-white" style={{ borderTopLeftRadius: 24, borderTopRightRadius: 24, marginTop: -24, paddingTop: 24 }}>
        {/* Title Section */}
        <View className="items-center px-5 mb-4">
          <AppText variant="h3" className="font-bold text-gray-800 text-[22px] text-center">
            {t("onboarding.landTitle")}
          </AppText>
          <AppText variant="bodySm" className="text-gray-500 mt-1.5 text-center">
            {t("onboarding.landSubtitle")}
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
            {/* Has Land Toggle */}
            <View className="bg-gray-50 rounded-2xl p-5 mb-4">
              <View className="flex-row justify-between items-center">
                <AppText variant="bodyMd" className="font-semibold text-gray-700">
                  {t("onboarding.hasLand")}
                </AppText>
                <Toggle
                  checked={hasLand}
                  onChange={(value) => {
                    setHasLand(value);
                    if (value && landEntries.length === 0) {
                      addLandEntry({ area: 0, unit: "bigha", mainCrop: "", crops: [] });
                    }
                  }}
                />
              </View>
            </View>

            {/* Land Entries */}
            {hasLand && (
              <>
                {landEntries.map((entry, index) => (
                  <View
                    key={entry.id}
                    className="bg-white rounded-2xl p-5 mb-4 shadow-sm elevation-2"
                  >
                    {/* Entry Header */}
                    <View className="flex-row justify-between items-center mb-4">
                      <AppText variant="bodyMd" className="font-bold text-gray-800">
                        {t("onboarding.landEntry")} {index + 1}
                      </AppText>
                      {landEntries.length > 1 && (
                        <Pressable
                          onPress={() => removeLandEntry(entry.id)}
                          className="p-2 active:opacity-70"
                        >
                          <Ionicons name="trash-outline" size={20} color="#DC2626" />
                        </Pressable>
                      )}
                    </View>

                    {/* Area Input */}
                    <View className="mb-4">
                      <AppText variant="bodySm" className="text-gray-500 mb-2">
                        {t("onboarding.landArea")}
                      </AppText>
                      <View className="flex-row gap-3">
                        <View className="flex-1">
                          <TextInput
                            style={{
                              backgroundColor: "#F9FAFB",
                              borderWidth: 1,
                              borderColor: errors[entry.id]?.area && touched[entry.id]?.area ? "#EF4444" : "#E5E7EB",
                              borderRadius: 12,
                              padding: 14,
                              fontSize: 16,
                              color: "#1F2937",
                            }}
                            value={entry.area > 0 ? String(entry.area) : ""}
                            onChangeText={(text) => handleAreaChange(entry.id, text)}
                            onBlur={() => handleAreaBlur(entry.id, entry.area)}
                            keyboardType="numeric"
                            placeholder="0"
                            placeholderTextColor="#9CA3AF"
                          />
                        </View>
                        <View style={{ width: 120 }}>
                          <Select
                            value={entry.unit}
                            onChange={(value) =>
                              updateLandEntry(entry.id, { unit: value as "bigha" | "acre" | "hectare" })
                            }
                            options={unitOptions}
                            placeholder={t("onboarding.selectUnit")}
                          />
                        </View>
                      </View>
                      {errors[entry.id]?.area && touched[entry.id]?.area && (
                        <AppText variant="bodySm" className="text-red-500 mt-1">
                          {errors[entry.id].area}
                        </AppText>
                      )}
                    </View>

                    {/* Crops Selection */}
                    <View>
                      <AppText variant="bodySm" className="text-gray-500 mb-2">
                        {t("onboarding.cropsGrown")}
                      </AppText>
                      <View
                        style={{
                          borderWidth: errors[entry.id]?.crops && touched[entry.id]?.crops ? 1 : 0,
                          borderColor: "#EF4444",
                          borderRadius: 12,
                        }}
                      >
                        <MultiSelect
                          value={entry.crops || []}
                          onValueChange={(crops) => handleCropsChange(entry.id, crops)}
                          options={cropOptions}
                          placeholder={t("onboarding.selectCrops")}
                        />
                      </View>
                      {errors[entry.id]?.crops && touched[entry.id]?.crops && (
                        <AppText variant="bodySm" className="text-red-500 mt-1">
                          {errors[entry.id].crops}
                        </AppText>
                      )}
                    </View>
                  </View>
                ))}

                {/* Add Another Land Entry */}
                <Pressable
                  onPress={() => addLandEntry({ area: 0, unit: "bigha", mainCrop: "", crops: [] })}
                  className="flex-row items-center justify-center rounded-xl p-4 mb-4 border-2 border-green-300 border-dashed active:bg-green-100 bg-green-50"
                >
                  <Ionicons name="add-circle-outline" size={20} color="#16A34A" />
                  <AppText variant="bodySm" className="text-green-600 font-semibold ml-2">
                    {t("onboarding.addAnotherLand")}
                  </AppText>
                </Pressable>

                {/* Locate on Map Button */}
                <View className="bg-green-50 rounded-2xl p-5 mb-4 border border-green-100 flex-row justify-between items-center">
                  <View className="flex-1 mr-4">
                    <AppText variant="bodyMd" className="font-bold text-gray-800 mb-1">
                      Land Location
                    </AppText>
                    <AppText variant="bodySm" className="text-gray-500">
                      {landLocationData ? landLocationData.address : "Pin your exact farm location"}
                    </AppText>
                  </View>
                  <Pressable
                    onPress={() => router.push("/(auth)/location-picker?isForLand=true" as any)}
                    className="bg-white rounded-xl px-4 py-2 border border-gray-200"
                  >
                    <AppText className="text-green-700 font-semibold">
                      {landLocationData ? "Edit Map" : "Locate on Map"}
                    </AppText>
                  </Pressable>
                </View>
              </>
            )}
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Bottom Buttons */}
        <View className="p-5 bg-white border-t border-gray-200 flex-row gap-3">
          <Pressable
            onPress={handleSkip}
            className="flex-1 py-4 rounded-full bg-white border border-gray-300 items-center active:bg-gray-100"
          >
            <AppText variant="bodyMd" className="text-gray-500 font-semibold">
              {t("common.skip")}
            </AppText>
          </Pressable>

          <Pressable
            onPress={handleNext}
            disabled={!isValid()}
            className="flex-[2] py-4 rounded-full items-center"
            style={{ backgroundColor: isValid() ? "#386641" : "#D1D5DB" }}
          >
            <AppText variant="bodyMd" className="text-white font-bold">
              {t("common.next")}
            </AppText>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

export default AuthLandDetailsScreen;
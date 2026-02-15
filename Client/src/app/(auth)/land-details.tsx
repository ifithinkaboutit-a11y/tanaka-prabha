// src/app/(auth)/land-details.tsx
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
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
    
    // Clear error if user starts typing
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
    
    // Clear error if user selects crops
    if (crops.length > 0) {
      setErrors((prev) => ({
        ...prev,
        [entryId]: { ...prev[entryId], crops: undefined },
      }));
    }
  };

  const handleNext = () => {
    if (hasLand && !validateAllEntries()) {
      // Find the first error to display
      const firstErrorEntry = Object.values(errors).find((e) => e.area || e.crops);
      const errorMessage = firstErrorEntry?.area || firstErrorEntry?.crops || 
        t("validation.landDetailsError") || "Please fill in all land details correctly";
      
      Alert.alert(
        t("validation.validationError") || "Validation Error",
        errorMessage
      );
      
      // Mark all fields as touched
      const newTouched: Record<string, Record<string, boolean>> = {};
      landEntries.forEach((entry) => {
        newTouched[entry.id] = { area: true, crops: true };
      });
      setTouched(newTouched);
      return;
    }
    
    // Navigate to livestock details
    router.push("/(auth)/livestock-details");
  };

  const handleSkip = () => {
    // Skip to livestock details
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

  const getAreaInputStyle = (entryId: string) => ({
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: errors[entryId]?.area && touched[entryId]?.area ? "#EF4444" : "#E5E7EB",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: "#1F2937",
  });

  const { height: screenHeight } = Dimensions.get("window");
  const videoHeight = screenHeight * 0.28;

  const player = useVideoPlayer(MediaPath.videos.authBackground, (player) => {
    player.loop = true;
    player.muted = true;
    player.play();
  });

  return (
    <View style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
      {/* Video Background Header */}
      <View style={{ height: videoHeight, position: "relative" }}>
        <VideoView
          player={player}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: "100%",
            height: "100%",
          }}
          contentFit="cover"
          nativeControls={false}
          allowsPictureInPicture={false}
        />
        {/* Dark overlay for better text visibility */}
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.3)",
          }}
        />
        {/* Progress bar */}
        <View
          style={{
            position: "absolute",
            top: 50,
            left: 20,
            right: 20,
            height: 6,
            backgroundColor: "rgba(255,255,255,0.3)",
            borderRadius: 3,
          }}
        >
          <View
            style={{
              width: "66%",
              height: "100%",
              backgroundColor: "#F59E0B",
              borderRadius: 3,
            }}
          />
        </View>
        {/* Sun Icon */}
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            paddingTop: 30,
          }}
        >
          <MaterialCommunityIcons
            name="white-balance-sunny"
            size={80}
            color="#F59E0B"
          />
        </View>
      </View>

      {/* Content Card */}
      <View
        style={{
          flex: 1,
          backgroundColor: "#FFFFFF",
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          marginTop: -20,
          paddingTop: 24,
        }}
      >
        {/* Title Section */}
        <View style={{ alignItems: "center", paddingHorizontal: 20, marginBottom: 16 }}>
          <AppText
            variant="h3"
            style={{ fontWeight: "700", color: "#1F2937", fontSize: 22, textAlign: "center" }}
          >
            {t("onboarding.landTitle")}
          </AppText>
          <AppText
            variant="bodySm"
            style={{ color: "#6B7280", marginTop: 6, textAlign: "center" }}
          >
            {t("onboarding.landSubtitle")}
          </AppText>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Do you own land? */}
            <View
              style={{
                backgroundColor: "#F9FAFB",
                borderRadius: 16,
                padding: 20,
                marginBottom: 16,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <AppText
                  variant="bodyMd"
                  style={{ fontWeight: "600", color: "#374151" }}
                >
                  {t("onboarding.hasLand")}
                </AppText>
                <Toggle 
                  value={hasLand} 
                  onValueChange={(value) => {
                    setHasLand(value);
                  // Add a default entry when enabling land ownership
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
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: 16,
                    padding: 20,
                    marginBottom: 16,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.05,
                    shadowRadius: 8,
                    elevation: 2,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 16,
                    }}
                  >
                    <AppText
                      variant="bodyMd"
                      style={{ fontWeight: "700", color: "#1F2937" }}
                    >
                      {t("onboarding.landEntry")} {index + 1}
                    </AppText>
                    {landEntries.length > 1 && (
                      <Pressable
                        onPress={() => removeLandEntry(entry.id)}
                        style={({ pressed }) => ({
                          padding: 8,
                          opacity: pressed ? 0.7 : 1,
                        })}
                      >
                        <Ionicons name="trash-outline" size={20} color="#DC2626" />
                      </Pressable>
                    )}
                  </View>

                  {/* Area Input */}
                  <View style={{ marginBottom: 16 }}>
                    <AppText
                      variant="bodySm"
                      style={{ color: "#6B7280", marginBottom: 8 }}
                    >
                      {t("onboarding.landArea")}
                    </AppText>
                    <View style={{ flexDirection: "row", gap: 12 }}>
                      <View style={{ flex: 1 }}>
                        <TextInput
                          style={getAreaInputStyle(entry.id)}
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
                            updateLandEntry(entry.id, { unit: value })
                          }
                          options={unitOptions}
                          placeholder={t("onboarding.selectUnit")}
                        />
                      </View>
                    </View>
                    {errors[entry.id]?.area && touched[entry.id]?.area && (
                      <AppText
                        variant="bodySm"
                        style={{ color: "#EF4444", marginTop: 4 }}
                      >
                        {errors[entry.id].area}
                      </AppText>
                    )}
                  </View>

                  {/* Crops Selection */}
                  <View>
                    <AppText
                      variant="bodySm"
                      style={{ color: "#6B7280", marginBottom: 8 }}
                    >
                      {t("onboarding.cropsGrown")}
                    </AppText>
                    <View style={{ 
                      borderWidth: errors[entry.id]?.crops && touched[entry.id]?.crops ? 1 : 0,
                      borderColor: "#EF4444",
                      borderRadius: 12 
                    }}>
                      <MultiSelect
                        value={entry.crops || []}
                        onValueChange={(crops) => handleCropsChange(entry.id, crops)}
                        options={cropOptions}
                        placeholder={t("onboarding.selectCrops")}
                      />
                    </View>
                    {errors[entry.id]?.crops && touched[entry.id]?.crops && (
                      <AppText
                        variant="bodySm"
                        style={{ color: "#EF4444", marginTop: 4 }}
                      >
                        {errors[entry.id].crops}
                      </AppText>
                    )}
                  </View>
                </View>
              ))}

              {/* Add Another Land Entry */}
              <Pressable
                onPress={() => addLandEntry({ area: 0, unit: "bigha", mainCrop: "", crops: [] })}
                style={({ pressed }) => ({
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: pressed ? "#DCFCE7" : "#F0FDF4",
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 16,
                  borderWidth: 2,
                  borderColor: "#86EFAC",
                  borderStyle: "dashed",
                })}
              >
                <Ionicons name="add-circle-outline" size={20} color="#16A34A" />
                <AppText
                  variant="bodySm"
                  style={{ color: "#16A34A", fontWeight: "600", marginLeft: 8 }}
                >
                  {t("onboarding.addAnotherLand")}
                </AppText>
              </Pressable>
            </>
          )}
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Bottom Buttons */}
        <View
          style={{
            padding: 20,
            backgroundColor: "#FFFFFF",
            borderTopWidth: 1,
            borderTopColor: "#E5E7EB",
            flexDirection: "row",
            gap: 12,
          }}
        >
          <Pressable
            onPress={handleSkip}
            style={({ pressed }) => ({
              flex: 1,
              paddingVertical: 16,
              borderRadius: 25,
              backgroundColor: pressed ? "#F3F4F6" : "#FFFFFF",
              borderWidth: 1,
              borderColor: "#D1D5DB",
              alignItems: "center",
            })}
          >
            <AppText
              variant="bodyMd"
              style={{ color: "#6B7280", fontWeight: "600" }}
            >
              {t("common.skip")}
            </AppText>
          </Pressable>
          <Pressable
            onPress={handleNext}
            disabled={!isValid()}
            style={({ pressed }) => ({
              flex: 2,
              paddingVertical: 16,
              borderRadius: 25,
              backgroundColor: isValid()
                ? pressed
                  ? "#2F5233"
                  : "#386641"
                : "#D1D5DB",
              alignItems: "center",
            })}
          >
            <AppText
              variant="bodyMd"
              style={{ color: "#FFFFFF", fontWeight: "700" }}
            >
              {t("common.next")}
            </AppText>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

export default AuthLandDetailsScreen;

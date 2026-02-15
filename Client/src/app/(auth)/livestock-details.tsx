// src/app/(auth)/livestock-details.tsx
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
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
  const { completeOnboarding, refreshUser } = useAuth();
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
    
    // Clear error if user starts typing
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
    
    // Clear error if user selects type
    if (type) {
      setErrors((prev) => ({
        ...prev,
        [entryId]: { ...prev[entryId], type: undefined },
      }));
    }
  };

  const saveOnboardingData = async () => {
    try {
      // Prepare the profile data to save
      const profileData: any = {
        // Basic personal details (name, age, gender, aadhaar)
        name: personalDetails.name,
        age: personalDetails.age,
        gender: personalDetails.gender,
        aadhaar_number: personalDetails.aadhaar,
        // Extended personal details
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

      // Add land details if user has land
      if (hasLand && landEntries.length > 0) {
        // Calculate total land area (convert all to acres for consistency)
        let totalArea = 0;
        const crops: string[] = [];
        
        landEntries.forEach((entry) => {
          let areaInAcres = entry.area;
          // Convert to acres if needed
          if (entry.unit === "bigha") {
            areaInAcres = entry.area * 0.62; // 1 bigha ≈ 0.62 acres
          } else if (entry.unit === "hectare") {
            areaInAcres = entry.area * 2.47; // 1 hectare ≈ 2.47 acres
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
          total_land_area: Math.round(totalArea * 100) / 100, // Round to 2 decimal places
          kharif_crop: crops.filter((c) => ["rice", "maize", "cotton", "soybean"].includes(c)).join(", "),
          rabi_crop: crops.filter((c) => ["wheat", "mustard", "gram", "barley"].includes(c)).join(", "),
          zaid_crop: crops.filter((c) => ["vegetables", "fruits", "fodder"].includes(c)).join(", "),
        };
      }

      // Add livestock details if user has livestock
      if (hasLivestock && livestockEntries.length > 0) {
        const livestockData: any = {
          cow: 0,
          buffalo: 0,
          goat: 0,
          sheep: 0,
          pig: 0,
          poultry: 0,
          others: 0,
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

      // Save to backend
      const response = await userApi.updateProfile(profileData);
      
      if (response.status === "success") {
        console.log("✅ Onboarding data saved successfully");
        // Refresh user data from server
        await refreshUser();
        // Reset onboarding store
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
      const errorMessage = firstErrorEntry?.type || firstErrorEntry?.count || 
        t("validation.livestockDetailsError") || "Please fill in all livestock details correctly";
      
      Alert.alert(
        t("validation.validationError") || "Validation Error",
        errorMessage
      );
      
      // Mark all fields as touched
      const newTouched: Record<string, Record<string, boolean>> = {};
      livestockEntries.forEach((entry) => {
        newTouched[entry.id] = { type: true, count: true };
      });
      setTouched(newTouched);
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Save all onboarding data to backend
      await saveOnboardingData();
      
      // Mark onboarding complete and navigate to home
      completeOnboarding();
      router.replace("/(tab)/" as any);
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
      // Save available data even when skipping
      await saveOnboardingData();
      
      // Skip also marks onboarding as complete
      completeOnboarding();
      router.replace("/(tab)/" as any);
    } catch (error) {
      // Even if save fails, let user continue
      console.error("Failed to save on skip:", error);
      completeOnboarding();
      router.replace("/(tab)/" as any);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const isValid = () => {
    if (!hasLivestock) return true;
    return livestockEntries.some(
      (entry) => entry.type !== "" && entry.count > 0
    );
  };

  const getCountInputStyle = (entryId: string) => ({
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: errors[entryId]?.count && touched[entryId]?.count ? "#EF4444" : "#E5E7EB",
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
              width: "100%",
              height: "100%",
              backgroundColor: "#F59E0B",
              borderRadius: 3,
            }}
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
            {t("onboarding.livestockTitle")}
          </AppText>
          <AppText
            variant="bodySm"
            style={{ color: "#6B7280", marginTop: 6, textAlign: "center" }}
          >
            {t("onboarding.livestockSubtitle")}
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
            {/* Do you have livestock? */}
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
                  {t("onboarding.hasLivestock")}
                </AppText>
                <Toggle 
                  value={hasLivestock} 
                  onChange={(value: boolean) => {
                    setHasLivestock(value);
                    // Add a default entry when enabling livestock ownership
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
                      {t("onboarding.livestockEntry")} {index + 1}
                    </AppText>
                    {livestockEntries.length > 1 && (
                      <Pressable
                        onPress={() => removeLivestockEntry(entry.id)}
                        style={({ pressed }) => ({
                          padding: 8,
                          opacity: pressed ? 0.7 : 1,
                        })}
                      >
                        <Ionicons name="trash-outline" size={20} color="#DC2626" />
                      </Pressable>
                    )}
                  </View>

                  {/* Animal Type Selection */}
                  <View style={{ marginBottom: 16 }}>
                    <AppText
                      variant="bodySm"
                      style={{ color: "#6B7280", marginBottom: 8 }}
                    >
                      {t("onboarding.animalType")}
                    </AppText>
                    <View style={{ 
                      borderWidth: errors[entry.id]?.type && touched[entry.id]?.type ? 1 : 0,
                      borderColor: "#EF4444",
                      borderRadius: 12 
                    }}>
                      <Select
                        value={entry.type}
                        onChange={(value) => handleTypeChange(entry.id, value)}
                        options={animalOptions}
                        placeholder={t("onboarding.selectAnimal")}
                      />
                    </View>
                    {errors[entry.id]?.type && touched[entry.id]?.type && (
                      <AppText
                        variant="bodySm"
                        style={{ color: "#EF4444", marginTop: 4 }}
                      >
                        {errors[entry.id].type}
                      </AppText>
                    )}
                  </View>

                  {/* Count Input */}
                  <View>
                    <AppText
                      variant="bodySm"
                      style={{ color: "#6B7280", marginBottom: 8 }}
                    >
                      {t("onboarding.animalCount")}
                    </AppText>
                    <TextInput
                      style={getCountInputStyle(entry.id)}
                      value={entry.count > 0 ? String(entry.count) : ""}
                      onChangeText={(text) => handleCountChange(entry.id, text)}
                      onBlur={() => handleCountBlur(entry.id, entry.count)}
                      keyboardType="numeric"
                      placeholder="0"
                      placeholderTextColor="#9CA3AF"
                    />
                    {errors[entry.id]?.count && touched[entry.id]?.count && (
                      <AppText
                        variant="bodySm"
                        style={{ color: "#EF4444", marginTop: 4 }}
                      >
                        {errors[entry.id].count}
                      </AppText>
                    )}
                  </View>
                </View>
              ))}

              {/* Add Another Livestock Entry */}
              <Pressable
                onPress={() => addLivestockEntry({ type: "", count: 0 })}
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
                  {t("onboarding.addAnotherLivestock")}
                </AppText>
              </Pressable>
            </>
          )}

          {/* Completion Message */}
          <View
            style={{
              backgroundColor: "#DCFCE7",
              borderRadius: 16,
              padding: 20,
              marginTop: 8,
              alignItems: "center",
            }}
          >
            <Ionicons name="checkmark-circle" size={48} color="#16A34A" />
            <AppText
              variant="bodyMd"
              style={{
                color: "#166534",
                fontWeight: "600",
                marginTop: 12,
                textAlign: "center",
              }}
            >
              {t("onboarding.almostDone")}
            </AppText>
            <AppText
              variant="bodySm"
              style={{ color: "#15803D", marginTop: 4, textAlign: "center" }}
            >
              {t("onboarding.finishMessage")}
            </AppText>
          </View>
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
            disabled={isSubmitting}
            style={({ pressed }) => ({
              flex: 1,
              paddingVertical: 16,
              borderRadius: 25,
              backgroundColor: pressed ? "#F3F4F6" : "#FFFFFF",
              borderWidth: 1,
              borderColor: "#D1D5DB",
              alignItems: "center",
              opacity: isSubmitting ? 0.5 : 1,
            })}
          >
            <AppText
              variant="bodyMd"
              style={{ color: "#6B7280", fontWeight: "600" }}
            >
              {t("onboarding.skip")}
            </AppText>
          </Pressable>
          <Pressable
            onPress={handleFinish}
            disabled={!isValid() || isSubmitting}
            style={({ pressed }) => ({
              flex: 2,
              paddingVertical: 16,
              borderRadius: 25,
              backgroundColor: isValid() && !isSubmitting
                ? pressed
                  ? "#2F5233"
                  : "#386641"
                : "#D1D5DB",
              alignItems: "center",
              flexDirection: "row",
              justifyContent: "center",
            })}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <AppText
                  variant="bodyMd"
                  style={{ color: "#FFFFFF", fontWeight: "700" }}
                >
                  {t("onboarding.finish")}
                </AppText>
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color="#FFFFFF"
                  style={{ marginLeft: 8 }}
                />
              </>
            )}
          </Pressable>
        </View>
      </View>
    </View>
  );
};

export default AuthLivestockDetailsScreen;

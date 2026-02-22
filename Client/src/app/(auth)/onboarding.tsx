// src/app/(auth)/onboarding.tsx
import Button from "@/components/atoms/Button";
import FormInput from "@/components/atoms/FormInput";
import Select from "@/components/atoms/Select";
import Toggle from "@/components/atoms/Toggle";
import MultiSelect from "@/components/atoms/MultiSelect";
import OnboardingHeader from "@/components/molecules/OnboardingHeader";
import {
  animalTypes,
  cropTypes,
  getLocalizedOptions,
  indianStates,
  landUnits,
} from "@/data/content/onboardingOptions";
import { useTranslation } from "@/i18n";
import { useOnboardingStore } from "@/stores/onboardingStore";
import { useAuth } from "@/contexts/AuthContext";
import type { OnboardingData } from "@/contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { colors } from "../../styles/colors";

const TOTAL_STEPS = 3;

const Onboarding = () => {
  const router = useRouter();
  const { t, currentLanguage } = useTranslation();
  const { completeOnboarding } = useAuth();

  const {
    currentStep,
    nextStep,
    personalDetails,
    updatePersonalDetails,
    hasLand,
    setHasLand,
    landEntries,
    addLandEntry,
    removeLandEntry,
    updateLandEntry,
    hasLivestock,
    setHasLivestock,
    livestockEntries,
    addLivestockEntry,
    removeLivestockEntry,
    updateLivestockEntry,
  } = useOnboardingStore();

  // Check if current step has valid data for enabling Next button
  const isStepValid = () => {
    switch (currentStep) {
      case 0:
        // Personal step - require name and state at minimum
        return (
          personalDetails.name.trim() !== "" &&
          personalDetails.state !== ""
        );
      case 1:
        // Land step - if they have land, require at least one entry with data
        if (!hasLand) return true;
        return landEntries.some(
          (entry) => entry.area > 0 && entry.crops && entry.crops.length > 0
        );
      case 2:
        // Livestock step - if they have livestock, require at least one entry
        if (!hasLivestock) return true;
        return livestockEntries.some(
          (entry) => entry.type !== "" && entry.count > 0
        );
      default:
        return true;
    }
  };

  // Collect all onboarding data from the store and build the payload
  const collectOnboardingData = (): OnboardingData => {
    const data: OnboardingData = {
      personalDetails: { ...personalDetails },
    };

    if (hasLand && landEntries.length > 0) {
      // Sum up land areas and collect all crops
      const totalArea = landEntries.reduce((sum, e) => sum + (e.area || 0), 0);
      const allCrops = landEntries.flatMap((e) => e.crops || []);
      data.landDetails = {
        totalLandArea: totalArea,
        crops: allCrops,
      };
    }

    if (hasLivestock && livestockEntries.length > 0) {
      // Aggregate livestock counts by type
      const livestock: Record<string, number> = {};
      for (const entry of livestockEntries) {
        if (entry.type) {
          livestock[entry.type] = (livestock[entry.type] || 0) + entry.count;
        }
      }
      data.livestockDetails = livestock;
    }

    return data;
  };

  const handleNext = async () => {
    if (currentStep < TOTAL_STEPS - 1) {
      nextStep();
    } else {
      // Final step — sync all onboarding data to backend then navigate
      const data = collectOnboardingData();
      await completeOnboarding(data);
    }
  };

  const handleSkip = async () => {
    // Skip — still sync whatever data has been entered so far
    const data = collectOnboardingData();
    await completeOnboarding(data);
  };

  const stateOptions = getLocalizedOptions(indianStates, currentLanguage);
  const cropOptions = getLocalizedOptions(cropTypes, currentLanguage);
  const unitOptions = getLocalizedOptions(landUnits, currentLanguage);
  const animalOptions = getLocalizedOptions(animalTypes, currentLanguage);

  const renderPersonalStep = () => (
    <View style={{ flex: 1 }}>
      <OnboardingHeader
        title={t("onboarding.personal.title")}
        subtitle={t("onboarding.personal.subtitle")}
        currentStep={currentStep}
        totalSteps={TOTAL_STEPS}
      />

      <ScrollView style={{ flex: 1, paddingHorizontal: 24, paddingTop: 24 }}>
        <FormInput
          label={t("onboarding.personal.fullName")}
          placeholder={t("onboarding.personal.fullNamePlaceholder")}
          value={personalDetails.name}
          onChangeText={(text) => updatePersonalDetails({ name: text })}
        />

        <FormInput
          label={t("personalDetails.fathersName") || "Father's Name"}
          placeholder="Enter father's name"
          value={personalDetails.fathersName}
          onChangeText={(text) => updatePersonalDetails({ fathersName: text })}
        />

        <Select
          label={t("onboarding.personal.state")}
          placeholder={t("onboarding.personal.selectState")}
          value={personalDetails.state}
          options={stateOptions}
          onChange={(value) => updatePersonalDetails({ state: value })}
        />

        <Select
          label={t("onboarding.personal.district")}
          placeholder={t("onboarding.personal.selectDistrict")}
          value={personalDetails.district}
          options={[
            { label: "Lucknow", value: "lucknow" },
            { label: "Kanpur", value: "kanpur" },
            { label: "Varanasi", value: "varanasi" },
            { label: "Agra", value: "agra" },
            { label: "Prayagraj", value: "prayagraj" },
          ]}
          onChange={(value) => updatePersonalDetails({ district: value })}
        />

        <Select
          label={t("onboarding.personal.village")}
          placeholder={t("onboarding.personal.selectVillage")}
          value={personalDetails.village}
          options={[
            { label: "BKT", value: "bkt" },
            { label: "Gomti Nagar", value: "gomti_nagar" },
            { label: "Aliganj", value: "aliganj" },
          ]}
          onChange={(value) => updatePersonalDetails({ village: value })}
        />
      </ScrollView>
    </View>
  );

  const renderLandStep = () => (
    <View style={{ flex: 1 }}>
      <OnboardingHeader
        title={t("onboarding.land.title")}
        subtitle={t("onboarding.land.subtitle")}
        currentStep={currentStep}
        totalSteps={TOTAL_STEPS}
      />

      <ScrollView style={{ flex: 1, paddingHorizontal: 24, paddingTop: 24 }}>
        <Toggle
          label={t("onboarding.land.doYouHaveLand")}
          checked={hasLand}
          onChange={(value) => {
            setHasLand(value);
            // Add initial entry if toggled on and no entries exist
            if (value && landEntries.length === 0) {
              addLandEntry({ area: 0, unit: "bigha", mainCrop: "", crops: [] });
            }
          }}
        />

        {hasLand && (
          <View style={{ marginTop: 16 }}>
            {landEntries.map((entry, index) => (
              <View
                key={entry.id}
                style={{ backgroundColor: "#FFFFFF", borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: "#D9D9D9" }}
              >
                {landEntries.length > 1 && (
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <AppText variant="bodyMd" style={{ fontWeight: "600", color: "#212121" }}>
                      {t("onboarding.land.title")} #{index + 1}
                    </AppText>
                    <TouchableOpacity onPress={() => removeLandEntry(entry.id)}>
                      <Ionicons
                        name="trash-outline"
                        size={20}
                        color={colors.semantic.error}
                      />
                    </TouchableOpacity>
                  </View>
                )}

                <View style={{ flexDirection: "row", gap: 12 }}>
                  <View style={{ flex: 1 }}>
                    <FormInput
                      label={t("onboarding.land.totalArea")}
                      placeholder="Eg. 47"
                      keyboardType="numeric"
                      value={entry.area ? entry.area.toString() : ""}
                      onChangeText={(text) =>
                        updateLandEntry(entry.id, {
                          area: parseFloat(text) || 0,
                        })
                      }
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Select
                      label={t("onboarding.land.unit")}
                      placeholder="Select"
                      value={entry.unit}
                      options={unitOptions}
                      onChange={(value) =>
                        updateLandEntry(entry.id, {
                          unit: value as "bigha" | "acre" | "hectare",
                        })
                      }
                    />
                  </View>
                </View>

                <MultiSelect
                  label={t("onboarding.land.mainCrop")}
                  placeholder="Select Multiple"
                  values={entry.crops || []}
                  options={cropOptions}
                  onChange={(values) =>
                    updateLandEntry(entry.id, { crops: values })
                  }
                />
              </View>
            ))}

            <TouchableOpacity
              onPress={() =>
                addLandEntry({ area: 0, unit: "bigha", mainCrop: "", crops: [] })
              }
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderRadius: 12,
                backgroundColor: colors.secondary.soil,
                alignSelf: "flex-start",
              }}
            >
              <AppText variant="bodySm" style={{ color: "#FFFFFF", fontWeight: "500", marginRight: 8 }}>
                {t("onboarding.land.addLand")}
              </AppText>
              <Ionicons name="add" size={20} color="white" />
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );

  const renderLivestockStep = () => (
    <View style={{ flex: 1 }}>
      <OnboardingHeader
        title={t("onboarding.livestock.title")}
        subtitle={t("onboarding.livestock.subtitle")}
        currentStep={currentStep}
        totalSteps={TOTAL_STEPS}
      />

      <ScrollView style={{ flex: 1, paddingHorizontal: 24, paddingTop: 24 }}>
        <Toggle
          label={t("onboarding.livestock.doYouHaveLivestock")}
          checked={hasLivestock}
          onChange={(value) => {
            setHasLivestock(value);
            // Add initial entry if toggled on and no entries exist
            if (value && livestockEntries.length === 0) {
              addLivestockEntry({ type: "", count: 0 });
            }
          }}
        />

        {hasLivestock && (
          <View style={{ marginTop: 16 }}>
            {livestockEntries.map((entry, index) => (
              <View
                key={entry.id}
                style={{ backgroundColor: "#FFFFFF", borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: "#D9D9D9" }}
              >
                {livestockEntries.length > 1 && (
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <AppText variant="bodyMd" style={{ fontWeight: "600", color: "#212121" }}>
                      {t("onboarding.livestock.animal")} #{index + 1}
                    </AppText>
                    <TouchableOpacity
                      onPress={() => removeLivestockEntry(entry.id)}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={20}
                        color={colors.semantic.error}
                      />
                    </TouchableOpacity>
                  </View>
                )}

                <View style={{ flexDirection: "row", gap: 12 }}>
                  <View style={{ flex: 1.5 }}>
                    <Select
                      label={t("onboarding.livestock.animal")}
                      placeholder="Select"
                      value={entry.type}
                      options={animalOptions}
                      onChange={(value) =>
                        updateLivestockEntry(entry.id, { type: value })
                      }
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <FormInput
                      label={t("onboarding.livestock.numberOfAnimals")}
                      placeholder="Eg. 5"
                      keyboardType="numeric"
                      value={entry.count ? entry.count.toString() : ""}
                      onChangeText={(text) =>
                        updateLivestockEntry(entry.id, {
                          count: parseInt(text) || 0,
                        })
                      }
                    />
                  </View>
                </View>
              </View>
            ))}

            <TouchableOpacity
              onPress={() => addLivestockEntry({ type: "", count: 0 })}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderRadius: 12,
                backgroundColor: colors.secondary.soil,
                alignSelf: "flex-start",
              }}
            >
              <AppText variant="bodySm" style={{ color: "#FFFFFF", fontWeight: "500", marginRight: 8 }}>
                {t("onboarding.livestock.addAnimal")}
              </AppText>
              <Ionicons name="add" size={20} color="white" />
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return renderPersonalStep();
      case 1:
        return renderLandStep();
      case 2:
        return renderLivestockStep();
      default:
        return null;
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.neutral.surface }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {renderStep()}

      {/* Bottom Navigation */}
      <View style={{ paddingHorizontal: 24, paddingVertical: 16, backgroundColor: colors.neutral.surface }}>
        {/* Skip for now link */}
        <TouchableOpacity onPress={handleSkip} style={{ alignItems: "center", marginBottom: 16 }}>
          <AppText variant="bodySm" style={{ color: colors.neutral.textMedium }}>
            {t("onboarding.skip")}
          </AppText>
        </TouchableOpacity>

        {/* Next/Finish Button */}
        <Button
          variant="primary"
          onPress={handleNext}
          disabled={!isStepValid()}
          style={{ width: "100%", paddingVertical: 16 }}
        >
          <AppText variant="bodyMd" style={{ color: "#FFFFFF", fontWeight: "600" }}>
            {currentStep === TOTAL_STEPS - 1
              ? t("onboarding.finish")
              : t("onboarding.next")}
          </AppText>
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
};

export default Onboarding;

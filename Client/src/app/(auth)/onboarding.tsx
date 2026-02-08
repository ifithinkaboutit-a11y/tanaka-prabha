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
          personalDetails.fathersName.trim() !== "" &&
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

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS - 1) {
      nextStep();
    } else {
      // Final step - navigate to home
      router.replace("/(tab)/" as any);
    }
  };

  const handleSkip = () => {
    router.replace("/(tab)/" as any);
  };

  const stateOptions = getLocalizedOptions(indianStates, currentLanguage);
  const cropOptions = getLocalizedOptions(cropTypes, currentLanguage);
  const unitOptions = getLocalizedOptions(landUnits, currentLanguage);
  const animalOptions = getLocalizedOptions(animalTypes, currentLanguage);

  const renderPersonalStep = () => (
    <View className="flex-1">
      <OnboardingHeader
        title={t("onboarding.personal.title")}
        subtitle={t("onboarding.personal.subtitle")}
        currentStep={currentStep}
        totalSteps={TOTAL_STEPS}
      />

      <ScrollView className="flex-1 px-6 pt-6">
        <FormInput
          label={t("onboarding.personal.fullName")}
          placeholder={t("onboarding.personal.fullNamePlaceholder")}
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
    <View className="flex-1">
      <OnboardingHeader
        title={t("onboarding.land.title")}
        subtitle={t("onboarding.land.subtitle")}
        currentStep={currentStep}
        totalSteps={TOTAL_STEPS}
      />

      <ScrollView className="flex-1 px-6 pt-6">
        <Toggle
          label={t("onboarding.land.doYouHaveLand")}
          value={hasLand}
          onChange={(value) => {
            setHasLand(value);
            // Add initial entry if toggled on and no entries exist
            if (value && landEntries.length === 0) {
              addLandEntry({ area: 0, unit: "bigha", mainCrop: "", crops: [] });
            }
          }}
        />

        {hasLand && (
          <View className="mt-4">
            {landEntries.map((entry, index) => (
              <View
                key={entry.id}
                className="bg-white rounded-xl p-4 mb-4 border border-neutral-border"
              >
                {landEntries.length > 1 && (
                  <View className="flex-row justify-between items-center mb-3">
                    <Text className="font-semibold text-neutral-textDark">
                      {t("onboarding.land.title")} #{index + 1}
                    </Text>
                    <TouchableOpacity onPress={() => removeLandEntry(entry.id)}>
                      <Ionicons
                        name="trash-outline"
                        size={20}
                        color={colors.semantic.error}
                      />
                    </TouchableOpacity>
                  </View>
                )}

                <View className="flex-row gap-3">
                  <View className="flex-1">
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
                  <View className="flex-1">
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
              className="flex-row items-center justify-center py-3 px-4 rounded-xl bg-secondary-soil self-start"
            >
              <Text className="text-white font-medium mr-2">
                {t("onboarding.land.addLand")}
              </Text>
              <Ionicons name="add" size={20} color="white" />
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );

  const renderLivestockStep = () => (
    <View className="flex-1">
      <OnboardingHeader
        title={t("onboarding.livestock.title")}
        subtitle={t("onboarding.livestock.subtitle")}
        currentStep={currentStep}
        totalSteps={TOTAL_STEPS}
      />

      <ScrollView className="flex-1 px-6 pt-6">
        <Toggle
          label={t("onboarding.livestock.doYouHaveLivestock")}
          value={hasLivestock}
          onChange={(value) => {
            setHasLivestock(value);
            // Add initial entry if toggled on and no entries exist
            if (value && livestockEntries.length === 0) {
              addLivestockEntry({ type: "", count: 0 });
            }
          }}
        />

        {hasLivestock && (
          <View className="mt-4">
            {livestockEntries.map((entry, index) => (
              <View
                key={entry.id}
                className="bg-white rounded-xl p-4 mb-4 border border-neutral-border"
              >
                {livestockEntries.length > 1 && (
                  <View className="flex-row justify-between items-center mb-3">
                    <Text className="font-semibold text-neutral-textDark">
                      {t("onboarding.livestock.animal")} #{index + 1}
                    </Text>
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

                <View className="flex-row gap-3">
                  <View className="flex-[1.5]">
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
                  <View className="flex-1">
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
              className="flex-row items-center justify-center py-3 px-4 rounded-xl bg-secondary-soil self-start"
            >
              <Text className="text-white font-medium mr-2">
                {t("onboarding.livestock.addAnimal")}
              </Text>
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
      className="flex-1 bg-neutral-surface"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {renderStep()}

      {/* Bottom Navigation */}
      <View className="px-6 py-4 bg-neutral-surface">
        {/* Skip for now link */}
        <TouchableOpacity onPress={handleSkip} className="items-center mb-4">
          <Text className="text-neutral-textMedium text-sm">
            {t("onboarding.skip")}
          </Text>
        </TouchableOpacity>

        {/* Next/Finish Button */}
        <Button
          variant="primary"
          onPress={handleNext}
          disabled={!isStepValid()}
          className="w-full py-4"
        >
          <Text className="text-white font-semibold text-base">
            {currentStep === TOTAL_STEPS - 1
              ? t("onboarding.finish")
              : t("onboarding.next")}
          </Text>
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
};

export default Onboarding;

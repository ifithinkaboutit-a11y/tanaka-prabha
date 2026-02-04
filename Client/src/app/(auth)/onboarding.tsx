// src/app/(auth)/onboarding.tsx
import Button from "@/components/atoms/Button";
import FormInput from "@/components/atoms/FormInput";
import Select from "@/components/atoms/Select";
import Toggle from "@/components/atoms/Toggle";
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
import { useAuth } from "../../contexts/AuthContext";
import { colors } from "../../styles/colors";

const Onboarding = () => {
  const router = useRouter();
  const { t, currentLanguage } = useTranslation();
  const { isAuthenticated } = useAuth();

  const {
    currentStep,
    nextStep,
    prevStep,
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

  const handleNext = () => {
    if (currentStep < 2) {
      nextStep();
    } else {
      // User is already authenticated after OTP, just navigate to home
      router.replace("/(tab)/" as any);
    }
  };

  const handleSkip = () => {
    // User is already authenticated after OTP, just navigate to home
    router.replace("/(tab)/" as any);
  };

  const stateOptions = getLocalizedOptions(indianStates, currentLanguage);
  const cropOptions = getLocalizedOptions(cropTypes, currentLanguage);
  const unitOptions = getLocalizedOptions(landUnits, currentLanguage);
  const animalOptions = getLocalizedOptions(animalTypes, currentLanguage);

  const renderPersonalStep = () => (
    <View className="flex-1 px-4">
      <OnboardingHeader
        title={t("onboarding.personal.title")}
        subtitle={t("onboarding.personal.subtitle")}
      />

      <ScrollView className="flex-1 pt-6 p-4">
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
          ]}
          onChange={(value) => updatePersonalDetails({ district: value })}
        />

        <FormInput
          label={t("onboarding.personal.village")}
          placeholder={t("onboarding.personal.selectVillage")}
          value={personalDetails.village}
          onChangeText={(text) => updatePersonalDetails({ village: text })}
        />
      </ScrollView>
    </View>
  );

  const renderLandStep = () => (
    <View className="flex-1">
      <OnboardingHeader
        title={t("onboarding.land.title")}
        subtitle={t("onboarding.land.subtitle")}
      />

      <ScrollView className="flex-1 px-6 pt-6">
        <Toggle
          label={t("onboarding.land.doYouHaveLand")}
          value={hasLand}
          onChange={setHasLand}
        />

        {hasLand && (
          <View className="mt-4">
            {landEntries.map((entry, index) => (
              <View
                key={entry.id}
                className="bg-neutral-surface rounded-xl p-4 mb-4 border border-neutral-border"
              >
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

                <View className="flex-row gap-3">
                  <View className="flex-1">
                    <FormInput
                      label={t("onboarding.land.totalArea")}
                      placeholder="0"
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

                <Select
                  label={t("onboarding.land.mainCrop")}
                  placeholder={t("onboarding.land.selectCrop")}
                  value={entry.mainCrop}
                  options={cropOptions}
                  onChange={(value) =>
                    updateLandEntry(entry.id, { mainCrop: value })
                  }
                />
              </View>
            ))}

            <TouchableOpacity
              onPress={() =>
                addLandEntry({ area: 0, unit: "bigha", mainCrop: "" })
              }
              className="flex-row items-center justify-center py-3 border border-dashed border-primary rounded-xl"
            >
              <Ionicons
                name="add-circle"
                size={20}
                color={colors.primary.green}
              />
              <Text className="text-primary font-medium ml-2">
                {t("onboarding.land.addLand")} +
              </Text>
            </TouchableOpacity>

            {landEntries.length > 0 && (
              <Text className="text-neutral-textMedium text-center mt-3">
                {landEntries.length} {t("onboarding.land.landAdded")}
              </Text>
            )}
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
      />

      <ScrollView className="flex-1 px-6 pt-6">
        <Toggle
          label={t("onboarding.livestock.doYouHaveLivestock")}
          value={hasLivestock}
          onChange={setHasLivestock}
        />

        {hasLivestock && (
          <View className="mt-4">
            {livestockEntries.map((entry, index) => (
              <View
                key={entry.id}
                className="bg-neutral-surface rounded-xl p-4 mb-4 border border-neutral-border"
              >
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

                <View className="flex-row gap-3">
                  <View className="flex-2">
                    <Select
                      label={t("onboarding.livestock.animal")}
                      placeholder={t("onboarding.livestock.selectAnimal")}
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
                      placeholder="0"
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
              className="flex-row items-center justify-center py-3 border border-dashed border-primary rounded-xl"
            >
              <Ionicons
                name="add-circle"
                size={20}
                color={colors.primary.green}
              />
              <Text className="text-primary font-medium ml-2">
                {t("onboarding.livestock.addAnimal")} +
              </Text>
            </TouchableOpacity>

            {livestockEntries.length > 0 && (
              <Text className="text-neutral-textMedium text-center mt-3">
                {livestockEntries.length}{" "}
                {t("onboarding.livestock.animalsAdded")}
              </Text>
            )}
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
      className="flex-1 bg-white"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {renderStep()}

      {/* Bottom Navigation */}
      <View className="px-6 py-4 border-t border-neutral-border bg-white">
        <View className="flex-row gap-4">
          {currentStep > 0 && (
            <TouchableOpacity
              onPress={prevStep}
              className="flex-1 py-4 rounded-xl border border-neutral-border items-center"
            >
              <Text className="text-neutral-textMedium font-medium">
                {t("onboarding.skip")}
              </Text>
            </TouchableOpacity>
          )}

          {currentStep === 0 && (
            <TouchableOpacity
              onPress={handleSkip}
              className="flex-1 py-4 rounded-xl border border-neutral-border items-center"
            >
              <Text className="text-neutral-textMedium font-medium">
                {t("onboarding.skip")}
              </Text>
            </TouchableOpacity>
          )}

          <Button
            variant="primary"
            onPress={handleNext}
            className="flex-1 py-4"
          >
            <Text className="text-white font-semibold text-base">
              {currentStep === 2
                ? t("onboarding.finish")
                : t("onboarding.next")}
            </Text>
          </Button>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default Onboarding;

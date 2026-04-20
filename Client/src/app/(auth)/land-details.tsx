// src/app/(auth)/land-details.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Pressable,
  StatusBar,
  StyleSheet,
  View,
  TextInput,
  Alert,
} from "react-native";
import KeyboardAwareScrollView from "../../components/atoms/KeyboardAwareScrollView";
import AppText from "../../components/atoms/AppText";
import Button from "../../components/atoms/Button";
import Toggle from "../../components/atoms/Toggle";
import Select from "../../components/atoms/Select";
import CropSelector from "../../components/molecules/CropSelector";
import { useOnboardingStore, LandEntry } from "../../stores/onboardingStore";
import { useTranslation } from "../../i18n";
import {
  landUnits,
  getLocalizedOptions,
} from "../../data/content/onboardingOptions";
import { theme } from "../../styles/colors";
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
    updateLandEntry,
  } = useOnboardingStore();

  const [errors, setErrors] = useState<EntryErrors>({});
  const [touched, setTouched] = useState<Record<string, Record<string, boolean>>>({});

  const unitOptions = getLocalizedOptions(landUnits, currentLanguage);

  const validateAllEntries = (): boolean => {
    if (!hasLand) return true;
    if (landEntries.length === 0) return false;

    const entry = landEntries[0];
    const validation = validateLandEntry({
      area: entry.area,
      unit: entry.unit,
      crops: entry.crops || [],
    });

    if (!validation.isValid) {
      const entryErrors: { area?: string; crops?: string } = {};
      validation.errors.forEach((error) => {
        if (error.toLowerCase().includes("area") || error.toLowerCase().includes("land")) {
          entryErrors.area = error;
        } else if (error.toLowerCase().includes("crop")) {
          entryErrors.crops = error;
        }
      });
      setErrors({ [entry.id]: entryErrors });
      return false;
    }

    setErrors({});
    return true;
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
      const entryId = landEntries[0]?.id || "default";
      const errorMessage =
        errors[entryId]?.area ||
        errors[entryId]?.crops ||
        t("validation.landDetailsError") ||
        "Please fill in all land details correctly";

      Alert.alert(t("validation.validationError") || "Validation Error", errorMessage);

      setTouched({ [entryId]: { area: true, crops: true } });
      return;
    }

    router.push("/(auth)/livestock-details");
  };

  const handleSkip = () => {
    router.push("/(auth)/livestock-details");
  };

  const isValid = () => {
    if (!hasLand) return true;
    return landEntries[0] && landEntries[0].area > 0 && landEntries[0].crops && landEntries[0].crops.length > 0;
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background.input }}>
      <StatusBar barStyle="light-content" backgroundColor={theme.primary.green} />
      {/* Static Header */}
      <View style={headerStyles.header}>
        <View style={headerStyles.progressTrack}>
          <View style={[headerStyles.progressFill, { width: "75%" }]} />
        </View>
        <AppText variant="h2" style={headerStyles.headerTitle}>
          {t("onboarding.landTitle") || "Land Details"}
        </AppText>
        <AppText variant="bodySm" style={headerStyles.headerSubtitle}>
          {t("onboarding.landSubtitle") || "Tell us about your land holdings"}
        </AppText>
      </View>

      <View style={{ flex: 1 }}>
        <KeyboardAwareScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Has Land Toggle */}
          <View className="bg-gray-50 rounded-2xl p-5 mb-4 mt-6">
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

          {/* Unified Land Entry Form */}
          {hasLand && landEntries[0] && (
            <View className="bg-white rounded-2xl p-6 mb-4 shadow-sm elevation-2">
              <AppText variant="h3" style={{ color: theme.text.primary, marginBottom: 20, fontSize: 18, fontWeight: "700" }}>
                {t("onboarding.landEntry") || "Total Landholding"}
              </AppText>

              {/* Area Input */}
              <View className="mb-6">
                <AppText variant="bodySm" style={{ color: theme.text.subtle, fontWeight: "600", marginBottom: 8 }}>
                  {t("onboarding.landArea") || "Total Land Area"}
                </AppText>
                <View className="flex-row gap-3">
                  <View className="flex-1">
                    <TextInput
                      style={{
                        backgroundColor: theme.background.neutralSubtle,
                        borderWidth: 1,
                        borderColor: errors[landEntries[0].id]?.area && touched[landEntries[0].id]?.area ? theme.semantic.errorLight : theme.border.subtle,
                        borderRadius: 12,
                        padding: 14,
                        fontSize: 16,
                        color: theme.text.secondary,
                      }}
                      value={landEntries[0].area > 0 ? String(landEntries[0].area) : ""}
                      onChangeText={(text) => handleAreaChange(landEntries[0].id, text)}
                      onBlur={() => handleAreaBlur(landEntries[0].id, landEntries[0].area)}
                      keyboardType="numeric"
                      placeholder="0"
                      placeholderTextColor={theme.text.placeholder}
                    />
                  </View>
                  <View style={{ width: 120 }}>
                    <Select
                      value={landEntries[0].unit}
                      onChange={(value) =>
                        updateLandEntry(landEntries[0].id, { unit: value as "bigha" | "acre" | "hectare" })
                      }
                      options={unitOptions}
                      placeholder={t("onboarding.selectUnit")}
                    />
                  </View>
                </View>
                {errors[landEntries[0].id]?.area && touched[landEntries[0].id]?.area && (
                  <AppText variant="bodySm" className="text-red-500 mt-2">
                    {errors[landEntries[0].id].area}
                  </AppText>
                )}
              </View>

              {/* Crops Selection */}
              <View>
                <AppText variant="bodySm" style={{ color: theme.text.subtle, fontWeight: "600", marginBottom: 8 }}>
                  {t("onboarding.cropsGrown") || "Crops Grown"}
                </AppText>
                <View
                  style={{
                    borderWidth: errors[landEntries[0].id]?.crops && touched[landEntries[0].id]?.crops ? 1 : 0,
                    borderColor: errors[landEntries[0].id]?.crops && touched[landEntries[0].id]?.crops ? theme.semantic.errorLight : "transparent",
                    borderRadius: 12,
                  }}
                >
                  <CropSelector
                    value={landEntries[0].crops || []}
                    onValueChange={(crops) => handleCropsChange(landEntries[0].id, crops)}
                    otherValue={landEntries[0].otherCropsText || ""}
                    onOtherValueChange={(text) => updateLandEntry(landEntries[0].id, { otherCropsText: text })}
                    language={currentLanguage as "en" | "hi"}
                  />
                </View>
                {errors[landEntries[0].id]?.crops && touched[landEntries[0].id]?.crops && (
                  <AppText variant="bodySm" className="text-red-500 mt-2">
                    {errors[landEntries[0].id].crops}
                  </AppText>
                )}
              </View>
            </View>
          )}
        </KeyboardAwareScrollView>

        {/* Bottom Buttons */}
        <View style={{ padding: 20, backgroundColor: theme.background.input, borderTopWidth: 1, borderTopColor: theme.border.subtle, flexDirection: "row", gap: 12 }}>
          {/* <Pressable
            onPress={handleSkip}
            style={{ flex: 1, paddingVertical: 16, borderRadius: 999, backgroundColor: theme.background.input, borderWidth: 1, borderColor: theme.border.card, alignItems: "center" }}
          >
            <AppText variant="bodyMd" style={{ color: theme.text.muted, fontWeight: "600" }}>
              {t("common.skip")}
            </AppText>
          </Pressable> */}

          <Pressable
            onPress={handleNext}
            disabled={!isValid()}
            style={{ flex: 2, paddingVertical: 16, borderRadius: 999, alignItems: "center", backgroundColor: isValid() ? theme.primary.green : theme.border.card }}
          >
            <AppText variant="bodyMd" style={{ color: theme.text.onPrimary, fontWeight: "700" }}>
              {t("common.next")}
            </AppText>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

export default AuthLandDetailsScreen;

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

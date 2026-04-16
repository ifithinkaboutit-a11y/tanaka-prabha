// src/app/(auth)/land-details.tsx
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
import { useOnboardingStore } from "../../stores/onboardingStore";
import { useTranslation } from "../../i18n";
import {
  landUnits,
  getLocalizedOptions,
} from "../../data/content/onboardingOptions";
import { colors } from "../../styles/colors";
import { theme } from "../../styles/colors";
import { validateLandArea } from "../../utils/validation";

export const unstable_settings = {
  headerShown: false,
};

interface FormErrors {
  area?: string;
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

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const unitOptions = getLocalizedOptions(landUnits, currentLanguage);

  // Always work with the single land entry (first entry)
  const entry = landEntries[0];

  const validateForm = (): boolean => {
    if (!entry) return false;
    if (entry.area <= 0) {
      setErrors({ area: "Land area must be greater than 0" });
      return false;
    }
    setErrors({});
    return true;
  };

  const handleAreaChange = (text: string) => {
    if (!entry) return;
    const num = parseFloat(text) || 0;
    updateLandEntry(entry.id, { area: num });

    if (touched.area) {
      const validation = validateLandArea(num);
      setErrors((prev) => ({ ...prev, area: validation.errors[0] }));
    }
  };

  const handleAreaBlur = () => {
    if (!entry) return;
    setTouched((prev) => ({ ...prev, area: true }));

    const validation = validateLandArea(entry.area);
    if (entry.area <= 0) {
      setErrors((prev) => ({ ...prev, area: "Land area must be greater than 0" }));
    } else if (!validation.isValid) {
      setErrors((prev) => ({ ...prev, area: validation.errors[0] }));
    } else {
      setErrors((prev) => ({ ...prev, area: undefined }));
    }
  };

  const handleNext = () => {
    if (hasLand && !validateForm()) {
      const errorMessage =
        errors.area ||
        t("validation.landDetailsError") ||
        "Please fill in all land details correctly";

      Alert.alert(t("validation.validationError") || "Validation Error", errorMessage);
      setTouched({ area: true });
      return;
    }

    router.push("/(auth)/livestock-details");
  };

  const handleSkip = () => {
    router.push("/(auth)/livestock-details");
  };

  const isValid = () => {
    return !hasLand || (entry !== undefined && entry.area > 0);
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

          {/* Single Land Holding Form */}
          {hasLand && entry && (
            <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm elevation-2">
              {/* Area Input */}
              <View className="mb-4">
                <AppText variant="bodySm" className="text-gray-500 mb-2">
                  {t("onboarding.landArea")}
                </AppText>
                <View className="flex-row gap-3">
                  <View className="flex-1">
                    <TextInput
                      style={{
                        backgroundColor: theme.background.neutralSubtle,
                        borderWidth: 1,
                        borderColor:
                          errors.area && touched.area
                            ? theme.semantic.errorLight
                            : theme.border.subtle,
                        borderRadius: 12,
                        padding: 14,
                        fontSize: 16,
                        color: theme.text.secondary,
                      }}
                      value={entry.area > 0 ? String(entry.area) : ""}
                      onChangeText={handleAreaChange}
                      onBlur={handleAreaBlur}
                      keyboardType="numeric"
                      placeholder="0"
                      placeholderTextColor={theme.text.placeholder}
                    />
                  </View>
                  <View style={{ width: 120 }}>
                    <Select
                      value={entry.unit}
                      onChange={(value) =>
                        updateLandEntry(entry.id, {
                          unit: value as "bigha" | "acre" | "hectare",
                        })
                      }
                      options={unitOptions}
                      placeholder={t("onboarding.selectUnit")}
                    />
                  </View>
                </View>
                {errors.area && touched.area && (
                  <AppText variant="bodySm" className="text-red-500 mt-1">
                    {errors.area}
                  </AppText>
                )}
              </View>

              {/* Total Land Input */}
              <View>
                <AppText variant="bodySm" className="text-gray-500 mb-2">
                  {"Total Land (in Ha)"}
                </AppText>
                <TextInput
                  style={{
                    backgroundColor: theme.background.neutralSubtle,
                    borderWidth: 1,
                    borderColor: theme.border.subtle,
                    borderRadius: 12,
                    padding: 14,
                    fontSize: 16,
                    color: theme.text.secondary,
                  }}
                  value={entry.area > 0 ? String(entry.area) : ""}
                  onChangeText={(text) =>
                    updateLandEntry(entry.id, { area: parseFloat(text) || 0 })
                  }
                  keyboardType="decimal-pad"
                  placeholder="0"
                  placeholderTextColor={theme.text.placeholder}
                />
              </View>
            </View>
          )}
        </KeyboardAwareScrollView>

        {/* Bottom Buttons */}
        <View
          style={{
            padding: 20,
            backgroundColor: theme.background.input,
            borderTopWidth: 1,
            borderTopColor: theme.border.subtle,
            flexDirection: "row",
            gap: 12,
          }}
        >
          <Pressable
            onPress={handleSkip}
            style={{
              flex: 1,
              paddingVertical: 16,
              borderRadius: 999,
              backgroundColor: theme.background.input,
              borderWidth: 1,
              borderColor: theme.border.card,
              alignItems: "center",
            }}
          >
            <AppText
              variant="bodyMd"
              style={{ color: theme.text.muted, fontWeight: "600" }}
            >
              {t("common.skip")}
            </AppText>
          </Pressable>

          <Pressable
            onPress={handleNext}
            disabled={!isValid()}
            style={{
              flex: 2,
              paddingVertical: 16,
              borderRadius: 999,
              alignItems: "center",
              backgroundColor: isValid()
                ? theme.primary.green
                : theme.border.card,
            }}
          >
            <AppText
              variant="bodyMd"
              style={{ color: theme.text.onPrimary, fontWeight: "700" }}
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

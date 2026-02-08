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
} from "react-native";
import AppText from "../../components/atoms/AppText";
import Button from "../../components/atoms/Button";
import Toggle from "../../components/atoms/Toggle";
import MultiSelect from "../../components/atoms/MultiSelect";
import Select from "../../components/atoms/Select";
import { useOnboardingStore } from "../../stores/onboardingStore";
import { useTranslation } from "../../i18n";
import {
  cropTypes,
  landUnits,
  getLocalizedOptions,
} from "../../data/content/onboardingOptions";
import { colors } from "../../styles/colors";

export const unstable_settings = {
  headerShown: false,
};

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

  const cropOptions = getLocalizedOptions(cropTypes, currentLanguage);
  const unitOptions = getLocalizedOptions(landUnits, currentLanguage);

  const handleNext = () => {
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

  return (
    <View style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingTop: 48,
          paddingBottom: 16,
          paddingHorizontal: 20,
          backgroundColor: "#386641",
        }}
      >
        <Pressable
          onPress={handleBack}
          style={({ pressed }) => ({
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: "rgba(255,255,255,0.2)",
            alignItems: "center",
            justifyContent: "center",
            marginRight: 12,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </Pressable>
        <View style={{ flex: 1 }}>
          <AppText
            variant="h3"
            style={{ fontWeight: "700", color: "#FFFFFF", fontSize: 20 }}
          >
            {t("onboarding.landTitle")}
          </AppText>
          <AppText
            variant="bodySm"
            style={{ color: "rgba(255,255,255,0.8)", marginTop: 2 }}
          >
            {t("onboarding.step")} 2/3
          </AppText>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 20 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Do you own land? */}
          <View
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
              }}
            >
              <AppText
                variant="bodyMd"
                style={{ fontWeight: "600", color: "#374151" }}
              >
                {t("onboarding.hasLand")}
              </AppText>
              <Toggle value={hasLand} onValueChange={setHasLand} />
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
                          style={{
                            backgroundColor: "#F9FAFB",
                            borderWidth: 1,
                            borderColor: "#E5E7EB",
                            borderRadius: 12,
                            padding: 14,
                            fontSize: 16,
                            color: "#1F2937",
                          }}
                          value={entry.area > 0 ? String(entry.area) : ""}
                          onChangeText={(text) => {
                            const num = parseFloat(text) || 0;
                            updateLandEntry(entry.id, { area: num });
                          }}
                          keyboardType="numeric"
                          placeholder="0"
                          placeholderTextColor="#9CA3AF"
                        />
                      </View>
                      <View style={{ width: 120 }}>
                        <Select
                          value={entry.unit}
                          onValueChange={(value) =>
                            updateLandEntry(entry.id, { unit: value })
                          }
                          options={unitOptions}
                          placeholder={t("onboarding.selectUnit")}
                        />
                      </View>
                    </View>
                  </View>

                  {/* Crops Selection */}
                  <View>
                    <AppText
                      variant="bodySm"
                      style={{ color: "#6B7280", marginBottom: 8 }}
                    >
                      {t("onboarding.cropsGrown")}
                    </AppText>
                    <MultiSelect
                      value={entry.crops || []}
                      onValueChange={(crops) =>
                        updateLandEntry(entry.id, { crops })
                      }
                      options={cropOptions}
                      placeholder={t("onboarding.selectCrops")}
                    />
                  </View>
                </View>
              ))}

              {/* Add Another Land Entry */}
              <Pressable
                onPress={addLandEntry}
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

          <View style={{ height: 100 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Bottom Buttons */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
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
  );
};

export default AuthLandDetailsScreen;

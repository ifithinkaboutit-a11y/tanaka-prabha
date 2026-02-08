// src/app/(auth)/personal-details.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  View,
  TextInput,
} from "react-native";
import AppText from "../../components/atoms/AppText";
import Select from "../../components/atoms/Select";
import { useOnboardingStore } from "../../stores/onboardingStore";
import { useTranslation } from "../../i18n";
import {
  indianStates,
  getLocalizedOptions,
} from "../../data/content/onboardingOptions";

export const unstable_settings = {
  headerShown: false,
};

const AuthPersonalDetailsScreen = () => {
  const router = useRouter();
  const { t, currentLanguage } = useTranslation();
  const { personalDetails, updatePersonalDetails } = useOnboardingStore();

  const stateOptions = getLocalizedOptions(indianStates, currentLanguage);

  const handleNext = () => {
    // Navigate to land details
    router.push("/(auth)/land-details");
  };

  const handleSkip = () => {
    // Skip to land details
    router.push("/(auth)/land-details");
  };

  const isValid = () => {
    return (
      personalDetails.fathersName.trim() !== "" &&
      personalDetails.state !== ""
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
        <View style={{ flex: 1 }}>
          <AppText
            variant="h3"
            style={{ fontWeight: "700", color: "#FFFFFF", fontSize: 20 }}
          >
            {t("onboarding.personalTitle")}
          </AppText>
          <AppText
            variant="bodySm"
            style={{ color: "rgba(255,255,255,0.8)", marginTop: 2 }}
          >
            {t("onboarding.step")} 1/3
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
          {/* Welcome Message */}
          <View
            style={{
              backgroundColor: "#DCFCE7",
              borderRadius: 16,
              padding: 20,
              marginBottom: 20,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Ionicons name="person-circle" size={40} color="#16A34A" />
            <View style={{ marginLeft: 14, flex: 1 }}>
              <AppText
                variant="bodyMd"
                style={{ fontWeight: "700", color: "#166534" }}
              >
                {t("onboarding.welcomeTitle")}
              </AppText>
              <AppText
                variant="bodySm"
                style={{ color: "#15803D", marginTop: 2 }}
              >
                {t("onboarding.personalSubtitle")}
              </AppText>
            </View>
          </View>

          {/* Personal Information Form */}
          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 16,
              padding: 20,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 8,
              elevation: 2,
            }}
          >
            {/* Father's Name */}
            <View style={{ marginBottom: 20 }}>
              <AppText
                variant="bodySm"
                style={{ color: "#374151", fontWeight: "600", marginBottom: 8 }}
              >
                {t("onboarding.fathersName")} *
              </AppText>
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
                value={personalDetails.fathersName}
                onChangeText={(text) =>
                  updatePersonalDetails({ fathersName: text })
                }
                placeholder={t("onboarding.enterFathersName")}
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* Mother's Name */}
            <View style={{ marginBottom: 20 }}>
              <AppText
                variant="bodySm"
                style={{ color: "#374151", fontWeight: "600", marginBottom: 8 }}
              >
                {t("onboarding.mothersName")}
              </AppText>
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
                value={personalDetails.mothersName}
                onChangeText={(text) =>
                  updatePersonalDetails({ mothersName: text })
                }
                placeholder={t("onboarding.enterMothersName")}
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* Village */}
            <View style={{ marginBottom: 20 }}>
              <AppText
                variant="bodySm"
                style={{ color: "#374151", fontWeight: "600", marginBottom: 8 }}
              >
                {t("onboarding.village")}
              </AppText>
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
                value={personalDetails.village}
                onChangeText={(text) =>
                  updatePersonalDetails({ village: text })
                }
                placeholder={t("onboarding.enterVillage")}
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* District */}
            <View style={{ marginBottom: 20 }}>
              <AppText
                variant="bodySm"
                style={{ color: "#374151", fontWeight: "600", marginBottom: 8 }}
              >
                {t("onboarding.district")}
              </AppText>
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
                value={personalDetails.district}
                onChangeText={(text) =>
                  updatePersonalDetails({ district: text })
                }
                placeholder={t("onboarding.enterDistrict")}
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* State */}
            <View style={{ marginBottom: 20 }}>
              <AppText
                variant="bodySm"
                style={{ color: "#374151", fontWeight: "600", marginBottom: 8 }}
              >
                {t("onboarding.state")} *
              </AppText>
              <Select
                value={personalDetails.state}
                onValueChange={(value) =>
                  updatePersonalDetails({ state: value })
                }
                options={stateOptions}
                placeholder={t("onboarding.selectState")}
              />
            </View>

            {/* Pin Code */}
            <View>
              <AppText
                variant="bodySm"
                style={{ color: "#374151", fontWeight: "600", marginBottom: 8 }}
              >
                {t("onboarding.pinCode")}
              </AppText>
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
                value={personalDetails.pinCode}
                onChangeText={(text) =>
                  updatePersonalDetails({ pinCode: text })
                }
                placeholder={t("onboarding.enterPinCode")}
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                maxLength={6}
              />
            </View>
          </View>

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

export default AuthPersonalDetailsScreen;

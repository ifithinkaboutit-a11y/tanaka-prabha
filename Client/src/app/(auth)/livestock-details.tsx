// src/app/(auth)/livestock-details.tsx
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
import Toggle from "../../components/atoms/Toggle";
import Select from "../../components/atoms/Select";
import { useOnboardingStore } from "../../stores/onboardingStore";
import { useAuth } from "../../contexts/AuthContext";
import { useTranslation } from "../../i18n";
import {
  animalTypes,
  getLocalizedOptions,
} from "../../data/content/onboardingOptions";

export const unstable_settings = {
  headerShown: false,
};

const AuthLivestockDetailsScreen = () => {
  const router = useRouter();
  const { t, currentLanguage } = useTranslation();
  const { completeOnboarding } = useAuth();
  const {
    hasLivestock,
    setHasLivestock,
    livestockEntries,
    addLivestockEntry,
    removeLivestockEntry,
    updateLivestockEntry,
  } = useOnboardingStore();

  const animalOptions = getLocalizedOptions(animalTypes, currentLanguage);

  const handleFinish = () => {
    // Mark onboarding complete and navigate to home
    completeOnboarding();
    router.replace("/(tab)/" as any);
  };

  const handleSkip = () => {
    // Skip also marks onboarding as complete
    completeOnboarding();
    router.replace("/(tab)/" as any);
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
            {t("onboarding.livestockTitle")}
          </AppText>
          <AppText
            variant="bodySm"
            style={{ color: "rgba(255,255,255,0.8)", marginTop: 2 }}
          >
            {t("onboarding.step")} 3/3
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
          {/* Do you have livestock? */}
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
                {t("onboarding.hasLivestock")}
              </AppText>
              <Toggle value={hasLivestock} onValueChange={setHasLivestock} />
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
                    <Select
                      value={entry.type}
                      onValueChange={(value) =>
                        updateLivestockEntry(entry.id, { type: value })
                      }
                      options={animalOptions}
                      placeholder={t("onboarding.selectAnimal")}
                    />
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
                      style={{
                        backgroundColor: "#F9FAFB",
                        borderWidth: 1,
                        borderColor: "#E5E7EB",
                        borderRadius: 12,
                        padding: 14,
                        fontSize: 16,
                        color: "#1F2937",
                      }}
                      value={entry.count > 0 ? String(entry.count) : ""}
                      onChangeText={(text) => {
                        const num = parseInt(text) || 0;
                        updateLivestockEntry(entry.id, { count: num });
                      }}
                      keyboardType="numeric"
                      placeholder="0"
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>
                </View>
              ))}

              {/* Add Another Livestock Entry */}
              <Pressable
                onPress={addLivestockEntry}
                style={({ pressed }) => ({
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: pressed ? "#FEF3C7" : "#FFFBEB",
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 16,
                  borderWidth: 2,
                  borderColor: "#FCD34D",
                  borderStyle: "dashed",
                })}
              >
                <Ionicons name="add-circle-outline" size={20} color="#D97706" />
                <AppText
                  variant="bodySm"
                  style={{ color: "#D97706", fontWeight: "600", marginLeft: 8 }}
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
          onPress={handleFinish}
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
            flexDirection: "row",
            justifyContent: "center",
          })}
        >
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
        </Pressable>
      </View>
    </View>
  );
};

export default AuthLivestockDetailsScreen;

// src/app/(auth)/personal-details.tsx
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState, useMemo } from "react";
import {
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
import Select from "../../components/atoms/Select";
import { useOnboardingStore } from "../../stores/onboardingStore";
import { useTranslation } from "../../i18n";
import {
  indianStates,
  genderOptions,
  getLocalizedOptions,
} from "../../data/content/onboardingOptions";
import { indianDistricts } from "../../data/indianLocations";
import {
  validatePersonalDetails,
  validateName,
  validatePinCode,
} from "../../utils/validation";

export const unstable_settings = {
  headerShown: false,
};

interface FieldErrors {
  name?: string;
  age?: string;
  gender?: string;
  aadhaar?: string;
  fathersName?: string;
  mothersName?: string;
  village?: string;
  district?: string;
  state?: string;
  pinCode?: string;
}

const AuthPersonalDetailsScreen = () => {
  const router = useRouter();
  const { t, currentLanguage } = useTranslation();
  const { personalDetails, updatePersonalDetails } = useOnboardingStore();
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const stateOptions = getLocalizedOptions(indianStates, currentLanguage);
  const genderSelectOptions = getLocalizedOptions(genderOptions, currentLanguage);

  // Get districts filtered by selected state
  const districtOptions = useMemo(() => {
    if (!personalDetails.state) return [];
    return indianDistricts
      .filter((d) => d.stateValue === personalDetails.state)
      .map((d) => ({
        value: d.value,
        label: currentLanguage === "hi" ? d.labelHi : d.label,
      }));
  }, [personalDetails.state, currentLanguage]);

  const validateField = (field: keyof FieldErrors, value: string) => {
    let error: string | undefined;
    
    switch (field) {
      case "name":
        if (!value.trim()) {
          error = t("validation.nameRequired") || "Name is required";
        } else {
          const nameValidation = validateName(value, "Name");
          error = nameValidation.errors[0];
        }
        break;
      case "age":
        const ageNum = parseInt(value);
        if (!value.trim()) {
          error = t("validation.ageRequired") || "Age is required";
        } else if (isNaN(ageNum) || ageNum < 18 || ageNum > 120) {
          error = t("validation.ageInvalid") || "Please enter a valid age (18-120)";
        }
        break;
      case "gender":
        if (!value) {
          error = t("validation.genderRequired") || "Gender is required";
        }
        break;
      case "aadhaar":
        if (value && !/^\d{12}$/.test(value.replace(/\s/g, ""))) {
          error = t("validation.aadhaarInvalid") || "Aadhaar must be 12 digits";
        }
        break;
      case "fathersName":
        if (!value.trim()) {
          error = t("validation.fathersNameRequired") || "Father's name is required";
        } else {
          const nameValidation = validateName(value, "Father's name");
          error = nameValidation.errors[0];
        }
        break;
      case "mothersName":
        if (value.trim()) {
          const nameValidation = validateName(value, "Mother's name");
          error = nameValidation.errors[0];
        }
        break;
      case "state":
        if (!value) {
          error = t("validation.stateRequired") || "State is required";
        }
        break;
      case "pinCode":
        if (value) {
          const pinValidation = validatePinCode(value);
          error = pinValidation.errors[0];
        }
        break;
    }
    
    setErrors((prev) => ({ ...prev, [field]: error }));
    return !error;
  };

  const handleFieldChange = (field: keyof FieldErrors, value: string) => {
    updatePersonalDetails({ [field]: value });
    if (touched[field]) {
      validateField(field, value);
    }
  };

  const handleFieldBlur = (field: keyof FieldErrors) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const value = personalDetails[field as keyof typeof personalDetails];
    validateField(field, String(value ?? ""));
  };

  const handleNext = () => {
    // Mark all fields as touched
    setTouched({
      name: true,
      age: true,
      gender: true,
      aadhaar: true,
      fathersName: true,
      mothersName: true,
      village: true,
      district: true,
      state: true,
      pinCode: true,
    });

    // Validate required fields manually
    let hasErrors = false;
    const newErrors: FieldErrors = {};

    if (!personalDetails.name?.trim()) {
      newErrors.name = t("validation.nameRequired") || "Name is required";
      hasErrors = true;
    }
    if (!personalDetails.age || personalDetails.age < 18 || personalDetails.age > 120) {
      newErrors.age = t("validation.ageInvalid") || "Please enter a valid age (18-120)";
      hasErrors = true;
    }
    if (!personalDetails.gender) {
      newErrors.gender = t("validation.genderRequired") || "Gender is required";
      hasErrors = true;
    }
    if (!personalDetails.fathersName?.trim()) {
      newErrors.fathersName = t("validation.fathersNameRequired") || "Father's name is required";
      hasErrors = true;
    }
    if (!personalDetails.state) {
      newErrors.state = t("validation.stateRequired") || "State is required";
      hasErrors = true;
    }
    
    if (hasErrors) {
      setErrors(newErrors);
      Alert.alert(
        t("validation.validationError") || "Validation Error",
        Object.values(newErrors)[0] || "Please fill all required fields"
      );
      return;
    }

    // Navigate to land details
    router.push("/(auth)/land-details");
  };

  const handleSkip = () => {
    // Skip to land details
    router.push("/(auth)/land-details");
  };

  const isValid = () => {
    return (
      personalDetails.name?.trim() !== "" &&
      personalDetails.age > 0 &&
      personalDetails.gender !== "" &&
      personalDetails.fathersName?.trim() !== "" &&
      personalDetails.state !== "" &&
      Object.values(errors).every((e) => !e)
    );
  };

  const getInputStyle = (field: keyof FieldErrors) => ({
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: errors[field] && touched[field] ? "#EF4444" : "#E5E7EB",
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
              width: "33%",
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
            {t("onboarding.personalTitle")}
          </AppText>
          <AppText
            variant="bodySm"
            style={{ color: "#6B7280", marginTop: 6, textAlign: "center" }}
          >
            {t("onboarding.personalSubtitle")}
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
            {/* Full Name */}
            <View style={{ marginBottom: 20 }}>
              <AppText
                variant="bodySm"
                style={{ color: "#374151", fontWeight: "600", marginBottom: 8 }}
              >
                {t("onboarding.fullName")} *
              </AppText>
              <TextInput
                style={getInputStyle("name")}
                value={personalDetails.name}
                onChangeText={(text) => handleFieldChange("name", text)}
                onBlur={() => handleFieldBlur("name")}
                placeholder={t("onboarding.enterFullName")}
                placeholderTextColor="#9CA3AF"
              />
              {errors.name && touched.name && (
                <AppText
                  variant="bodySm"
                  style={{ color: "#EF4444", marginTop: 4 }}
                >
                  {errors.name}
                </AppText>
              )}
            </View>

            {/* Age and Gender Row */}
            <View style={{ flexDirection: "row", gap: 12, marginBottom: 20 }}>
              {/* Age */}
              <View style={{ flex: 1 }}>
                <AppText
                  variant="bodySm"
                  style={{ color: "#374151", fontWeight: "600", marginBottom: 8 }}
                >
                  {t("onboarding.age")} *
                </AppText>
                <TextInput
                  style={getInputStyle("age")}
                  value={personalDetails.age > 0 ? String(personalDetails.age) : ""}
                  onChangeText={(text) => {
                    const num = parseInt(text) || 0;
                    updatePersonalDetails({ age: num });
                    if (touched.age) {
                      validateField("age", text);
                    }
                  }}
                  onBlur={() => handleFieldBlur("age")}
                  placeholder={t("onboarding.enterAge")}
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  maxLength={3}
                />
                {errors.age && touched.age && (
                  <AppText
                    variant="bodySm"
                    style={{ color: "#EF4444", marginTop: 4 }}
                  >
                    {errors.age}
                  </AppText>
                )}
              </View>

              {/* Gender */}
              <View style={{ flex: 1 }}>
                <AppText
                  variant="bodySm"
                  style={{ color: "#374151", fontWeight: "600", marginBottom: 8 }}
                >
                  {t("onboarding.gender")} *
                </AppText>
                <View style={{ 
                  borderWidth: errors.gender && touched.gender ? 1 : 0,
                  borderColor: "#EF4444",
                  borderRadius: 12 
                }}>
                  <Select
                    value={personalDetails.gender}
                    onChange={(value) => {
                      handleFieldChange("gender", value);
                    }}
                    options={genderSelectOptions}
                    placeholder={t("onboarding.selectGender")}
                  />
                </View>
                {errors.gender && touched.gender && (
                  <AppText
                    variant="bodySm"
                    style={{ color: "#EF4444", marginTop: 4 }}
                  >
                    {errors.gender}
                  </AppText>
                )}
              </View>
            </View>

            {/* Aadhaar Number */}
            <View style={{ marginBottom: 20 }}>
              <AppText
                variant="bodySm"
                style={{ color: "#374151", fontWeight: "600", marginBottom: 8 }}
              >
                {t("onboarding.aadhaar")}
              </AppText>
              <TextInput
                style={getInputStyle("aadhaar")}
                value={personalDetails.aadhaar}
                onChangeText={(text) => {
                  // Format as XXXX XXXX XXXX
                  const cleaned = text.replace(/\D/g, "").slice(0, 12);
                  const formatted = cleaned.replace(/(\d{4})(?=\d)/g, "$1 ");
                  handleFieldChange("aadhaar", cleaned);
                }}
                onBlur={() => handleFieldBlur("aadhaar")}
                placeholder={t("onboarding.enterAadhaar")}
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                maxLength={14}
              />
              {errors.aadhaar && touched.aadhaar && (
                <AppText
                  variant="bodySm"
                  style={{ color: "#EF4444", marginTop: 4 }}
                >
                  {errors.aadhaar}
                </AppText>
              )}
            </View>

            {/* Father's Name */}
            <View style={{ marginBottom: 20 }}>
              <AppText
                variant="bodySm"
                style={{ color: "#374151", fontWeight: "600", marginBottom: 8 }}
              >
                {t("onboarding.fathersName")} *
              </AppText>
              <TextInput
                style={getInputStyle("fathersName")}
                value={personalDetails.fathersName}
                onChangeText={(text) => handleFieldChange("fathersName", text)}
                onBlur={() => handleFieldBlur("fathersName")}
                placeholder={t("onboarding.enterFathersName")}
                placeholderTextColor="#9CA3AF"
              />
              {errors.fathersName && touched.fathersName && (
                <AppText
                  variant="bodySm"
                  style={{ color: "#EF4444", marginTop: 4 }}
                >
                  {errors.fathersName}
                </AppText>
              )}
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
                style={getInputStyle("mothersName")}
                value={personalDetails.mothersName}
                onChangeText={(text) => handleFieldChange("mothersName", text)}
                onBlur={() => handleFieldBlur("mothersName")}
                placeholder={t("onboarding.enterMothersName")}
                placeholderTextColor="#9CA3AF"
              />
              {errors.mothersName && touched.mothersName && (
                <AppText
                  variant="bodySm"
                  style={{ color: "#EF4444", marginTop: 4 }}
                >
                  {errors.mothersName}
                </AppText>
              )}
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
                style={getInputStyle("village")}
                value={personalDetails.village}
                onChangeText={(text) => handleFieldChange("village", text)}
                onBlur={() => handleFieldBlur("village")}
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
              {districtOptions.length > 0 ? (
                <Select
                  value={personalDetails.district}
                  onChange={(value) => handleFieldChange("district", value)}
                  options={districtOptions}
                  placeholder={t("onboarding.selectDistrict")}
                />
              ) : (
                <TextInput
                  style={getInputStyle("district")}
                  value={personalDetails.district}
                  onChangeText={(text) => handleFieldChange("district", text)}
                  onBlur={() => handleFieldBlur("district")}
                  placeholder={personalDetails.state ? t("onboarding.enterDistrict") : t("onboarding.selectStateFirst")}
                  placeholderTextColor="#9CA3AF"
                  editable={!!personalDetails.state}
                />
              )}
            </View>

            {/* State */}
            <View style={{ marginBottom: 20 }}>
              <AppText
                variant="bodySm"
                style={{ color: "#374151", fontWeight: "600", marginBottom: 8 }}
              >
                {t("onboarding.state")} *
              </AppText>
              <View style={{ borderWidth: errors.state && touched.state ? 1 : 0, borderColor: "#EF4444", borderRadius: 12 }}>
                <Select
                  value={personalDetails.state}
                  onChange={(value) => {
                    handleFieldChange("state", value);
                  }}
                  options={stateOptions}
                  placeholder={t("onboarding.selectState")}
                />
              </View>
              {errors.state && touched.state && (
                <AppText
                  variant="bodySm"
                  style={{ color: "#EF4444", marginTop: 4 }}
                >
                  {errors.state}
                </AppText>
              )}
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
                style={getInputStyle("pinCode")}
                value={personalDetails.pinCode}
                onChangeText={(text) => handleFieldChange("pinCode", text)}
                onBlur={() => handleFieldBlur("pinCode")}
                placeholder={t("onboarding.enterPinCode")}
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                maxLength={6}
              />
              {errors.pinCode && touched.pinCode && (
                <AppText
                  variant="bodySm"
                  style={{ color: "#EF4444", marginTop: 4 }}
                >
                  {errors.pinCode}
                </AppText>
              )}
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
              {t("onboarding.skip")}
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
              {t("onboarding.next")}
            </AppText>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

export default AuthPersonalDetailsScreen;
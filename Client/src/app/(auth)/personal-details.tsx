// src/app/(auth)/personal-details.tsx
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
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
  genderOptions,
  getLocalizedOptions,
} from "../../data/content/onboardingOptions";
import {
  validateName,
} from "../../utils/validation";
import { useAuth } from "../../contexts/AuthContext";
import { userApi } from "../../services/apiService";

export const unstable_settings = {
  headerShown: false,
};

// ─── Reusable field sub-components ───────────────────────────────────────────
// IMPORTANT: These MUST be defined at module level (outside the screen component).
// Defining them inside a render function causes React to treat them as brand-new
// component types on every render, which unmounts/remounts TextInputs on each
// keystroke and breaks typing (only one character registers at a time).

const FieldWrapper = ({ children }: { children: React.ReactNode }) => (
  <View style={{ marginBottom: 20 }}>{children}</View>
);

const FieldLabel = ({ text }: { text: string }) => (
  <AppText variant="bodySm" style={{ color: "#374151", fontWeight: "600", marginBottom: 8 }}>
    {text}
  </AppText>
);

const FieldError = ({ message }: { message?: string }) =>
  message ? (
    <AppText variant="bodySm" style={{ color: "#EF4444", marginTop: 4 }}>
      {message}
    </AppText>
  ) : null;

// ─────────────────────────────────────────────────────────────────────────────

interface FieldErrors {
  name?: string;
  age?: string;
  gender?: string;
  aadhaar?: string;
  fathersName?: string;
  mothersName?: string;
}

const AuthPersonalDetailsScreen = () => {
  const router = useRouter();
  const { t, currentLanguage } = useTranslation();
  const { user } = useAuth();
  const { personalDetails, updatePersonalDetails } = useOnboardingStore();
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const genderSelectOptions = getLocalizedOptions(genderOptions, currentLanguage);

  // ── Resume interrupted onboarding ─────────────────────────────────────────
  // If the user got cut off mid-onboarding (e.g. on the map page), the store
  // may be empty but the DB might already have partial data. Pre-populate the
  // store from the backend so the user doesn't start completely from scratch.
  useEffect(() => {
    const storeIsEmpty =
      !personalDetails.name?.trim() &&
      !personalDetails.age &&
      !personalDetails.gender;

    if (!storeIsEmpty) return; // Store already has data — don't overwrite

    // Try to load any partially-saved profile data from the backend
    userApi.getProfile().then((res) => {
      const profile = res.data?.user;
      if (!profile) return;

      const updates: Record<string, any> = {};
      // Only fill fields that have real data (not placeholder values)
      if (profile.name && profile.name !== 'New User') updates.name = profile.name;
      if (profile.age) updates.age = profile.age;
      if (profile.gender) updates.gender = profile.gender;
      if (profile.fathersName) updates.fathersName = profile.fathersName;
      if (profile.mothersName) updates.mothersName = profile.mothersName;
      if (profile.village) updates.village = profile.village;
      if (profile.district) updates.district = profile.district;
      if (profile.state) updates.state = profile.state;
      if (profile.tehsil) updates.tehsil = profile.tehsil;
      if (profile.block) updates.block = profile.block;
      if (profile.pinCode) updates.pinCode = profile.pinCode;
      if (profile.aadhaarNumber) updates.aadhaar = profile.aadhaarNumber;
      if (profile.educationalQualification) updates.educationalQualification = profile.educationalQualification;

      if (Object.keys(updates).length > 0) {
        updatePersonalDetails(updates);
        console.log('📋 [personal-details] Restored partial onboarding data from backend:', Object.keys(updates));
      }
    }).catch(() => {
      // Non-fatal — user can fill in fields manually
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


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
    setTouched({
      name: true, age: true, gender: true, aadhaar: true,
      fathersName: true, mothersName: true,
    });

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
    if (hasErrors) {
      setErrors(newErrors);
      Alert.alert(
        t("validation.validationError") || "Validation Error",
        Object.values(newErrors)[0] || "Please fill all required fields"
      );
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    router.push("/(auth)/location-picker" as any);
  };

  const handleSkip = () => {
    router.push("/(auth)/land-details");
  };

  const isValid = () => {
    return (
      personalDetails.name?.trim() !== "" &&
      personalDetails.age > 0 &&
      personalDetails.gender !== "" &&
      personalDetails.fathersName?.trim() !== "" &&
      Object.values(errors).every((e) => !e)
    );
  };

  const { height: screenHeight } = Dimensions.get("window");
  const videoHeight = screenHeight * 0.28;

  const player = useVideoPlayer(MediaPath.videos.authBackground, (player) => {
    player.loop = true;
    player.muted = true;
    player.play();
  });

  const inputStyle = (field: keyof FieldErrors) => ({
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: errors[field] && touched[field] ? "#EF4444" : "#E5E7EB",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: "#1F2937",
  });

  return (
    <View className="flex-1 bg-[#F8FAFC]">
      {/* Video Background Header */}
      <View style={{ height: videoHeight, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, overflow: 'hidden' }} className="relative">
        <VideoView
          player={player}
          style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, width: "100%", height: "100%" }}
          contentFit="cover"
          nativeControls={false}
          allowsPictureInPicture={false}
        />
      </View>

      {/* Content Card */}
      <View className="flex-1 bg-white" style={{ borderTopLeftRadius: 24, borderTopRightRadius: 24, marginTop: -24, paddingTop: 24 }}>
        {/* Title Section */}
        <View className="items-center px-5 mb-4">
          <AppText variant="h3" className="font-bold text-gray-800 text-[22px] text-center">
            {t("onboarding.personalTitle")}
          </AppText>
          <AppText variant="bodySm" className="text-gray-500 mt-1.5 text-center">
            {t("onboarding.personalSubtitle")}
          </AppText>
        </View>

        <KeyboardAvoidingView
          behavior="padding"
          style={{ flex: 1 }}
        >
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Full Name */}
            <FieldWrapper>
              <FieldLabel text={`${t("onboarding.fullName")} *`} />
              <TextInput
                style={inputStyle("name")}
                value={personalDetails.name}
                onChangeText={(text) => handleFieldChange("name", text)}
                onBlur={() => handleFieldBlur("name")}
                placeholder={t("onboarding.enterFullName")}
                placeholderTextColor="#9CA3AF"
              />
              <FieldError message={touched.name ? errors.name : undefined} />
            </FieldWrapper>

            {/* Age and Gender Row */}
            <View className="flex-row gap-3 mb-5">
              {/* Age */}
              <View className="flex-1">
                <FieldLabel text={`${t("onboarding.age")} *`} />
                <TextInput
                  style={inputStyle("age")}
                  value={personalDetails.age > 0 ? String(personalDetails.age) : ""}
                  onChangeText={(text) => {
                    const num = parseInt(text) || 0;
                    updatePersonalDetails({ age: num });
                    if (touched.age) validateField("age", text);
                  }}
                  onBlur={() => handleFieldBlur("age")}
                  placeholder={t("onboarding.enterAge")}
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  maxLength={3}
                />
                <FieldError message={touched.age ? errors.age : undefined} />
              </View>

              {/* Gender */}
              <View className="flex-1">
                <FieldLabel text={`${t("onboarding.gender")} *`} />
                <View
                  style={{
                    borderWidth: errors.gender && touched.gender ? 1 : 0,
                    borderColor: "#EF4444",
                    borderRadius: 12,
                  }}
                >
                  <Select
                    value={personalDetails.gender}
                    onChange={(value) => handleFieldChange("gender", value)}
                    options={genderSelectOptions}
                    placeholder={t("onboarding.selectGender")}
                  />
                </View>
                <FieldError message={touched.gender ? errors.gender : undefined} />
              </View>
            </View>

            {/* Aadhaar Number */}
            <FieldWrapper>
              <FieldLabel text={t("onboarding.aadhaar")} />
              <TextInput
                style={inputStyle("aadhaar")}
                value={personalDetails.aadhaar}
                onChangeText={(text) => {
                  const cleaned = text.replace(/\D/g, "").slice(0, 12);
                  handleFieldChange("aadhaar", cleaned);
                }}
                onBlur={() => handleFieldBlur("aadhaar")}
                placeholder={t("onboarding.enterAadhaar")}
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                maxLength={14}
              />
              <FieldError message={touched.aadhaar ? errors.aadhaar : undefined} />
            </FieldWrapper>

            {/* Father's Name */}
            <FieldWrapper>
              <FieldLabel text={`${t("onboarding.fathersName")} *`} />
              <TextInput
                style={inputStyle("fathersName")}
                value={personalDetails.fathersName}
                onChangeText={(text) => handleFieldChange("fathersName", text)}
                onBlur={() => handleFieldBlur("fathersName")}
                placeholder={t("onboarding.enterFathersName")}
                placeholderTextColor="#9CA3AF"
              />
              <FieldError message={touched.fathersName ? errors.fathersName : undefined} />
            </FieldWrapper>

            {/* Mother's Name */}
            <FieldWrapper>
              <FieldLabel text={t("onboarding.mothersName")} />
              <TextInput
                style={inputStyle("mothersName")}
                value={personalDetails.mothersName}
                onChangeText={(text) => handleFieldChange("mothersName", text)}
                onBlur={() => handleFieldBlur("mothersName")}
                placeholder={t("onboarding.enterMothersName")}
                placeholderTextColor="#9CA3AF"
              />
              <FieldError message={touched.mothersName ? errors.mothersName : undefined} />
            </FieldWrapper>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Bottom Buttons */}
        <View className="p-5 bg-white border-t border-gray-200 flex-row gap-3">
          <Pressable
            onPress={handleSkip}
            className="flex-1 py-4 rounded-full bg-white border border-gray-300 items-center active:bg-gray-100"
          >
            <AppText variant="bodyMd" className="text-gray-500 font-semibold">
              {t("onboarding.skip")}
            </AppText>
          </Pressable>

          <Pressable
            onPress={handleNext}
            disabled={!isValid()}
            className="flex-[2] py-4 rounded-full items-center"
            style={{ backgroundColor: isValid() ? "#386641" : "#D1D5DB" }}
          >
            <AppText variant="bodyMd" className="text-white font-bold">
              {t("onboarding.next")}
            </AppText>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

export default AuthPersonalDetailsScreen;
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
    setTouched({
      name: true, age: true, gender: true, aadhaar: true,
      fathersName: true, mothersName: true, village: true,
      district: true, state: true, pinCode: true,
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
      personalDetails.state !== "" &&
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

  // Reusable field wrapper
  const FieldWrapper = ({ children }: { children: React.ReactNode }) => (
    <View className="mb-5">{children}</View>
  );

  const FieldLabel = ({ text }: { text: string }) => (
    <AppText variant="bodySm" className="text-gray-700 font-semibold mb-2">
      {text}
    </AppText>
  );

  const FieldError = ({ message }: { message?: string }) =>
    message ? (
      <AppText variant="bodySm" className="text-red-500 mt-1">
        {message}
      </AppText>
    ) : null;

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
        {/* Progress Bar — 25% complete */}
        <View
          className="absolute left-5 right-5 h-1.5 rounded-full bg-white/30"
          style={{ top: 50 }}
        >
          <View className="h-full bg-amber-400 rounded-full" style={{ width: "25%" }} />
        </View>
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
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
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

            {/* Village */}
            <FieldWrapper>
              <FieldLabel text={t("onboarding.village")} />
              <TextInput
                style={inputStyle("village")}
                value={personalDetails.village}
                onChangeText={(text) => handleFieldChange("village", text)}
                onBlur={() => handleFieldBlur("village")}
                placeholder={t("onboarding.enterVillage")}
                placeholderTextColor="#9CA3AF"
              />
            </FieldWrapper>

            {/* State */}
            <FieldWrapper>
              <FieldLabel text={`${t("onboarding.state")} *`} />
              <View
                style={{
                  borderWidth: errors.state && touched.state ? 1 : 0,
                  borderColor: "#EF4444",
                  borderRadius: 12,
                }}
              >
                <Select
                  value={personalDetails.state}
                  onChange={(value) => handleFieldChange("state", value)}
                  options={stateOptions}
                  placeholder={t("onboarding.selectState")}
                />
              </View>
              <FieldError message={touched.state ? errors.state : undefined} />
            </FieldWrapper>

            {/* District */}
            <FieldWrapper>
              <FieldLabel text={t("onboarding.district")} />
              {districtOptions.length > 0 ? (
                <Select
                  value={personalDetails.district}
                  onChange={(value) => handleFieldChange("district", value)}
                  options={districtOptions}
                  placeholder={t("onboarding.selectDistrict")}
                />
              ) : (
                <TextInput
                  style={inputStyle("district")}
                  value={personalDetails.district}
                  onChangeText={(text) => handleFieldChange("district", text)}
                  onBlur={() => handleFieldBlur("district")}
                  placeholder={
                    personalDetails.state
                      ? t("onboarding.enterDistrict")
                      : t("onboarding.selectStateFirst")
                  }
                  placeholderTextColor="#9CA3AF"
                  editable={!!personalDetails.state}
                />
              )}
            </FieldWrapper>

            {/* Pin Code */}
            <KeyboardAvoidingView>
              <FieldLabel text={t("onboarding.pinCode")} />
              <TextInput
                style={inputStyle("pinCode")}
                value={personalDetails.pinCode}
                onChangeText={(text) => handleFieldChange("pinCode", text)}
                onBlur={() => handleFieldBlur("pinCode")}
                placeholder={t("onboarding.enterPinCode")}
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                maxLength={6}
              />
              <FieldError message={touched.pinCode ? errors.pinCode : undefined} />
            </KeyboardAvoidingView>
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
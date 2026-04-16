// src/app/(auth)/personal-details.tsx
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  StatusBar,
  StyleSheet,
  View,
  TextInput,
} from "react-native";
import KeyboardAwareScrollView from "../../components/atoms/KeyboardAwareScrollView";
import AppText from "../../components/atoms/AppText";
import Avatar from "../../components/atoms/Avatar";
import Select from "../../components/atoms/Select";
import TextArea from "../../components/atoms/TextArea";
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
import { userApi, uploadApi } from "../../services/apiService";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { theme } from "../../styles/colors";
import { indianStates, indianDistricts } from "../../data/indianLocations";

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
  <AppText variant="bodySm" style={{ color: theme.text.subtle, fontWeight: "600", marginBottom: 8 }}>
    {text}
  </AppText>
);

const FieldError = ({ message }: { message?: string }) =>
  message ? (
    <AppText variant="bodySm" style={{ color: theme.semantic.errorLight, marginTop: 4 }}>
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
  const { personalDetails, updatePersonalDetails, setOnboardingStep, onboardingStep } = useOnboardingStore();
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [genderOtherText, setGenderOtherText] = useState("");

  // ── Photo upload state (same pattern as profile.tsx) ────────────────────────
  const [photoUploading, setPhotoUploading] = useState(false);
  const [localPhotoUri, setLocalPhotoUri] = useState<string | null>(null);

  const launchCamera = async () => {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.75,
    });
    if (result.canceled || !result.assets?.[0]) return;
    await processPhoto(result.assets[0].uri);
  };

  const launchGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.75,
    });
    if (result.canceled || !result.assets?.[0]) return;
    await processPhoto(result.assets[0].uri);
  };

  const handlePhotoUpload = async () => {
    Alert.alert("Choose Photo", "", [
      { text: "Camera", onPress: launchCamera },
      { text: "Gallery", onPress: launchGallery },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const processPhoto = async (uri: string) => {
    setLocalPhotoUri(uri);
    setPhotoUploading(true);
    try {
      const cloudUrl = await uploadApi.uploadUserPhoto(uri);
      updatePersonalDetails({ photoUrl: cloudUrl });
    } catch (e: any) {
      Alert.alert("Upload Failed", e.message || "Could not upload photo. Please try again.");
      setLocalPhotoUri(null);
      updatePersonalDetails({ photoUrl: "" });
    } finally {
      setPhotoUploading(false);
    }
  };

  const genderSelectOptions = getLocalizedOptions(genderOptions, currentLanguage);

  // ── Resume interrupted onboarding ─────────────────────────────────────────
  // If the user got cut off mid-onboarding (e.g. on the map page), the store
  // may be empty but the DB might already have partial data. Pre-populate the
  // store from the backend so the user doesn't start completely from scratch.
  useEffect(() => {
    // If onboardingStep >= 1, the user already completed personal-details and
    // was on the location-picker (or later). Redirect them there directly.
    if (onboardingStep >= 1) {
      router.replace("/(auth)/location-picker" as any);
      return;
    }

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
    setOnboardingStep(1);
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

  const inputStyle = (field: keyof FieldErrors) => ({
    backgroundColor: theme.background.neutralSubtle,
    borderWidth: 1,
    borderColor: errors[field] && touched[field] ? theme.semantic.errorLight : theme.border.subtle,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: theme.text.secondary,
  });

  return (
    <View style={{ flex: 1, backgroundColor: theme.background.input }}>
      <StatusBar barStyle="light-content" backgroundColor={theme.primary.green} />
      {/* Static Header */}
      <View style={headerStyles.header}>
        {/* Progress bar at 25% (step 1 of 4) */}
        <View style={headerStyles.progressTrack}>
          <View style={[headerStyles.progressFill, { width: "25%" }]} />
        </View>
        <AppText variant="h2" style={headerStyles.headerTitle}>
          {t("onboarding.personalTitle") || "Personal Details"}
        </AppText>
        <AppText variant="bodySm" style={headerStyles.headerSubtitle}>
          {t("onboarding.personalSubtitle") || "Tell us a bit about yourself"}
        </AppText>
      </View>

      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Mandatory Photo Upload (same pattern as profile.tsx) ── */}
        <View style={photoStyles.container}>
          <Pressable
            onPress={handlePhotoUpload}
            style={photoStyles.avatarRing}
            disabled={photoUploading}
            accessibilityLabel="Upload profile photo"
            accessibilityRole="button"
          >
            {(localPhotoUri || personalDetails.photoUrl) ? (
              <Image
                source={{ uri: localPhotoUri ?? personalDetails.photoUrl }}
                style={{ width: 86, height: 86, borderRadius: 43 }}
                resizeMode="cover"
              />
            ) : (
              <Avatar name={personalDetails.name || "?"} size="3xl" shape="circle" bgColor={theme.primary.green} />
            )}
            {/* Camera badge */}
            {!photoUploading && (
              <View style={photoStyles.cameraBadge}>
                <Ionicons name="camera" size={13} color={theme.text.onPrimary} />
              </View>
            )}
            {/* Upload spinner overlay */}
            {photoUploading && (
              <View style={photoStyles.loadingOverlay}>
                <ActivityIndicator size="small" color={theme.text.onPrimary} />
              </View>
            )}
          </Pressable>
          <AppText variant="bodySm" style={{ color: personalDetails.photoUrl ? theme.semantic.successText : theme.text.muted, marginTop: 8, fontWeight: "600" }}>
            {personalDetails.photoUrl ? "✓ Photo uploaded" : "Tap to add profile photo *"}
          </AppText>
        </View>
          <View style={{ paddingHorizontal: 20 }}>
            {/* Full Name */}
            <FieldWrapper>
              <FieldLabel text={`${t("onboarding.fullName")} *`} />
              <TextInput
                style={inputStyle("name")}
                value={personalDetails.name}
                onChangeText={(text) => handleFieldChange("name", text)}
                onBlur={() => handleFieldBlur("name")}
                placeholder={t("onboarding.enterFullName")}
                placeholderTextColor={theme.text.placeholder}
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
                  placeholderTextColor={theme.text.placeholder}
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
                    borderColor: errors.gender && touched.gender ? theme.semantic.errorLight : "transparent",
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
                {personalDetails.gender === "other" && (
                  <TextArea
                    value={genderOtherText}
                    onChangeText={setGenderOtherText}
                    placeholder={t("onboarding.specifyOther") || "Please specify…"}
                    numberOfLines={3}
                    style={{ marginTop: 8 }}
                  />
                )}
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
                placeholderTextColor={theme.text.placeholder}
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
                placeholderTextColor={theme.text.placeholder}
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
                placeholderTextColor={theme.text.placeholder}
              />
              <FieldError message={touched.mothersName ? errors.mothersName : undefined} />
            </FieldWrapper>

            {/* ── Address Section ─────────────────────────────────────── */}
            <View style={{ marginBottom: 8 }}>
              <AppText variant="bodySm" style={{ color: theme.text.subtle, fontWeight: "700", marginBottom: 4, fontSize: 13, textTransform: "uppercase", letterSpacing: 0.5 }}>
                {t("onboarding.address") || "Address"}
              </AppText>
              {/* Optional "Use my location" helper */}
              <Pressable
                onPress={() => router.push("/(auth)/location-picker" as any)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  backgroundColor: theme.background.neutralSubtle,
                  borderWidth: 1,
                  borderColor: theme.border.subtle,
                  borderRadius: 10,
                  marginBottom: 16,
                  alignSelf: "flex-start",
                }}
                accessibilityLabel="Use my location to pre-fill address"
                accessibilityRole="button"
              >
                <Ionicons name="locate-outline" size={15} color={theme.primary.green} />
                <AppText variant="bodySm" style={{ color: theme.primary.green, fontWeight: "600" }}>
                  {t("onboarding.useMyLocation") || "Use my location"}
                </AppText>
              </Pressable>
            </View>

            {/* State */}
            <FieldWrapper>
              <FieldLabel text={t("onboarding.state") || "State"} />
              <Select
                value={personalDetails.state}
                onChange={(value) => {
                  // Clear district when state changes
                  updatePersonalDetails({ state: value, district: "" });
                }}
                options={indianStates.map((s) => ({ label: s.label, value: s.value }))}
                placeholder={t("onboarding.selectState") || "Select state"}
              />
            </FieldWrapper>

            {/* District */}
            <FieldWrapper>
              <FieldLabel text={t("onboarding.district") || "District"} />
              <Select
                value={personalDetails.district}
                onChange={(value) => updatePersonalDetails({ district: value })}
                options={indianDistricts
                  .filter((d) => !personalDetails.state || d.stateValue === personalDetails.state)
                  .map((d) => ({ label: d.label, value: d.value }))}
                placeholder={t("onboarding.selectDistrict") || "Select district"}
                disabled={!personalDetails.state}
              />
            </FieldWrapper>

            {/* Block / Tehsil */}
            <FieldWrapper>
              <FieldLabel text={t("onboarding.block") || "Block / Tehsil"} />
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
                value={personalDetails.block || personalDetails.tehsil || ""}
                onChangeText={(text) => updatePersonalDetails({ block: text, tehsil: text })}
                placeholder={t("onboarding.enterBlock") || "Enter block / tehsil"}
                placeholderTextColor={theme.text.placeholder}
              />
            </FieldWrapper>

            {/* Village */}
            <FieldWrapper>
              <FieldLabel text={t("onboarding.village") || "Village"} />
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
                value={personalDetails.village || ""}
                onChangeText={(text) => updatePersonalDetails({ village: text })}
                placeholder={t("onboarding.enterVillage") || "Enter village"}
                placeholderTextColor={theme.text.placeholder}
              />
            </FieldWrapper>

            {/* PIN Code */}
            <FieldWrapper>
              <FieldLabel text={t("onboarding.pinCode") || "PIN Code"} />
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
                value={personalDetails.pinCode || ""}
                onChangeText={(text) => {
                  const cleaned = text.replace(/\D/g, "").slice(0, 6);
                  updatePersonalDetails({ pinCode: cleaned });
                }}
                placeholder={t("onboarding.enterPinCode") || "Enter 6-digit PIN code"}
                placeholderTextColor={theme.text.placeholder}
                keyboardType="numeric"
                maxLength={6}
              />
            </FieldWrapper>

            {/* Post Office */}
            <FieldWrapper>
              <FieldLabel text={t("onboarding.postOffice") || "Post Office"} />
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
                value={personalDetails.postOffice || ""}
                onChangeText={(text) => updatePersonalDetails({ postOffice: text })}
                placeholder={t("onboarding.enterPostOffice") || "Enter post office"}
                placeholderTextColor={theme.text.placeholder}
              />
            </FieldWrapper>
          </View>

          {/* Bottom Buttons */}
          <View style={{ padding: 20, backgroundColor: theme.background.input, borderTopWidth: 1, borderTopColor: theme.border.subtle, flexDirection: "row", gap: 12 }}>
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
              style={{ backgroundColor: isValid() ? theme.primary.green : theme.border.card }}
            >
              <AppText variant="bodyMd" className="text-white font-bold">
                {t("onboarding.next")}
              </AppText>
            </Pressable>
          </View>
      </KeyboardAwareScrollView>
    </View>
  );
};

export default AuthPersonalDetailsScreen;

// ─── Photo upload styles (mirrors profile.tsx avatar styles exactly) ──────────
const photoStyles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: 12,
    marginBottom: 4,
  },
  avatarRing: {
    width: 92,
    height: 92,
    borderRadius: 46,
    borderWidth: 3,
    borderColor: theme.primary.green,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    overflow: "hidden",
  },
  cameraBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: theme.primary.green,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: theme.background.input,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 46,
  },
});

// ─── Header styles ────────────────────────────────────────────────────────────
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
    color: "#fff",
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

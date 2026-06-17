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
  Modal,
} from "react-native";
import KeyboardAwareScrollView from "../../components/atoms/KeyboardAwareScrollView";
import AppText from "../../components/atoms/AppText";
import Avatar from "../../components/atoms/Avatar";
import Select from "../../components/atoms/Select";
import { useOnboardingStore } from "../../stores/onboardingStore";
import { useTranslation } from "../../i18n";
import {
  genderOptions,
  getLocalizedOptions,
} from "../../data/content/onboardingOptions";
import { getStateOptions, getDistrictOptions } from "../../data/indianLocations";
import {
  validateName,
} from "../../utils/validation";
import { translateKnownError } from "../../utils/translatedErrors";
import { useAuth } from "../../contexts/AuthContext";
import { userApi, uploadApi } from "../../services/apiService";
import { Ionicons } from "@expo/vector-icons";
import ExpoLinking from "expo-linking";
import * as ImagePicker from "expo-image-picker";
import { theme } from "../../styles/colors";

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
  district?: string;
  tehsil?: string;
  block?: string;
  village?: string;
  pinCode?: string;
  postOffice?: string;
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
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  const handlePhotoUpload = () => {
    setShowAvatarModal(true);
  };

  const launchCamera = async () => {
    setShowAvatarModal(false);
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        t("profile.permissionNeeded"),
        t("profile.cameraPermissionMessage"),
        [
          { text: t("common.cancel"), style: "cancel" },
          { text: t("common.openSettings"), onPress: () => ExpoLinking.openSettings() },
        ]
      );
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.75,
      });
      if (result.canceled || !result.assets?.[0]) return;
      await processPhoto(result.assets[0].uri);
    } catch {
      Alert.alert(t("profile.cameraError"), t("profile.cameraErrorMessage"));
    }
  };

  const launchGallery = async () => {
    setShowAvatarModal(false);
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        t("profile.permissionNeeded"),
        t("profile.galleryPermissionMessage"),
        [
          { text: t("common.cancel"), style: "cancel" },
          { text: t("common.openSettings"), onPress: () => ExpoLinking.openSettings() },
        ]
      );
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.75,
      });
      if (result.canceled || !result.assets?.[0]) return;
      await processPhoto(result.assets[0].uri);
    } catch {
      Alert.alert(t("profile.galleryError"), t("profile.galleryErrorMessage"));
    }
  };

  // const processPhoto = async (uri: string) => {
  //   setLocalPhotoUri(uri);
  //   setPhotoUploading(true);
  //   try {
  //     const cloudUrl = await uploadApi.uploadUserPhoto(uri);
  //     updatePersonalDetails({ photoUrl: cloudUrl });
  //   } catch (e: any) {
  //     Alert.alert("Upload Failed", e.message || "Could not upload photo. Please try again.");
  //     setLocalPhotoUri(null);
  //     updatePersonalDetails({ photoUrl: "" });
  //   } finally {
  //     setPhotoUploading(false);
  //   }
  // };
  const processPhoto = async (uri: string) => {
    // 1. Instant preview
    setLocalPhotoUri(uri);
    setPhotoUploading(true);

    try {
      // 2. Upload to cloud
      const cloudUrl = await uploadApi.uploadUserPhoto(uri);

      // 3. 🔥 Persist to backend immediately (CRITICAL FIX)
      await userApi.updateProfile({ photo_url: cloudUrl });

      // 4. Update onboarding store
      updatePersonalDetails({ photoUrl: cloudUrl });

      // 5. Clear local preview → use server image
      setLocalPhotoUri(null);
    } catch (e: any) {
      Alert.alert(
        t("profile.uploadFailed"),
        e.message || t("profile.uploadFailedMessage")
      );

      // rollback
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

  const [pinCodeLoading, setPinCodeLoading] = useState(false);
  const [postOfficeOptions, setPostOfficeOptions] = useState<{ label: string; value: string }[]>([]);
  const [blockOptions, setBlockOptions] = useState<{ label: string; value: string }[]>([]);

  const matchPinToSlug = (stateName: string): string => {
    const normalized = stateName.trim().toLowerCase().replace(/[\s-]+/g, "_");
    const all = getStateOptions("en");
    const found = all.find(s =>
      s.value === normalized ||
      s.label.toLowerCase().replace(/[\s-]+/g, "_") === normalized
    );
    return found?.value || normalized;
  };

  const matchDistrictSlug = (stateValue: string, districtName: string): string => {
    const normalized = districtName.trim().toLowerCase().replace(/[\s-]+/g, "_");
    const districts = getDistrictOptions(stateValue, "en");
    const found = districts.find(d =>
      d.value === normalized ||
      d.label.toLowerCase().replace(/[\s-]+/g, "_") === normalized
    );
    return found?.value || normalized;
  };

  const handlePinCodeChange = async (pin: string) => {
    updatePersonalDetails({ pinCode: pin });
    if (pin.length === 6) {
      setPinCodeLoading(true);
      setPostOfficeOptions([]);
      setBlockOptions([]);
      try {
        const response = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
        const data = await response.json();
        if (data && data[0] && data[0].Status === "Success") {
          const postOffices = data[0].PostOffice;
          const poOptions = postOffices.map((po: any) => ({ label: po.Name, value: po.Name }));
          setPostOfficeOptions(poOptions);

          const blocks = Array.from(new Set(postOffices.map((po: any) => po.Block))) as string[];
          setBlockOptions(blocks.map(b => ({ label: b, value: b })));

          const firstPO = postOffices[0];
          const matchedState = matchPinToSlug(firstPO.State);
          const matchedDistrict = matchDistrictSlug(matchedState, firstPO.District);

          updatePersonalDetails({
            state: matchedState || personalDetails.state,
            district: blocks.length > 0 && matchedDistrict ? matchedDistrict : personalDetails.district,
            block: blocks.length === 1 ? blocks[0] : personalDetails.block,
            postOffice: poOptions.length === 1 ? poOptions[0].value : personalDetails.postOffice,
          });
        } else {
          setPostOfficeOptions([]);
          setBlockOptions([]);
        }
      } catch (e) {
        console.error("Error fetching PIN code:", e);
      } finally {
        setPinCodeLoading(false);
      }
    } else {
      setPostOfficeOptions([]);
      setBlockOptions([]);
    }
  };


  const validateField = (field: keyof FieldErrors, value: string) => {
    let error: string | undefined;

    switch (field) {
      case "name":
        if (!value.trim()) {
          error = t("validation.nameRequired") || "Name is required";
        } else {
          const nameValidation = validateName(value, "Name");
          error = translateKnownError(nameValidation.errors[0], t) || nameValidation.errors[0];
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
          error = translateKnownError(nameValidation.errors[0], t) || nameValidation.errors[0];
        }
        break;
      case "mothersName":
        if (value.trim()) {
          const nameValidation = validateName(value, "Mother's name");
          error = translateKnownError(nameValidation.errors[0], t) || nameValidation.errors[0];
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
        Object.values(newErrors)[0] || t("validation.requiredFields")
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
      !!personalDetails.photoUrl &&
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
            accessibilityLabel={t("profile.uploadPhotoAccessibility")}
            accessibilityRole="button"
          >
            <Avatar
              uri={localPhotoUri || personalDetails.photoUrl || undefined}
              name={personalDetails.name || t("common.user")}
              size="xl"
              shape="circle"
            />
            {/* Camera badge */}
            {!photoUploading && (
              <View style={photoStyles.cameraBadge}>
                <Ionicons name="camera" size={13} color={theme.text.onPrimary} />
              </View>
            )}
          </Pressable>
          <AppText variant="bodySm" style={{ color: personalDetails.photoUrl ? theme.semantic.successText : theme.semantic.errorLight, marginTop: 10, fontWeight: "700" }}>
            {personalDetails.photoUrl ? t("profile.photoAdded") : t("profile.photoRequired")}
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

          {/* Manual Address Dropdowns */}
          <View style={{ marginBottom: 16 }}>
            <AppText variant="h3" style={{ color: theme.text.primary, marginBottom: 16, fontSize: 18, fontWeight: "700" }}>
              {t("onboarding.locationDetails") || "Location Details"}
            </AppText>

            {/* Step 1: State */}
            <FieldWrapper>
              <FieldLabel text={t("onboarding.state") || "State"} />
              <Select
                options={getStateOptions(currentLanguage)}
                value={personalDetails.state}
                onChange={(val) => updatePersonalDetails({ state: val, district: "", block: "" })}
                placeholder={t("onboarding.selectState") || "Select State"}
              />
            </FieldWrapper>

            {/* Step 2: District (always a dropdown, filtered by state) */}
            <FieldWrapper>
              <FieldLabel text={t("onboarding.district") || "District"} />
              <Select
                options={getDistrictOptions(personalDetails.state, currentLanguage)}
                value={personalDetails.district}
                onChange={(val) => updatePersonalDetails({ district: val })}
                placeholder={t("onboarding.selectDistrict") || "Select District"}
                disabled={!personalDetails.state}
              />
            </FieldWrapper>

            {/* Step 3: Block / Tehsil (dropdown from PIN or free-text) */}
            <FieldWrapper>
              <FieldLabel text={t("onboarding.block") || "Tehsil / Block"} />
              {blockOptions.length > 0 ? (
                <Select
                  options={blockOptions}
                  value={personalDetails.block}
                  onChange={(val) => updatePersonalDetails({ block: val })}
                  placeholder={t("onboarding.selectBlock") || "Select Block"}
                />
              ) : (
                <TextInput
                  style={inputStyle("block" as any)}
                  value={personalDetails.block}
                  onChangeText={(text) => handleFieldChange("block" as any, text)}
                  placeholder={t("onboarding.enterBlock") || "Enter Tehsil/Block"}
                  placeholderTextColor={theme.text.placeholder}
                />
              )}
            </FieldWrapper>

            {/* Step 4: Village (free-text — no comprehensive India-wide data) */}
            <FieldWrapper>
              <FieldLabel text={t("onboarding.village") || "Village / Gram Panchayat"} />
              <TextInput
                style={inputStyle("village" as any)}
                value={personalDetails.village}
                onChangeText={(text) => handleFieldChange("village" as any, text)}
                placeholder={t("onboarding.enterVillage") || "Enter Village or Gram Panchayat"}
                placeholderTextColor={theme.text.placeholder}
              />
            </FieldWrapper>

            {/* PIN Code → auto-populates Post Office + Block options */}
            <FieldWrapper>
              <FieldLabel text={t("onboarding.pinCode") || "PIN Code"} />
              <View style={{ position: "relative" }}>
                <TextInput
                  style={inputStyle("pinCode")}
                  value={personalDetails.pinCode}
                  onChangeText={handlePinCodeChange}
                  keyboardType="number-pad"
                  maxLength={6}
                  placeholder={t("onboarding.enterPinCode") || "Enter 6-digit PIN"}
                  placeholderTextColor={theme.text.placeholder}
                />
                {pinCodeLoading && (
                  <ActivityIndicator style={{ position: "absolute", right: 16, top: 16 }} size="small" color={theme.primary.green} />
                )}
              </View>
            </FieldWrapper>

            {/* Post Office (dropdown from PIN or free-text) */}
            <FieldWrapper>
              <FieldLabel text={t("onboarding.postOffice") || "Post Office"} />
              {postOfficeOptions.length > 0 ? (
                <Select
                  options={postOfficeOptions}
                  value={personalDetails.postOffice}
                  onChange={(val) => updatePersonalDetails({ postOffice: val })}
                  placeholder={t("onboarding.selectPostOffice") || "Select Post Office"}
                />
              ) : (
                <TextInput
                  style={inputStyle("postOffice")}
                  value={personalDetails.postOffice}
                  onChangeText={(text) => handleFieldChange("postOffice" as any, text)}
                  placeholder={t("onboarding.enterPostOffice") || "Enter Post Office"}
                  placeholderTextColor={theme.text.placeholder}
                />
              )}
            </FieldWrapper>
          </View>
        </View>
      </KeyboardAwareScrollView>

      {/* Bottom Buttons */}
      <View style={{ padding: 20, backgroundColor: theme.background.input, borderTopWidth: 1, borderTopColor: theme.border.subtle, flexDirection: "row", gap: 12 }}>
        {/* <Pressable
            onPress={handleSkip}
            className="flex-1 py-4 rounded-full bg-white border border-gray-300 items-center active:bg-gray-100"
          >
            <AppText variant="bodyMd" className="text-gray-500 font-semibold">
              {t("onboarding.skip")}
            </AppText>
          </Pressable> */}

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

      {/* ── Avatar Choice Modal ── */}
      <Modal visible={showAvatarModal} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center", paddingHorizontal: 24 }}>
          <View style={{ width: "100%", backgroundColor: theme.background.input, borderRadius: 16, padding: 24, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 }}>
            <AppText variant="h2" style={{ color: theme.text.primary, fontSize: 18, fontWeight: "700", marginBottom: 16, textAlign: "center" }}>
              {t("profile.updatePhotoTitle")}
            </AppText>

            <Pressable onPress={launchCamera} style={{ flexDirection: "row", alignItems: "center", paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: theme.border.subtle }}>
              <Ionicons name="camera-outline" size={22} color={theme.primary.green} />
              <AppText variant="bodyMd" style={{ marginLeft: 12, color: theme.text.secondary, fontWeight: "600" }}>{t("profile.takePhoto")}</AppText>
            </Pressable>

            <Pressable onPress={launchGallery} style={{ flexDirection: "row", alignItems: "center", paddingVertical: 14 }}>
              <Ionicons name="images-outline" size={22} color={theme.primary.green} />
              <AppText variant="bodyMd" style={{ marginLeft: 12, color: theme.text.secondary, fontWeight: "600" }}>{t("profile.chooseFromGallery")}</AppText>
            </Pressable>

            <Pressable onPress={() => setShowAvatarModal(false)} style={{ marginTop: 24, paddingVertical: 12, backgroundColor: theme.background.neutralSubtle, borderRadius: 12, alignItems: "center" }}>
              <AppText variant="bodySm" style={{ color: theme.text.muted, fontWeight: "700" }}>{t("common.cancel")}</AppText>
            </Pressable>
          </View>
        </View>
      </Modal>

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
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: theme.primary.green,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    // NO overflow:hidden — that clips the camera badge
  },
  avatarClip: {
    width: 88,
    height: 88,
    borderRadius: 44,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  cameraBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: theme.primary.green,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: theme.background.input,
    zIndex: 10,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 44,
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

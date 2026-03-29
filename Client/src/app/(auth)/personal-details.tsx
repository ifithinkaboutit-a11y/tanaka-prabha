// src/app/(auth)/personal-details.tsx
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
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
import AddressDropdowns, { type AddressValue } from "../../components/molecules/AddressDropdowns";
import { useOnboardingStore } from "../../stores/onboardingStore";
import { useTranslation } from "../../i18n";
import {
  genderOptions,
  getLocalizedOptions,
} from "../../data/content/onboardingOptions";
import {
  validateName,
} from "../../utils/validation";
import { getDistrictOptions } from "../../data/indianLocations";
import { useAuth } from "../../contexts/AuthContext";
import { userApi, uploadApi } from "../../services/apiService";
import { Ionicons } from "@expo/vector-icons";

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
  const { personalDetails, updatePersonalDetails, setOnboardingStep, onboardingStep } = useOnboardingStore();
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // ── Photo upload state (same pattern as profile.tsx) ────────────────────────
  const [photoUploading, setPhotoUploading] = useState(false);
  const [localPhotoUri, setLocalPhotoUri] = useState<string | null>(null);

  const handlePhotoUpload = async () => {
    // 1. Request camera permission first
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Camera Required",
        "Please allow camera access to take your profile photo.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Open Settings", onPress: () => Linking.openSettings() },
        ]
      );
      return;
    }

    // 2. Try to launch camera
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.75,
      });
      if (result.canceled || !result.assets?.[0]) return;
      await processPhoto(result.assets[0].uri);
    } catch {
      // 3. No-camera device fallback — show alert then open library
      Alert.alert(
        "No Camera Found",
        "A live photo is preferred. Opening your photo library instead.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Open Library",
            onPress: async () => {
              const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ["images"],
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.75,
              });
              if (result.canceled || !result.assets?.[0]) return;
              await processPhoto(result.assets[0].uri);
            },
          },
        ]
      );
    }
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

    // Photo is mandatory
    if (!personalDetails.photoUrl) {
      Alert.alert("Photo Required", "Please upload a profile photo to continue.");
      return;
    }

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
      !!personalDetails.photoUrl &&        // photo is mandatory
      personalDetails.name?.trim() !== "" &&
      personalDetails.age > 0 &&
      personalDetails.gender !== "" &&
      personalDetails.fathersName?.trim() !== "" &&
      Object.values(errors).every((e) => !e)
    );
  };

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
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <StatusBar barStyle="light-content" backgroundColor="#386641" />
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
              <Avatar name={personalDetails.name || "?"} size="3xl" shape="circle" bgColor="#386641" />
            )}
            {/* Camera badge */}
            {!photoUploading && (
              <View style={photoStyles.cameraBadge}>
                <Ionicons name="camera" size={13} color="#FFFFFF" />
              </View>
            )}
            {/* Upload spinner overlay */}
            {photoUploading && (
              <View style={photoStyles.loadingOverlay}>
                <ActivityIndicator size="small" color="#FFFFFF" />
              </View>
            )}
          </Pressable>
          <AppText variant="bodySm" style={{ color: personalDetails.photoUrl ? "#059669" : "#6B7280", marginTop: 8, fontWeight: "600" }}>
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

            {/* District */}
            <FieldWrapper>
              <FieldLabel text={t("onboarding.district") || "District"} />
              <Select
                value={personalDetails.district}
                onChange={(v) =>
                  updatePersonalDetails({
                    district: v,
                    tehsil: "",
                    nyayPanchayat: "",
                    gramPanchayat: "",
                    village: "",
                  })
                }
                options={getDistrictOptions(personalDetails.state || "uttar_pradesh")}
                placeholder="Select District"
              />
            </FieldWrapper>

            {/* Address sub-fields — cascading dropdowns for Bhadohi/Mirzapur, free-text otherwise */}
            {personalDetails.district &&
              (personalDetails.district.toLowerCase() === "bhadohi" ||
                personalDetails.district.toLowerCase() === "mirzapur") ? (
              <AddressDropdowns
                district={personalDetails.district}
                value={{
                  tehsil: personalDetails.tehsil || "",
                  nyayPanchayat: personalDetails.nyayPanchayat || "",
                  gramPanchayat: personalDetails.gramPanchayat || "",
                  village: personalDetails.village || "",
                }}
                onChange={(v: AddressValue) =>
                  updatePersonalDetails({
                    tehsil: v.tehsil,
                    nyayPanchayat: v.nyayPanchayat,
                    gramPanchayat: v.gramPanchayat,
                    village: v.village,
                  })
                }
                language={currentLanguage as "en" | "hi"}
              />
            ) : personalDetails.district ? (
              <>
                <FieldWrapper>
                  <FieldLabel text={t("onboarding.tehsil") || "Tehsil"} />
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
                    value={personalDetails.tehsil}
                    onChangeText={(text) => updatePersonalDetails({ tehsil: text })}
                    placeholder="Enter Tehsil"
                    placeholderTextColor="#9CA3AF"
                  />
                </FieldWrapper>
                <FieldWrapper>
                  <FieldLabel text={t("onboarding.village") || "Village"} />
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
                    onChangeText={(text) => updatePersonalDetails({ village: text })}
                    placeholder="Enter Village"
                    placeholderTextColor="#9CA3AF"
                  />
                </FieldWrapper>
              </>
            ) : null}
          </View>
      </KeyboardAwareScrollView>

        {/* Bottom Buttons */}
        <View style={{ padding: 20, backgroundColor: "#fff", borderTopWidth: 1, borderTopColor: "#E5E7EB", flexDirection: "row", gap: 12 }}>
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
    borderColor: "#386641",
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
    backgroundColor: "#386641",
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
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
    backgroundColor: "#386641",
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
    backgroundColor: "#FFFFFF",
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

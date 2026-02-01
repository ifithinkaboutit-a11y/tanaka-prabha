// src/app/(tab)/profile.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";
import AppText from "../../components/atoms/AppText";
import Avatar from "../../components/atoms/Avatar";
import Button from "../../components/atoms/Button";
import { defaultProfile } from "../../data/content/profile";
import { UserProfile } from "../../data/interfaces";
import { useTranslation } from "../../i18n";

const Profile = () => {
  const router = useRouter();
  const { t } = useTranslation();

  const [profile] = useState<UserProfile>(defaultProfile);

  const maskAadhaar = (aadhaar: string) =>
    aadhaar.replace(/(\d{4})(\d{4})(\d{4})/, "XXXX XXXX $3");

  return (
    <ScrollView className="flex-1 bg-neutral-surface">
      {/* HEADER */}
      <View className="flex-row justify-between items-center px-8 pt-10 pb-4 bg-neutral-surface">
        <AppText variant="h2" className="font-bold text-neutral-textDark">
          {t("profile.title")}
        </AppText>
        <TouchableOpacity
          onPress={() => {
            console.log("Settings icon pressed");
            router.replace("/(auth)/language-selection");
          }}
        >
          <Ionicons name="settings-outline" size={24} color="#1F2937" />
        </TouchableOpacity>
      </View>

      {/* PROFILE CARD */}
      <View className="mx-4 mb-4 p-6 bg-white rounded-2xl shadow-sm">
        {/* Avatar and Details */}
        <View className="flex-row mb-6">
          <View className="mr-4">
            <Avatar
              name={profile.name}
              size="3xl"
              className=""
              shape="square"
            />
          </View>

          <View className="flex-1 justify-center">
            <View className="flex-row justify-between mb-2">
              <AppText variant="bodySm" className="text-neutral-textMedium">
                {t("profile.name")}:
              </AppText>
              <AppText
                variant="bodySm"
                className="text-neutral-textDark font-medium"
              >
                {profile.name}
              </AppText>
            </View>
            <View className="flex-row justify-between mb-2">
              <AppText variant="bodySm" className="text-neutral-textMedium">
                {t("profile.age")}:
              </AppText>
              <AppText
                variant="bodySm"
                className="text-neutral-textDark font-medium"
              >
                {profile.age}
              </AppText>
            </View>
            <View className="flex-row justify-between">
              <AppText variant="bodySm" className="text-neutral-textMedium">
                {t("profile.gender")}:
              </AppText>
              <AppText
                variant="bodySm"
                className="text-neutral-textDark font-medium"
              >
                {profile.gender}
              </AppText>
            </View>
          </View>
        </View>

        {/* Edit Details Button */}
        <Button
          label={t("profile.editDetails")}
          variant="primary"
          onPress={() => router.push("/personal-details" as any)}
          className="w-full py-4 bg-[#8B5A3C] rounded-full"
        />
      </View>

      {/* PERSONAL DETAILS */}
      <View className="mx-4 mb-4 p-6 bg-white rounded-2xl shadow-sm">
        <AppText variant="h3" className="font-bold text-neutral-textDark mb-4">
          {t("profile.personalDetails")}
        </AppText>

        <View className="mb-4">
          <View className="flex-row justify-between mb-3">
            <AppText variant="bodySm" className="text-neutral-textMedium">
              {t("profile.mobileNumber")}
            </AppText>
            <AppText variant="bodySm" className="text-neutral-textDark">
              {profile.mobileNumber}
            </AppText>
          </View>
          <View className="flex-row justify-between mb-3">
            <AppText variant="bodySm" className="text-neutral-textMedium">
              {t("profile.aadhaar")}
            </AppText>
            <AppText variant="bodySm" className="text-neutral-textDark">
              {maskAadhaar(profile.aadhaarNumber)}
            </AppText>
          </View>
          <View className="flex-row justify-between">
            <AppText variant="bodySm" className="text-neutral-textMedium">
              {t("profile.address")}
            </AppText>
            <AppText variant="bodySm" className="text-neutral-textDark">
              {profile.village}, {profile.district}
            </AppText>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => router.push("/personal-details" as any)}
        >
          <AppText variant="bodySm" className="text-primary-forest font-medium">
            {t("profile.viewAll")}
          </AppText>
        </TouchableOpacity>
      </View>

      {/* LAND & CROP SUMMARY */}
      <View className="mx-4 mb-4 p-6 bg-white rounded-2xl shadow-sm">
        <View className="flex-row justify-between items-center mb-4">
          <AppText variant="h3" className="font-bold text-neutral-textDark">
            {t("landDetails.title")}
          </AppText>
          <TouchableOpacity onPress={() => router.push("/land-details")}>
            <AppText variant="bodySm" className="text-[#8B5A3C] font-medium">
              {t("landDetails.addLand")}
            </AppText>
          </TouchableOpacity>
        </View>

        <View className="mb-4">
          <View className="flex-row justify-between mb-3">
            <AppText variant="bodySm" className="text-neutral-textMedium">
              {t("profile.landOwned")}
            </AppText>
            <AppText variant="bodySm" className="text-neutral-textDark">
              {profile.totalLandArea} {t("profile.bigha")}
            </AppText>
          </View>
          <View className="flex-row justify-between mb-3">
            <AppText variant="bodySm" className="text-neutral-textMedium">
              {t("profile.primaryCrop")}
            </AppText>
            <AppText variant="bodySm" className="text-neutral-textDark">
              {profile.rabiCrop}
            </AppText>
          </View>
          <View className="flex-row justify-between">
            <AppText variant="bodySm" className="text-neutral-textMedium">
              {t("profile.fieldsAdded")}
            </AppText>
            <AppText variant="bodySm" className="text-neutral-textDark">
              2
            </AppText>
          </View>
        </View>

        <TouchableOpacity onPress={() => router.push("/land-details")}>
          <AppText variant="bodySm" className="text-primary-forest font-medium">
            {t("profile.viewAll")}
          </AppText>
        </TouchableOpacity>
      </View>

      {/* LIVESTOCK */}
      <View className="mx-4 mb-6 p-6 bg-white rounded-2xl shadow-sm">
        <View className="flex-row justify-between items-center mb-4">
          <AppText variant="h3" className="font-bold text-neutral-textDark">
            {t("livestockDetails.title")}
          </AppText>
          <TouchableOpacity onPress={() => router.push("/livestock-details")}>
            <AppText variant="bodySm" className="text-[#8B5A3C] font-medium">
              {t("livestockDetails.addLivestock")}
            </AppText>
          </TouchableOpacity>
        </View>

        <View className="mb-4">
          <View className="flex-row justify-between mb-3">
            <AppText variant="bodySm" className="text-neutral-textMedium">
              {t("livestockDetails.cows")}
            </AppText>
            <AppText variant="bodySm" className="text-neutral-textDark">
              {profile.cows}
            </AppText>
          </View>
          <View className="flex-row justify-between mb-3">
            <AppText variant="bodySm" className="text-neutral-textMedium">
              {t("livestockDetails.buffaloes")}
            </AppText>
            <AppText variant="bodySm" className="text-neutral-textDark">
              {profile.buffaloes}
            </AppText>
          </View>
          <View className="flex-row justify-between">
            <AppText variant="bodySm" className="text-neutral-textMedium">
              {t("livestockDetails.goats")}
            </AppText>
            <AppText variant="bodySm" className="text-neutral-textDark">
              {profile.goats}
            </AppText>
          </View>
        </View>

        <TouchableOpacity onPress={() => router.push("/livestock-details")}>
          <AppText variant="bodySm" className="text-primary-forest font-medium">
            {t("profile.viewAll")}
          </AppText>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default Profile;

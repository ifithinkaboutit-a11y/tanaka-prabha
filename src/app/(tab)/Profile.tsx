// src/app/(tab)/profile.tsx
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ScrollView, View } from "react-native";
import AppText from "../../components/atoms/AppText";
import Avatar from "../../components/atoms/Avatar";
import Button from "../../components/atoms/Button";
import Card from "../../components/atoms/Card";
import { defaultProfile } from "../../data/content/profile";
import { UserProfile } from "../../data/interfaces";
import { useLanguage } from "../../contexts/LanguageContext";
import { useTranslation } from "../../i18n";

const Profile = () => {
  const router = useRouter();
  const { currentLanguage, setLanguage } = useLanguage();
  const { t } = useTranslation();

  const [profile] = useState<UserProfile>(defaultProfile);

  const maskAadhaar = (aadhaar: string) =>
    aadhaar.replace(/(\d{4})(\d{4})(\d{4})/, "$1 $2 $3");

  const toggleLanguage = () => {
    const newLanguage = currentLanguage === "en" ? "hi" : "en";
    setLanguage(newLanguage);
  };

  return (
    <ScrollView className="flex-1 bg-neutral-surface">
      {/* PROFILE HEADER */}
      <View className="mx-4 mt-4 mb-2 p-4 bg-white rounded-lg">
        <View className="flex-row items-center gap-4">
          <Avatar
            name={profile.name}
            size="3xl"
            className="mr-4"
            shape="square"
          />

          <View className="flex-1">
            <AppText variant="bodyMd">
              {t("profile.name")}: {profile.name}
            </AppText>
            <AppText variant="bodyMd">
              {t("profile.age")}: {profile.age}
            </AppText>
            <AppText variant="bodyMd">
              {t("profile.gender")}: {profile.gender}
            </AppText>
            <AppText variant="bodyMd">
              {t("profile.aadhaar")}: {maskAadhaar(profile.aadhaarNumber)}
            </AppText>
            <AppText variant="bodyMd">
              {t("profile.location")}: {profile.village}, {profile.district}
            </AppText>
          </View>
        </View>

        <View className="mt-4">
          <Button
            label={t("profile.editPersonalDetails")}
            variant="secondary"
            onPress={() => router.push("/personal-details")}
            className="w-full bg-secondary-soil"
          />
        </View>
      </View>

      {/* PERSONAL DETAILS */}
      <View className="px-4 mb-4">
        <Card>
          <View className="flex-row justify-between items-center mb-2">
            <AppText variant="h3">{t("personalDetails.title")}</AppText>
            <Button
              label={t("programs.viewAll")}
              variant="outline"
              onPress={() => router.push("/personal-details")}
            />
          </View>

          <View>
            <AppText>Mobile: {profile.mobileNumber}</AppText>
            <AppText>
              {t("profile.aadhaar")}: {maskAadhaar(profile.aadhaarNumber)}
            </AppText>
            <AppText>
              Address: {profile.village}, {profile.district}, {profile.state}
            </AppText>
          </View>
        </Card>
      </View>

      {/* LAND & CROP */}
      <View className="px-4 mb-4">
        <Card>
          <View className="flex-row justify-between items-center mb-2">
            <AppText variant="h3">{t("landDetails.title")}</AppText>
            <Button
              label={t("landDetails.addLand")}
              variant="outline"
              onPress={() => router.push("/land-details")}
            />
          </View>

          <View>
            <AppText>
              {t("landDetails.totalLand")}: {profile.totalLandArea} Bigha
            </AppText>
            <AppText>
              {t("landDetails.rabiCrop")}: {profile.rabiCrop}
            </AppText>
            <AppText>
              {t("landDetails.kharifCrop")}: {profile.kharifCrop}
            </AppText>
          </View>
        </Card>
      </View>

      {/* LIVESTOCK */}
      <View className="px-4 mb-4">
        <Card>
          <View className="flex-row justify-between items-center mb-2">
            <AppText variant="h3">{t("livestockDetails.title")}</AppText>
            <Button
              label={t("livestockDetails.addLivestock")}
              variant="outline"
              onPress={() => router.push("/livestock-details")}
            />
          </View>

          <View>
            <AppText>
              {t("livestockDetails.cows")}: {profile.cows}
            </AppText>
            <AppText>
              {t("livestockDetails.buffaloes")}: {profile.buffaloes}
            </AppText>
            <AppText>
              {t("livestockDetails.goats")}: {profile.goats}
            </AppText>
          </View>
        </Card>
      </View>

      {/* SETTINGS */}
      <View className="px-4 mb-4">
        <Card>
          <View className="flex-row justify-between items-center mb-2">
            <AppText variant="h3">{t("profile.settings")}</AppText>
          </View>

          <View className="flex-row justify-between items-center">
            <AppText>{t("profile.language")}</AppText>
            <Button
              label={currentLanguage === "en" ? "English" : "हिंदी"}
              variant="outline"
              onPress={toggleLanguage}
            />
          </View>
        </Card>
      </View>
    </ScrollView>
  );
};

export default Profile;

// src/app/(tab)/profile.tsx
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ScrollView, View } from "react-native";
import AppText from "../../components/atoms/AppText";
import Avatar from "../../components/atoms/Avatar";
import Button from "../../components/atoms/Button";
import Card from "../../components/atoms/Card";

interface UserProfile {
  name: string;
  age: number;
  gender: string;
  photo: string;
  mobileNumber: string;
  aadhaarNumber: string;

  village: string;
  district: string;
  state: string;

  totalLandArea: number;
  rabiCrop: string;
  kharifCrop: string;

  cows: number;
  buffaloes: number;
  goats: number;
}

const Profile = () => {
  const router = useRouter();

  const [profile] = useState<UserProfile>({
    name: "John Doe",
    age: 35,
    gender: "Male",
    photo: "",
    mobileNumber: "9876543210",
    aadhaarNumber: "123456789012",

    village: "Rampur",
    district: "Lucknow",
    state: "Uttar Pradesh",

    totalLandArea: 5.5,
    rabiCrop: "Wheat",
    kharifCrop: "Rice",

    cows: 2,
    buffaloes: 1,
    goats: 3,
  });

  const maskAadhaar = (aadhaar: string) =>
    aadhaar.replace(/(\d{4})(\d{4})(\d{4})/, "$1 $2 $3");

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
            <AppText variant="bodyMd">Name: {profile.name}</AppText>
            <AppText variant="bodyMd">Age: {profile.age}</AppText>
            <AppText variant="bodyMd">Gender: {profile.gender}</AppText>
            <AppText variant="bodyMd">
              Aadhaar: {maskAadhaar(profile.aadhaarNumber)}
            </AppText>
            <AppText variant="bodyMd">
              Location: {profile.village}, {profile.district}
            </AppText>
          </View>
        </View>

        <View className="mt-4">
          <Button
            label="Edit Details"
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
            <AppText variant="h3">Personal Details</AppText>
            <Button
              label="View all"
              variant="outline"
              onPress={() => router.push("/personal-details")}
            />
          </View>

          <View>
            <AppText>Mobile: {profile.mobileNumber}</AppText>
            <AppText>Aadhaar: {maskAadhaar(profile.aadhaarNumber)}</AppText>
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
            <AppText variant="h3">Land & Crop Summary</AppText>
            <Button
              label="Add land"
              variant="outline"
              onPress={() => router.push("/land-details")}
            />
          </View>

          <View>
            <AppText>Total Land Area: {profile.totalLandArea} Bigha</AppText>
            <AppText>Rabi Crop: {profile.rabiCrop}</AppText>
            <AppText>Kharif Crop: {profile.kharifCrop}</AppText>
          </View>

          <AppText variant="bodySm" className="mt-2 text-neutral-textMedium">
            1 field added
          </AppText>
        </Card>
      </View>

      {/* LIVESTOCK */}
      <View className="px-4 mb-4">
        <Card>
          <View className="flex-row justify-between items-center mb-2">
            <AppText variant="h3">Livestock Summary</AppText>
            <Button
              label="Add livestock"
              variant="outline"
              onPress={() => router.push("/livestock-details")}
            />
          </View>

          <View>
            <AppText>Cows: {profile.cows}</AppText>
            <AppText>Buffaloes: {profile.buffaloes}</AppText>
            <AppText>Goats: {profile.goats}</AppText>
          </View>
        </Card>
      </View>
    </ScrollView>
  );
};

export default Profile;

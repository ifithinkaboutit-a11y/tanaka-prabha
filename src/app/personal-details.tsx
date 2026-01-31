// src/app/personal-details.tsx
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ScrollView, View } from "react-native";
import PersonalDetailsForm from "../components/molecules/PersonalDetailsForm";

interface UserProfile {
  // Basic Info
  name: string;
  age: number;
  gender: string;
  photo: string;
  mobileNumber: string;
  aadhaarNumber: string;

  // Personal Details
  fathersName: string;
  mothersName: string;
  educationalQualification: string;
  geoLocation: string;

  // Family Details
  sonsMarried: number;
  sonsUnmarried: number;
  daughtersMarried: number;
  daughtersUnmarried: number;
  otherFamilyMembers: number;

  // Address
  village: string;
  gramPanchayat: string;
  nyayPanchayat: string;
  postOffice: string;
  tehsil: string;
  block: string;
  district: string;
  pinCode: string;
  state: string;

  // Land Details
  totalLandArea: number;
  rabiCrop: string;
  kharifCrop: string;
  zaidCrop: string;

  // Livestock Details
  cows: number;
  buffaloes: number;
  goats: number;
  sheep: number;
  pigs: number;
  poultry: number;
}

const PersonalDetailsScreen = () => {
  const router = useRouter();

  // Mock data - in real app, this would come from context/state
  const [profile, setProfile] = useState<UserProfile>({
    name: "John Doe",
    age: 35,
    gender: "Male",
    photo: "",
    mobileNumber: "9876543210",
    aadhaarNumber: "123456789012",

    fathersName: "Ram Singh",
    mothersName: "Sita Devi",
    educationalQualification: "10th Pass",
    geoLocation: "28.6139° N, 77.2090° E",

    sonsMarried: 1,
    sonsUnmarried: 2,
    daughtersMarried: 1,
    daughtersUnmarried: 1,
    otherFamilyMembers: 0,

    village: "Test Village",
    gramPanchayat: "Test GP",
    nyayPanchayat: "Test NP",
    postOffice: "Test PO",
    tehsil: "Test Tehsil",
    block: "Test Block",
    district: "Test District",
    pinCode: "123456",
    state: "Uttar Pradesh",

    totalLandArea: 5.5,
    rabiCrop: "Wheat",
    kharifCrop: "Rice",
    zaidCrop: "Moong",

    cows: 2,
    buffaloes: 1,
    goats: 3,
    sheep: 0,
    pigs: 0,
    poultry: 10,
  });

  const initialData = {
    fathersName: profile.fathersName,
    mothersName: profile.mothersName,
    educationalQualification: profile.educationalQualification,
    sonsMarried: profile.sonsMarried,
    sonsUnmarried: profile.sonsUnmarried,
    daughtersMarried: profile.daughtersMarried,
    daughtersUnmarried: profile.daughtersUnmarried,
    otherFamilyMembers: profile.otherFamilyMembers,
    village: profile.village,
    gramPanchayat: profile.gramPanchayat,
    nyayPanchayat: profile.nyayPanchayat,
    postOffice: profile.postOffice,
    tehsil: profile.tehsil,
    block: profile.block,
    district: profile.district,
    pinCode: profile.pinCode,
    state: profile.state,
  };

  const handleSave = (data: typeof initialData) => {
    setProfile({ ...profile, ...data });
    router.back();
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <ScrollView className="flex-1 bg-neutral-surface">
      <View className="p-4">
        <PersonalDetailsForm
          initialData={initialData}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </View>
    </ScrollView>
  );
};

export default PersonalDetailsScreen;

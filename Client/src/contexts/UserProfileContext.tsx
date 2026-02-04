// src/contexts/UserProfileContext.tsx
import React, { createContext, ReactNode, useContext, useState } from "react";
import { defaultProfile } from "../data/content/profile";
import { UserProfile } from "../data/interfaces";

interface UserProfileContextType {
  profile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => void;
  updatePersonalDetails: (data: any) => void;
  updateLandDetails: (data: any) => void;
  updateLivestockDetails: (data: any) => void;
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(
  undefined,
);

export const useUserProfile = () => {
  const context = useContext(UserProfileContext);
  if (!context) {
    throw new Error("useUserProfile must be used within a UserProfileProvider");
  }
  return context;
};

interface UserProfileProviderProps {
  children: ReactNode;
}

export const UserProfileProvider: React.FC<UserProfileProviderProps> = ({
  children,
}) => {
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);

  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile((prev) => ({ ...prev, ...updates }));
  };

  const updatePersonalDetails = (data: any) => {
    setProfile((prev) => ({
      ...prev,
      fathersName: data.fathersName,
      mothersName: data.mothersName,
      educationalQualification: data.educationalQualification,
      sonsMarried: data.sonsMarried,
      sonsUnmarried: data.sonsUnmarried,
      daughtersMarried: data.daughtersMarried,
      daughtersUnmarried: data.daughtersUnmarried,
      otherFamilyMembers: data.otherFamilyMembers,
      village: data.village,
      gramPanchayat: data.gramPanchayat,
      nyayPanchayat: data.nyayPanchayat,
      postOffice: data.postOffice,
      tehsil: data.tehsil,
      block: data.block,
      district: data.district,
      pinCode: data.pinCode,
      state: data.state,
    }));
  };

  const updateLandDetails = (data: any) => {
    setProfile((prev) => ({
      ...prev,
      totalLandArea: data.totalLandArea,
      rabiCrop: data.rabiCrop,
      kharifCrop: data.kharifCrop,
      zaidCrop: data.zaidCrop,
    }));
  };

  const updateLivestockDetails = (data: any) => {
    setProfile((prev) => ({
      ...prev,
      cows: data.cow,
      buffaloes: data.buffalo,
      sheep: data.sheep,
      goats: data.goat,
      poultry: data.hen,
      pigs: data.others,
    }));
  };

  return (
    <UserProfileContext.Provider
      value={{
        profile,
        updateProfile,
        updatePersonalDetails,
        updateLandDetails,
        updateLivestockDetails,
      }}
    >
      {children}
    </UserProfileContext.Provider>
  );
};

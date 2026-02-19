// src/contexts/UserProfileContext.tsx
import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { userApi, UserProfile, UserProfileUpdate } from "../services/apiService";

interface UserProfileContextType {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  refreshProfile: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfileUpdate>) => Promise<void>;
  updatePersonalDetails: (data: any) => Promise<void>;
  updateLandDetails: (data: any) => Promise<void>;
  updateLivestockDetails: (data: any) => Promise<void>;
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
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await userApi.getProfile();
      if (response.data?.user) {
        setProfile(response.data.user);
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  // Don't auto-fetch on mount — wait until explicitly called
  // Profile will be fetched when navigating to screens that need it
  useEffect(() => {
    // Only attempt to load profile if a token exists
    const loadIfAuthenticated = async () => {
      try {
        const { tokenManager } = require("../services/apiService");
        const token = await tokenManager.getToken();
        if (token) {
          await refreshProfile();
        } else {
          setLoading(false);
        }
      } catch {
        setLoading(false);
      }
    };
    loadIfAuthenticated();
  }, []);

  const updateProfile = async (updates: Partial<UserProfileUpdate>) => {
    try {
      const response = await userApi.updateProfile(updates);
      if (response.data?.user) {
        setProfile(response.data.user);
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      throw err;
    }
  };

  const updatePersonalDetails = async (data: any) => {
    await updateProfile({
      name: data.name,
      age: data.age,
      gender: data.gender,
      fathers_name: data.fathersName,
      mothers_name: data.mothersName,
      educational_qualification: data.educationalQualification,
      sons_married: data.sonsMarried,
      sons_unmarried: data.sonsUnmarried,
      daughters_married: data.daughtersMarried,
      daughters_unmarried: data.daughtersUnmarried,
      other_family_members: data.otherFamilyMembers,
      village: data.village,
      gram_panchayat: data.gramPanchayat,
      nyay_panchayat: data.nyayPanchayat,
      post_office: data.postOffice,
      tehsil: data.tehsil,
      block: data.block,
      district: data.district,
      pin_code: data.pinCode,
      state: data.state,
    });
    // Refresh profile after update to ensure UI reflects latest data
    await refreshProfile();
  };

  const updateLandDetails = async (data: any) => {
    await updateProfile({
      land_details: {
        total_land_area: data.totalLandArea,
        rabi_crop: data.rabiCrop,
        kharif_crop: data.kharifCrop,
        zaid_crop: data.zaidCrop,
      },
    });
    // Refresh profile after update to ensure UI reflects latest data
    await refreshProfile();
  };

  const updateLivestockDetails = async (data: any) => {
    await updateProfile({
      livestock_details: {
        cow: data.cow,
        buffalo: data.buffalo,
        sheep: data.sheep,
        goat: data.goat,
        poultry: data.hen,
        others: data.others,
      },
    });
    // Refresh profile after update to ensure UI reflects latest data
    await refreshProfile();
  };

  return (
    <UserProfileContext.Provider
      value={{
        profile,
        loading,
        error,
        refreshProfile,
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

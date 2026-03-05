// src/contexts/UserProfileContext.tsx
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from "react";
import { Alert } from "react-native";
import { tokenManager, userApi, UserProfile, UserProfileUpdate } from "../services/apiService";

interface UserProfileContextType {
  profile: UserProfile | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
  refreshProfile: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfileUpdate>) => Promise<void>;
  updatePersonalDetails: (data: any) => Promise<void>;
  updateLandDetails: (data: any) => Promise<void>;
  updateLivestockDetails: (data: any) => Promise<void>;
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

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

export const UserProfileProvider: React.FC<UserProfileProviderProps> = ({ children }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track in-flight fetch to avoid double-loads
  const fetchingRef = useRef(false);

  const refreshProfile = useCallback(async () => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    try {
      setError(null);
      const response = await userApi.getProfile();
      if (response.data?.user) {
        setProfile(response.data.user);
        console.log("✅ [UserProfileContext] Profile loaded from backend");
      }
    } catch (err) {
      console.warn("⚠️ [UserProfileContext] Backend unavailable, using cached data:", err);
      setError("Could not connect to server");
      // Profile remains whatever it was (cached from mount or previous load)
    } finally {
      fetchingRef.current = false;
      setLoading(false);
    }
  }, []);

  // On mount: load cached user data from AsyncStorage immediately, then
  // fire off a backend refresh in parallel so the UI isn't blocked.
  useEffect(() => {
    const init = async () => {
      try {
        const token = await tokenManager.getToken();
        if (!token) {
          setLoading(false);
          return;
        }

        // Step 1: Show cached user data immediately (from tokenManager)
        const cachedUser = await tokenManager.getUser();
        if (cachedUser) {
          // Build a minimal UserProfile from the AuthContext cache
          // so the form pre-populates instantly without waiting for the network
          setProfile((prev) =>
            prev ?? {
              id: cachedUser.id,
              name: cachedUser.name || "",
              mobileNumber: cachedUser.mobileNumber || "",
              village: cachedUser.village,
              district: cachedUser.district,
              state: cachedUser.state,
              gender: cachedUser.gender,
            }
          );
          // Don't keep the spinner up just for the cached fallback
          setLoading(false);
        }

        // Step 2: Fetch full profile from backend in background
        await refreshProfile();
      } catch {
        setLoading(false);
      }
    };
    init();
  }, [refreshProfile]);

  // ── Update helpers ──────────────────────────────────────────────────────────

  const updateProfile = useCallback(async (updates: Partial<UserProfileUpdate>) => {
    setSaving(true);
    try {
      const response = await userApi.updateProfile(updates);
      if (response.data?.user) {
        setProfile(response.data.user);
        console.log("✅ [UserProfileContext] Profile saved to backend");
      }
    } catch (err) {
      console.error("❌ [UserProfileContext] Save failed:", err);
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  const updatePersonalDetails = useCallback(async (data: any) => {
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
  }, [updateProfile]);

  const updateLandDetails = useCallback(async (data: any) => {
    await updateProfile({
      land_details: {
        total_land_area: data.totalLandArea,
        rabi_crop: data.rabiCrop,
        kharif_crop: data.kharifCrop,
        zaid_crop: data.zaidCrop,
      },
    });
  }, [updateProfile]);

  const updateLivestockDetails = useCallback(async (data: any) => {
    await updateProfile({
      livestock_details: {
        cow: data.cow,
        buffalo: data.buffalo,
        sheep: data.sheep,
        goat: data.goat,
        pig: data.pig,
        poultry: data.poultry,
        others: data.others,
      },
    });
  }, [updateProfile]);

  return (
    <UserProfileContext.Provider
      value={{
        profile,
        loading,
        saving,
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

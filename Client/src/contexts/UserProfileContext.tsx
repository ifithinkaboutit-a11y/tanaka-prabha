// src/contexts/UserProfileContext.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from "react";
import { tokenManager, userApi, UserProfile, UserProfileUpdate } from "../services/apiService";

// ── Cache constants ──────────────────────────────────────────────────────────
export const PROFILE_CACHE_TTL_MS = 300_000; // 5 minutes
export const PROFILE_CACHE_KEY = "profile_cache";

// ── Cache shape ──────────────────────────────────────────────────────────────
export interface ProfileCache {
  profile: UserProfile;
  cachedAt: string;   // ISO-8601
  isDirty: boolean;
}

// ── Pure helper: is the cache still fresh? ───────────────────────────────────
export function isCacheFresh(cache: ProfileCache): boolean {
  return !cache.isDirty && (Date.now() - Date.parse(cache.cachedAt)) < PROFILE_CACHE_TTL_MS;
}

// ── Standalone logout helper ─────────────────────────────────────────────────
export async function clearProfileCache(): Promise<void> {
  await AsyncStorage.removeItem(PROFILE_CACHE_KEY);
}

// ── Context type ─────────────────────────────────────────────────────────────
interface UserProfileContextType {
  profile: UserProfile | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
  refreshProfile: (force?: boolean) => Promise<void>;
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

  const refreshProfile = useCallback(async (force = false) => {
    if (fetchingRef.current) return;

    // ── Read cache ──────────────────────────────────────────────────────────
    let cachedData: ProfileCache | null = null;
    try {
      const raw = await AsyncStorage.getItem(PROFILE_CACHE_KEY);
      if (raw) {
        cachedData = JSON.parse(raw) as ProfileCache;
      }
    } catch (e) {
      console.warn("⚠️ [UserProfileContext] Cache read failed:", e);
      cachedData = null;
    }

    // ── Fresh cache and no force → return immediately without fetching ──────
    if (cachedData && isCacheFresh(cachedData) && !force) {
      setProfile(cachedData.profile);
      setLoading(false);
      return;
    }

    // ── Show cached data immediately while fetching in background ────────────
    if (cachedData) {
      setProfile(cachedData.profile);
      setLoading(false);
    }

    // ── Background fetch ─────────────────────────────────────────────────────
    fetchingRef.current = true;
    try {
      setError(null);
      const response = await userApi.getProfile();
      if (response.data?.user) {
        const freshProfile = response.data.user;
        setProfile(freshProfile);

        // Write updated cache
        const newCache: ProfileCache = {
          profile: freshProfile,
          cachedAt: new Date().toISOString(),
          isDirty: false,
        };
        try {
          await AsyncStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(newCache));
        } catch (writeErr) {
          console.warn("⚠️ [UserProfileContext] Cache write failed:", writeErr);
        }
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

  // On mount: hydrate from ProfileCache first (instant display), then refresh
  useEffect(() => {
    const init = async () => {
      try {
        const token = await tokenManager.getToken();
        if (!token) {
          setLoading(false);
          return;
        }

        // Step 1: Hydrate from ProfileCache immediately
        try {
          const raw = await AsyncStorage.getItem(PROFILE_CACHE_KEY);
          if (raw) {
            const cached: ProfileCache = JSON.parse(raw);
            setProfile(cached.profile);
            setLoading(false);
          } else {
            // Fall back to tokenManager user for minimal instant display
            const cachedUser = await tokenManager.getUser();
            if (cachedUser) {
              setProfile((prev) =>
                prev ?? {
                  id: cachedUser.id,
                  name: cachedUser.name || "",
                  mobileNumber: cachedUser.mobileNumber || "",
                  village: cachedUser.village,
                  district: cachedUser.district,
                  state: cachedUser.state,
                  gender: cachedUser.gender,
                  photoUrl: cachedUser.photoUrl,
                }
              );
              setLoading(false);
            }
          }
        } catch {
          // ignore cache read errors — refreshProfile will fetch fresh data
        }

        // Step 2: Fetch full profile from backend (respects cache TTL)
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

        // Mark cache dirty so next profile visit triggers a fresh fetch
        try {
          const raw = await AsyncStorage.getItem(PROFILE_CACHE_KEY);
          if (raw) {
            const existing: ProfileCache = JSON.parse(raw);
            const dirtyCache: ProfileCache = { ...existing, isDirty: true };
            await AsyncStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(dirtyCache));
          } else {
            // No cache yet — write one with isDirty: true
            const dirtyCache: ProfileCache = {
              profile: response.data.user,
              cachedAt: new Date().toISOString(),
              isDirty: true,
            };
            await AsyncStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(dirtyCache));
          }
        } catch (cacheErr) {
          console.warn("⚠️ [UserProfileContext] Failed to mark cache dirty:", cacheErr);
        }

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

// src/stores/onboardingStore.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  PersonalDetails
} from "../data/interfaces";

// ---------- Location ----------
export interface LocationData {
  lat: number;
  lng: number;
  /** Human-readable address from reverse geocode. May be 'Unknown location' if geocoding failed. */
  address: string;
  /** GPS accuracy in metres at time of capture */
  accuracy: number;
  /** UTC ISO-8601 timestamp of when pin was confirmed */
  setAt: string;
  /** How location was captured. 'gps' = confirmed pin, 'skipped' = user skipped */
  method: 'gps' | 'skipped';
  /**
   * Ordered boundary vertices for a land parcel polygon.
   * Only populated in Land_Flow when the user places >= 3 pins.
   * Undefined for home-location confirmations and single-pin land confirmations.
   * Backwards-compatible: existing AsyncStorage records without this field
   * deserialise as undefined (Zustand persist does not require all fields).
   */
  polygon?: Array<{ lat: number; lng: number }>;
}

export interface LandEntry {
  id: string;
  area: number;
  unit: "bigha" | "acre" | "hectare";
  mainCrop: string;
  crops: string[]; // Support multiple crop selection
}

export interface LivestockEntry {
  id: string;
  type: string;
  count: number;
}

interface OnboardingState {
  // Current step (0-2)
  currentStep: number;

  // Onboarding screen step — persisted so mid-onboarding relaunches resume correctly
  // 0=personal-details, 1=location-picker, 2=land-details, 3=livestock-details
  onboardingStep: number;

  // Step completion status
  isPersonalCompleted: boolean;
  isLandCompleted: boolean;
  isLivestockCompleted: boolean;

  // Personal details
  personalDetails: PersonalDetails;

  // Location — captured on location-picker screen
  locationData: LocationData | null;

  // Land details with toggle
  hasLand: boolean;
  landEntries: LandEntry[];
  landLocationData: LocationData | null;
  // Livestock details with toggle
  hasLivestock: boolean;
  livestockEntries: LivestockEntry[];

  // Actions
  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  setOnboardingStep: (step: number) => void;

  // Personal details actions
  setMobileNumber: (num: string) => void;
  setRole: (role: string) => void;
  updatePersonalDetails: (data: Partial<PersonalDetails>) => void;
  setPersonalCompleted: (completed: boolean) => void;

  // Location action
  setLocationData: (data: LocationData | null) => void;
  setLandLocationData: (data: LocationData | null) => void;

  // Land actions
  setHasLand: (hasLand: boolean) => void;
  addLandEntry: (entry: Omit<LandEntry, "id">) => void;
  updateLandEntry: (id: string, entry: Partial<LandEntry>) => void;
  removeLandEntry: (id: string) => void;
  setLandCompleted: (completed: boolean) => void;

  // Livestock actions
  setHasLivestock: (hasLivestock: boolean) => void;
  addLivestockEntry: (entry: Omit<LivestockEntry, "id">) => void;
  updateLivestockEntry: (id: string, entry: Partial<LivestockEntry>) => void;
  removeLivestockEntry: (id: string) => void;
  setLivestockCompleted: (completed: boolean) => void;

  // Profile address override — set by location-picker when purpose==='profile'
  // personal-details reads this and clears it after consuming
  profileAddressOverride: Record<string, string> | null;
  setProfileAddressOverride: (data: Record<string, string> | null) => void;

  // Event location pick — set by location-picker when purpose==='event-location'
  // create-event reads this and clears it after consuming
  eventLocationPick: { lat: number; lng: number } | null;
  setEventLocationPick: (data: { lat: number; lng: number } | null) => void;

  // Reset
  resetOnboarding: () => void;
}

const initialPersonalDetails: PersonalDetails = {
  name: "",
  age: 0,
  gender: "",
  aadhaar: "",
  photoUrl: "",
  fathersName: "",
  mothersName: "",
  educationalQualification: "",
  sonsMarried: 0,
  sonsUnmarried: 0,
  daughtersMarried: 0,
  daughtersUnmarried: 0,
  otherFamilyMembers: 0,
  village: "",
  gramPanchayat: "",
  nyayPanchayat: "",
  postOffice: "",
  tehsil: "",
  block: "",
  district: "",
  pinCode: "",
  state: "",
};

const generateId = () => Math.random().toString(36).substring(2, 9);

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      currentStep: 0,
      onboardingStep: 0,
      isPersonalCompleted: false,
      isLandCompleted: false,
      isLivestockCompleted: false,

      personalDetails: { ...initialPersonalDetails },
      locationData: null,
      landLocationData: null,
      profileAddressOverride: null,
      eventLocationPick: null,

      // Land Details
      hasLand: true,
      landEntries: [],

      // Livestock Details
      hasLivestock: true,
      livestockEntries: [],

      // Actions
      setMobileNumber: (num) => set((state) => ({ personalDetails: { ...state.personalDetails, mobileNumber: num } })),
      setRole: (role) => set((state) => ({ personalDetails: { ...state.personalDetails, role: role } })),
      setCurrentStep: (step) => set({ currentStep: step }),
      setOnboardingStep: (step) => set({ onboardingStep: step }),

      nextStep: () => {
        const { currentStep } = get();
        if (currentStep < 2) {
          set({ currentStep: currentStep + 1 });
        }
      },

      prevStep: () => {
        const { currentStep } = get();
        if (currentStep > 0) {
          set({ currentStep: currentStep - 1 });
        }
      },

      // Personal Details Actions
      updatePersonalDetails: (data) =>
        set((state) => ({
          personalDetails: { ...state.personalDetails, ...data },
        })),
      setPersonalCompleted: (completed) =>
        set({ isPersonalCompleted: completed }),

      setLocationData: (data) => set({ locationData: data }),
      setLandLocationData: (data) => set({ landLocationData: data }),
      setProfileAddressOverride: (data) => set({ profileAddressOverride: data }),
      setEventLocationPick: (data) => set({ eventLocationPick: data }),

      setHasLand: (has) => set({ hasLand: has }),

      addLandEntry: (entry) => {
        const { landEntries } = get();
        set({
          landEntries: [...landEntries, { ...entry, id: generateId() }],
        });
      },

      updateLandEntry: (id, entry) => {
        const { landEntries } = get();
        set({
          landEntries: landEntries.map((e) =>
            e.id === id ? { ...e, ...entry } : e,
          ),
        });
      },

      removeLandEntry: (id) => {
        const { landEntries } = get();
        set({
          landEntries: landEntries.filter((e) => e.id !== id),
        });
      },

      setLandCompleted: (completed) => set({ isLandCompleted: completed }),

      setHasLivestock: (hasLivestock) => set({ hasLivestock }),

      addLivestockEntry: (entry) => {
        const { livestockEntries } = get();
        set({
          livestockEntries: [
            ...livestockEntries,
            { ...entry, id: generateId() },
          ],
        });
      },

      updateLivestockEntry: (id, entry) => {
        const { livestockEntries } = get();
        set({
          livestockEntries: livestockEntries.map((e) =>
            e.id === id ? { ...e, ...entry } : e,
          ),
        });
      },

      removeLivestockEntry: (id) => {
        const { livestockEntries } = get();
        set({
          livestockEntries: livestockEntries.filter((e) => e.id !== id),
        });
      },

      setLivestockCompleted: (completed) =>
        set({ isLivestockCompleted: completed }),

      resetOnboarding: () =>
        set({
          currentStep: 0,
          onboardingStep: 0,
          isPersonalCompleted: false,
          isLandCompleted: false,
          isLivestockCompleted: false,
          personalDetails: initialPersonalDetails,
          locationData: null,
          hasLand: true,
          landEntries: [],
          hasLivestock: true,
          livestockEntries: [],
        }),
    }),
    {
      name: "onboarding-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

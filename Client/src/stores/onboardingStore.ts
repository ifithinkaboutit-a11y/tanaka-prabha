// src/stores/onboardingStore.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
    PersonalDetails
} from "../data/interfaces";

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

  // Step completion status
  isPersonalCompleted: boolean;
  isLandCompleted: boolean;
  isLivestockCompleted: boolean;

  // Personal details
  personalDetails: PersonalDetails;

  // Land details with toggle
  hasLand: boolean;
  landEntries: LandEntry[];

  // Livestock details with toggle
  hasLivestock: boolean;
  livestockEntries: LivestockEntry[];

  // Actions
  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;

  // Personal details actions
  updatePersonalDetails: (data: Partial<PersonalDetails>) => void;
  setPersonalCompleted: (completed: boolean) => void;

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

  // Reset
  resetOnboarding: () => void;
}

const initialPersonalDetails: PersonalDetails = {
  name: "",
  age: 0,
  gender: "",
  aadhaar: "",
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
      isPersonalCompleted: false,
      isLandCompleted: false,
      isLivestockCompleted: false,

      personalDetails: initialPersonalDetails,

      hasLand: false,
      landEntries: [],

      hasLivestock: false,
      livestockEntries: [],

      setCurrentStep: (step) => set({ currentStep: step }),

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

      updatePersonalDetails: (data) => {
        const { personalDetails } = get();
        set({ personalDetails: { ...personalDetails, ...data } });
      },

      setPersonalCompleted: (completed) =>
        set({ isPersonalCompleted: completed }),

      setHasLand: (hasLand) => set({ hasLand }),

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
          isPersonalCompleted: false,
          isLandCompleted: false,
          isLivestockCompleted: false,
          personalDetails: initialPersonalDetails,
          hasLand: false,
          landEntries: [],
          hasLivestock: false,
          livestockEntries: [],
        }),
    }),
    {
      name: "onboarding-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

// src/data/interfaces/profile.d.ts

export interface UserProfile {
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

export interface PersonalDetails {
  // User's own details
  name: string;
  age: number;
  gender: string;
  // Family info
  fathersName: string;
  mothersName: string;
  educationalQualification: string;
  sonsMarried: number;
  sonsUnmarried: number;
  daughtersMarried: number;
  daughtersUnmarried: number;
  otherFamilyMembers: number;
  village: string;
  gramPanchayat: string;
  nyayPanchayat: string;
  postOffice: string;
  tehsil: string;
  block: string;
  district: string;
  pinCode: string;
  state: string;
}

export interface LandDetails {
  totalLandArea: number;
  rabiCrop: string;
  kharifCrop: string;
  zaidCrop: string;
}

export interface LivestockDetails {
  cow: number;
  buffalo: number;
  sheep: number;
  goat: number;
  hen: number;
  others: number;
}

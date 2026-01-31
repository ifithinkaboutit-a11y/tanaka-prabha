// src/data/content/profile.ts
import { UserProfile } from "../interfaces";

export const defaultProfile: UserProfile = {
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
};

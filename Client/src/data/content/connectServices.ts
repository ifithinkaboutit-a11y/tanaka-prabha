// src/data/content/connectServices.ts
import { Ionicons } from "@expo/vector-icons";

export interface ConnectService {
  id: string;
  title: string;
  titleKey: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconBgColor: string;
  route: string;
}

// 4 main service categories — IDs match the `category` column in the DB
export const connectServices: ConnectService[] = [
  {
    id: "agricultural",
    title: "Agriculture & Training",
    titleKey: "connect.services.trainingGuidance",
    icon: "leaf-outline",
    iconBgColor: "#DCFCE7",
    route: "/connect-listing",
  },
  {
    id: "veterinary",
    title: "Livestock & Veterinary",
    titleKey: "connect.services.livestockVeterinary",
    icon: "paw-outline",
    iconBgColor: "#FEF3C7",
    route: "/connect-listing",
  },
  {
    id: "financial",
    title: "Market & Financial",
    titleKey: "connect.services.marketBuyers",
    icon: "storefront-outline",
    iconBgColor: "#FCE7F3",
    route: "/connect-listing",
  },
  {
    id: "doctor",
    title: "Government Schemes",
    titleKey: "connect.services.governmentSchemes",
    icon: "business-outline",
    iconBgColor: "#DBEAFE",
    route: "/connect-listing",
  },
];

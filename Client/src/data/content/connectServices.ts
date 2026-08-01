// src/data/content/connectServices.ts
import { Ionicons } from "@expo/vector-icons";

export interface ConnectService {
  id: string;
  title: string;
  titleKey: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBgColor: string;
  route: string;
}

// 4 main service categories — IDs must match the `category` column values
// seeded on the `professionals` table (see Server/backend/src/utils/seedDatabase.js)
export const connectServices: ConnectService[] = [
  {
    id: "training-guidance",
    title: "Agriculture & Training",
    titleKey: "connect.services.trainingGuidance",
    icon: "leaf-outline",
    iconColor: "#16A34A",
    iconBgColor: "#DCFCE7",
    route: "/connect-listing",
  },
  {
    id: "livestock-veterinary",
    title: "Livestock & Veterinary",
    titleKey: "connect.services.livestockVeterinary",
    icon: "paw-outline",
    iconColor: "#D97706",
    iconBgColor: "#FEF3C7",
    route: "/connect-listing",
  },
  {
    id: "market-buyers",
    title: "Market & Financial",
    titleKey: "connect.services.marketBuyers",
    icon: "storefront-outline",
    iconColor: "#DB2777",
    iconBgColor: "#FCE7F3",
    route: "/connect-listing",
  },
  {
    id: "government-schemes",
    title: "Government Schemes",
    titleKey: "connect.services.governmentSchemes",
    icon: "business-outline",
    iconColor: "#2563EB",
    iconBgColor: "#DBEAFE",
    route: "/connect-listing",
  },
];

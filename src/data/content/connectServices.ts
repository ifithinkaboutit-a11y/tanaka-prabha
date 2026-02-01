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

export interface Professional {
  id: string;
  name: string;
  role: string;
  roleKey: string;
  department: string;
  departmentKey: string;
  category: string; // matches service id
  imageUrl: string;
  district: string;
  serviceArea: {
    district: string;
    blocks: string[];
    state: string;
  };
  specializations: string[];
  specializationsKeys: string[];
  isAvailable: boolean;
  phone: string;
}

export interface RecentConnection {
  id: string;
  professionalId: string;
  connectedOn: string;
  method: "call" | "chat" | "appointment";
}

// 4 main service categories
export const connectServices: ConnectService[] = [
  {
    id: "government-schemes",
    title: "Government Schemes",
    titleKey: "connect.services.governmentSchemes",
    icon: "business-outline",
    iconBgColor: "#E8F5E9",
    route: "/connect-listing",
  },
  {
    id: "training-guidance",
    title: "Training & Guidance",
    titleKey: "connect.services.trainingGuidance",
    icon: "school-outline",
    iconBgColor: "#E3F2FD",
    route: "/connect-listing",
  },
  {
    id: "market-buyers",
    title: "Market & Buyers",
    titleKey: "connect.services.marketBuyers",
    icon: "storefront-outline",
    iconBgColor: "#E8F5E9",
    route: "/connect-listing",
  },
  {
    id: "livestock-veterinary",
    title: "Livestock & Veterinary",
    titleKey: "connect.services.livestockVeterinary",
    icon: "paw-outline",
    iconBgColor: "#E3F2FD",
    route: "/connect-listing",
  },
];

// Professionals data
export const professionals: Professional[] = [
  {
    id: "1",
    name: "Dr. Pankaj Shukla",
    role: "Animal Doctor",
    roleKey: "connect.roles.animalDoctor",
    department: "Animal Husbandry Department",
    departmentKey: "connect.departments.animalHusbandry",
    category: "livestock-veterinary",
    imageUrl: "https://randomuser.me/api/portraits/men/32.jpg",
    district: "Jankipuram",
    serviceArea: {
      district: "Lucknow",
      blocks: ["Bakshi Ka Talab", "Malihabad", "Sarojini Nagar"],
      state: "Uttar Pradesh",
    },
    specializations: [
      "Cattle health (Cow, Buffalo)",
      "Goat & Sheep treatment",
      "Poultry disease management",
    ],
    specializationsKeys: [
      "connect.specializations.cattleHealth",
      "connect.specializations.goatSheep",
      "connect.specializations.poultry",
    ],
    isAvailable: true,
    phone: "+919876543210",
  },
  {
    id: "2",
    name: "Ms. Anjali Verma",
    role: "Agriculture Extension Officer",
    roleKey: "connect.roles.agricultureOfficer",
    department: "Agriculture Department",
    departmentKey: "connect.departments.agriculture",
    category: "training-guidance",
    imageUrl: "https://randomuser.me/api/portraits/women/44.jpg",
    district: "Lucknow",
    serviceArea: {
      district: "Lucknow",
      blocks: ["Mohanlalganj", "Chinhat", "Gosainganj"],
      state: "Uttar Pradesh",
    },
    specializations: [
      "Crop management",
      "Soil health",
      "Organic farming techniques",
    ],
    specializationsKeys: [
      "connect.specializations.cropManagement",
      "connect.specializations.soilHealth",
      "connect.specializations.organicFarming",
    ],
    isAvailable: true,
    phone: "+919876543211",
  },
  {
    id: "3",
    name: "Shri Ramesh Kumar",
    role: "Scheme Coordinator",
    roleKey: "connect.roles.schemeCoordinator",
    department: "Krishi Bhawan",
    departmentKey: "connect.departments.krishiBhawan",
    category: "government-schemes",
    imageUrl: "https://randomuser.me/api/portraits/men/45.jpg",
    district: "Lucknow",
    serviceArea: {
      district: "Lucknow",
      blocks: ["All blocks"],
      state: "Uttar Pradesh",
    },
    specializations: [
      "PM-KISAN enrollment",
      "Crop insurance claims",
      "Subsidy applications",
    ],
    specializationsKeys: [
      "connect.specializations.pmKisan",
      "connect.specializations.cropInsurance",
      "connect.specializations.subsidyApps",
    ],
    isAvailable: true,
    phone: "+919876543212",
  },
  {
    id: "4",
    name: "Shri Vijay Singh",
    role: "Market Liaison Officer",
    roleKey: "connect.roles.marketOfficer",
    department: "Agricultural Marketing",
    departmentKey: "connect.departments.marketing",
    category: "market-buyers",
    imageUrl: "https://randomuser.me/api/portraits/men/52.jpg",
    district: "Lucknow",
    serviceArea: {
      district: "Lucknow",
      blocks: ["All blocks"],
      state: "Uttar Pradesh",
    },
    specializations: [
      "Mandi price updates",
      "Buyer connections",
      "Cold storage facilities",
    ],
    specializationsKeys: [
      "connect.specializations.mandiPrice",
      "connect.specializations.buyerConnections",
      "connect.specializations.coldStorage",
    ],
    isAvailable: true,
    phone: "+919876543213",
  },
  {
    id: "5",
    name: "Dr. Priya Sharma",
    role: "Veterinary Officer",
    roleKey: "connect.roles.vetOfficer",
    department: "Animal Husbandry Department",
    departmentKey: "connect.departments.animalHusbandry",
    category: "livestock-veterinary",
    imageUrl: "https://randomuser.me/api/portraits/women/65.jpg",
    district: "Barabanki",
    serviceArea: {
      district: "Barabanki",
      blocks: ["Fatehpur", "Nawabganj", "Haidergarh"],
      state: "Uttar Pradesh",
    },
    specializations: [
      "Cattle vaccination",
      "Breeding programs",
      "Disease prevention",
    ],
    specializationsKeys: [
      "connect.specializations.vaccination",
      "connect.specializations.breeding",
      "connect.specializations.diseasePrevention",
    ],
    isAvailable: true,
    phone: "+919876543214",
  },
];

// Recent connections (static demo data)
export const recentConnections: RecentConnection[] = [
  {
    id: "1",
    professionalId: "1",
    connectedOn: "05/08/2025",
    method: "call",
  },
  {
    id: "2",
    professionalId: "2",
    connectedOn: "01/08/2025",
    method: "chat",
  },
];

// Helper to get professional by ID
export const getProfessionalById = (id: string): Professional | undefined => {
  return professionals.find((p) => p.id === id);
};

// Helper to get professionals by category
export const getProfessionalsByCategory = (
  category: string,
): Professional[] => {
  return professionals.filter((p) => p.category === category);
};

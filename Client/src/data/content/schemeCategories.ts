// src/data/content/schemeCategories.ts

export interface SchemeCategory {
  id: string;
  title: string;
  titleKey: string;
  icon: string;
  count: number;
  color: string;
}

export const schemeCategories: SchemeCategory[] = [
  {
    id: "financial-support",
    title: "Financial & Credit Support",
    titleKey: "schemesPage.categoriesList.financialSupport",
    icon: "💰",
    count: 0,
    color: "#FFF9E6",
  },
  {
    id: "agricultural-development",
    title: "Agricultural Development",
    titleKey: "schemesPage.categoriesList.agriculturalDevelopment",
    icon: "🌾",
    count: 0,
    color: "#FFF3E0",
  },
  {
    id: "soil-management",
    title: "Soil Management",
    titleKey: "schemesPage.categoriesList.soilManagement",
    icon: "🪴",
    count: 0,
    color: "#E3F2FD",
  },
  {
    id: "crop-insurance",
    title: "Crop Insurance",
    titleKey: "schemesPage.categoriesList.cropInsurance",
    icon: "🛡️",
    count: 0,
    color: "#FCE4EC",
  },
  {
    id: "animal-husbandry",
    title: "Animal Husbandry & Dairy",
    titleKey: "schemesPage.categoriesList.animalHusbandry",
    icon: "🐄",
    count: 0,
    color: "#F0FDFA",
  },
  {
    id: "training",
    title: "Training & Skill Development",
    titleKey: "schemesPage.categoriesList.training",
    icon: "🎓",
    count: 0,
    color: "#F3E8FF",
  },
  {
    id: "irrigation-water",
    title: "Irrigation & Water Management",
    titleKey: "schemesPage.categoriesList.irrigationWaterManagement",
    icon: "💧",
    count: 0,
    color: "#E0F7FA",
  },
  {
    id: "marketing-post-harvest",
    title: "Marketing & Post-Harvest",
    titleKey: "schemesPage.categoriesList.marketingPostHarvest",
    icon: "🛒",
    count: 0,
    color: "#FFF0F5",
  },
  {
    id: "farm-mechanization",
    title: "Farm Mechanization",
    titleKey: "schemesPage.categoriesList.farmMechanization",
    icon: "🚜",
    count: 0,
    color: "#FFEDD5",
  },
  {
    id: "fisheries",
    title: "Fisheries",
    titleKey: "schemesPage.categoriesList.fisheries",
    icon: "🐟",
    count: 0,
    color: "#E0F2FE",
  },
];


// Map category IDs to scheme categories for filtering
export const categoryToSchemeCategory: Record<string, string> = {
  "financial-support": "Financial Support",
  "agricultural-development": "Agricultural Development",
  "soil-management": "Soil Management",
  "crop-insurance": "Crop Insurance",
  "animal-husbandry": "Animal Husbandry & Dairy",
  "training": "Training",
  "irrigation-water": "Irrigation & Water Management",
  "marketing-post-harvest": "Marketing & Post-Harvest",
  "farm-mechanization": "Farm Mechanization",
  "fisheries": "Fisheries",
};

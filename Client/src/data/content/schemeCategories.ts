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
    count: 718,
    color: "#FFF9E6",
  },
  {
    id: "agricultural-development",
    title: "Agricultural Development",
    titleKey: "schemesPage.categoriesList.agriculturalDevelopment",
    icon: "🌾",
    count: 12,
    color: "#FFF3E0",
  },
  {
    id: "soil-management",
    title: "Soil Management",
    titleKey: "schemesPage.categoriesList.soilManagement",
    icon: "🪴",
    count: 8,
    color: "#E3F2FD",
  },
  {
    id: "crop-insurance",
    title: "Crop Insurance",
    titleKey: "schemesPage.categoriesList.cropInsurance",
    icon: "🛡️",
    count: 6,
    color: "#FCE4EC",
  },
];

// Map category IDs to scheme categories for filtering
export const categoryToSchemeCategory: Record<string, string> = {
  "financial-support": "Financial Support",
  "agricultural-development": "Agricultural Development",
  "soil-management": "Soil Management",
  "crop-insurance": "Crop Insurance",
};

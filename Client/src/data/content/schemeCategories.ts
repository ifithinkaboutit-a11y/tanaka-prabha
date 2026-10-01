// src/data/content/schemeCategories.ts
//
// Scheme categories are NOT hardcoded here — they come from the backend
// (GET /schemes/categories), which reads the distinct `category` values
// actually present in the schemes table. This file only provides *display*
// polish (icon, color, Hindi label) for category names we recognize, with a
// deterministic fallback for any category the backend returns that isn't
// in the lookup below, so a new category never goes unrepresented.

export interface CategoryPresentation {
  icon: string;
  color: string;
  label: string;
}

// Known category names (as stored in the DB) -> emoji + i18n key suffix.
// Matching is case-insensitive. Add an entry here purely for nicer display;
// nothing breaks if a real category is missing from this map.
const CATEGORY_ICON_MAP: Record<string, string> = {
  "agricultural development": "🌾",
  "education and skill development": "🎓",
  "environmental sustainability": "🌿",
  "financial inclusion": "💰",
  "health and sanitation": "🏥",
  "infrastructure development": "🏗️",
  "social welfare and empowerment": "🤝",
};

const CATEGORY_TITLE_KEY_MAP: Record<string, string> = {
  "agricultural development": "schemesPage.categoriesList.agriculturalDevelopment",
  "education and skill development": "schemesPage.categoriesList.educationSkillDevelopment",
  "environmental sustainability": "schemesPage.categoriesList.environmentalSustainability",
  "financial inclusion": "schemesPage.categoriesList.financialInclusion",
  "health and sanitation": "schemesPage.categoriesList.healthSanitation",
  "infrastructure development": "schemesPage.categoriesList.infrastructureDevelopment",
  "social welfare and empowerment": "schemesPage.categoriesList.socialWelfareEmpowerment",
};

// Pastel palette cycled (by a stable hash of the category name) for any
// category not in the map above, so colors stay consistent across renders
// without needing to know the category set in advance.
const COLOR_PALETTE = [
  "#FFF9E6", "#FFF3E0", "#E3F2FD", "#FCE4EC", "#F0FDFA",
  "#F3E8FF", "#E0F7FA", "#FFF0F5", "#FFEDD5", "#E0F2FE",
];

const DEFAULT_ICON = "📋";

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

/**
 * Resolve display icon/color/label for a real category name coming from the
 * API. `t` is optional — pass it to get a translated label for known
 * categories; without it (or for unknown categories) the raw name is used.
 */
export function getCategoryPresentation(
  categoryName: string,
  t?: (key: string) => string
): CategoryPresentation {
  const key = categoryName.trim().toLowerCase();
  const icon = CATEGORY_ICON_MAP[key] || DEFAULT_ICON;
  const color = COLOR_PALETTE[hashString(key) % COLOR_PALETTE.length];
  const titleKey = CATEGORY_TITLE_KEY_MAP[key];
  const label = titleKey && t ? t(titleKey) : categoryName;
  return { icon, color, label };
}

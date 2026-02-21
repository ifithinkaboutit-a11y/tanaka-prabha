// Content type enums
export const CONTENT_TYPES = {
    BANNER: "banner",
    SCHEME: "scheme",
};

// Professional categories
export const PROFESSIONAL_CATEGORIES = [
    "doctor",
    "veterinary",
    "agricultural",
    "legal",
    "financial",
];

// Status labels and colors
export const STATUS_CONFIG = {
    active: { label: "Active", color: "green" },
    inactive: { label: "Inactive", color: "gray" },
    published: { label: "Published", color: "green" },
    draft: { label: "Draft", color: "yellow" },
    unpublished: { label: "Unpublished", color: "gray" },
    available: { label: "Available", color: "green" },
    unavailable: { label: "Unavailable", color: "gray" },
    verified: { label: "Verified", color: "green" },
    pending: { label: "Pending", color: "amber" },
};

// India districts/states for selects
export const INDIA_STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
    "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
    "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
    "Delhi", "Jammu and Kashmir", "Ladakh", "Puducherry",
];

// Assam-specific districts (primary target region)
export const ASSAM_DISTRICTS = [
    "Baksa", "Barpeta", "Biswanath", "Bongaigaon", "Cachar", "Charaideo",
    "Chirang", "Darrang", "Dhemaji", "Dhubri", "Dibrugarh", "Dima Hasao",
    "Goalpara", "Golaghat", "Hailakandi", "Hojai", "Jorhat", "Kamrup",
    "Kamrup Metropolitan", "Karbi Anglong", "Karimganj", "Kokrajhar",
    "Lakhimpur", "Majuli", "Morigaon", "Nagaon", "Nalbari", "Sivasagar",
    "Sonitpur", "South Salmara-Mankachar", "Tinsukia", "Udalguri", "West Karbi Anglong",
];

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

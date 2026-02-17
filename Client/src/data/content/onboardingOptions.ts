// src/data/content/onboardingOptions.ts

export interface SelectOption {
  label: string;
  labelHi: string;
  value: string;
}

export const indianStates: SelectOption[] = [
  { value: "andhra_pradesh", label: "Andhra Pradesh", labelHi: "आंध्र प्रदेश" },
  {
    value: "arunachal_pradesh",
    label: "Arunachal Pradesh",
    labelHi: "अरुणाचल प्रदेश",
  },
  { value: "assam", label: "Assam", labelHi: "असम" },
  { value: "bihar", label: "Bihar", labelHi: "बिहार" },
  { value: "chhattisgarh", label: "Chhattisgarh", labelHi: "छत्तीसगढ़" },
  { value: "goa", label: "Goa", labelHi: "गोवा" },
  { value: "gujarat", label: "Gujarat", labelHi: "गुजरात" },
  { value: "haryana", label: "Haryana", labelHi: "हरियाणा" },
  {
    value: "himachal_pradesh",
    label: "Himachal Pradesh",
    labelHi: "हिमाचल प्रदेश",
  },
  { value: "jharkhand", label: "Jharkhand", labelHi: "झारखंड" },
  { value: "karnataka", label: "Karnataka", labelHi: "कर्नाटक" },
  { value: "kerala", label: "Kerala", labelHi: "केरल" },
  { value: "madhya_pradesh", label: "Madhya Pradesh", labelHi: "मध्य प्रदेश" },
  { value: "maharashtra", label: "Maharashtra", labelHi: "महाराष्ट्र" },
  { value: "manipur", label: "Manipur", labelHi: "मणिपुर" },
  { value: "meghalaya", label: "Meghalaya", labelHi: "मेघालय" },
  { value: "mizoram", label: "Mizoram", labelHi: "मिजोरम" },
  { value: "nagaland", label: "Nagaland", labelHi: "नागालैंड" },
  { value: "odisha", label: "Odisha", labelHi: "ओडिशा" },
  { value: "punjab", label: "Punjab", labelHi: "पंजाब" },
  { value: "rajasthan", label: "Rajasthan", labelHi: "राजस्थान" },
  { value: "sikkim", label: "Sikkim", labelHi: "सिक्किम" },
  { value: "tamil_nadu", label: "Tamil Nadu", labelHi: "तमिलनाडु" },
  { value: "telangana", label: "Telangana", labelHi: "तेलंगाना" },
  { value: "tripura", label: "Tripura", labelHi: "त्रिपुरा" },
  { value: "uttar_pradesh", label: "Uttar Pradesh", labelHi: "उत्तर प्रदेश" },
  { value: "uttarakhand", label: "Uttarakhand", labelHi: "उत्तराखंड" },
  { value: "west_bengal", label: "West Bengal", labelHi: "पश्चिम बंगाल" },
];

export const cropTypes: SelectOption[] = [
  { value: "wheat", label: "Wheat", labelHi: "गेहूं" },
  { value: "rice", label: "Rice", labelHi: "चावल" },
  { value: "maize", label: "Maize", labelHi: "मक्का" },
  { value: "sugarcane", label: "Sugarcane", labelHi: "गन्ना" },
  { value: "cotton", label: "Cotton", labelHi: "कपास" },
  { value: "soybean", label: "Soybean", labelHi: "सोयाबीन" },
  { value: "groundnut", label: "Groundnut", labelHi: "मूंगफली" },
  { value: "mustard", label: "Mustard", labelHi: "सरसों" },
  { value: "potato", label: "Potato", labelHi: "आलू" },
  { value: "onion", label: "Onion", labelHi: "प्याज" },
  { value: "tomato", label: "Tomato", labelHi: "टमाटर" },
  { value: "pulses", label: "Pulses", labelHi: "दालें" },
  { value: "vegetables", label: "Vegetables", labelHi: "सब्जियां" },
  { value: "fruits", label: "Fruits", labelHi: "फल" },
  { value: "other", label: "Other", labelHi: "अन्य" },
];

export const landUnits: SelectOption[] = [
  { value: "bigha", label: "Bigha", labelHi: "बीघा" },
  { value: "acre", label: "Acre", labelHi: "एकड़" },
  { value: "hectare", label: "Hectare", labelHi: "हेक्टेयर" },
];

export const genderOptions: SelectOption[] = [
  { value: "male", label: "Male", labelHi: "पुरुष" },
  { value: "female", label: "Female", labelHi: "महिला" },
  { value: "other", label: "Other", labelHi: "अन्य" },
];

export const animalTypes: SelectOption[] = [
  { value: "cow", label: "Cow", labelHi: "गाय" },
  { value: "buffalo", label: "Buffalo", labelHi: "भैंस" },
  { value: "goat", label: "Goat", labelHi: "बकरी" },
  { value: "sheep", label: "Sheep", labelHi: "भेड़" },
  { value: "pig", label: "Pig", labelHi: "सुअर" },
  { value: "poultry", label: "Poultry/Hen", labelHi: "मुर्गी" },
  { value: "horse", label: "Horse", labelHi: "घोड़ा" },
  { value: "other", label: "Other", labelHi: "अन्य" },
];

// Helper function to get localized options
export const getLocalizedOptions = (
  options: SelectOption[],
  language: string,
): { label: string; value: string }[] => {
  return options.map((opt) => ({
    value: opt.value,
    label: language === "hi" ? opt.labelHi : opt.label,
  }));
};

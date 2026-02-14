// src/utils/validation.ts
// Client-side validation utilities

/**
 * Validation result type
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validate Indian mobile number (10 digits starting with 6-9)
 */
export const validateMobileNumber = (mobile: string): ValidationResult => {
  const errors: string[] = [];
  
  // Remove any non-digit characters
  const cleaned = mobile.replace(/\D/g, "");
  
  if (!cleaned) {
    errors.push("Mobile number is required");
  } else if (cleaned.length !== 10) {
    errors.push("Mobile number must be exactly 10 digits");
  } else if (!/^[6-9]/.test(cleaned)) {
    errors.push("Mobile number must start with 6, 7, 8, or 9");
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate OTP (6 digits)
 */
export const validateOTP = (otp: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!otp) {
    errors.push("OTP is required");
  } else if (!/^\d{6}$/.test(otp)) {
    errors.push("OTP must be exactly 6 digits");
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate required text field
 */
export const validateRequired = (value: string, fieldName: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!value || !value.trim()) {
    errors.push(`${fieldName} is required`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate name field (min 2 chars, max 100 chars, only letters and spaces)
 */
export const validateName = (name: string, fieldName: string = "Name"): ValidationResult => {
  const errors: string[] = [];
  const trimmed = name?.trim() || "";
  
  if (!trimmed) {
    errors.push(`${fieldName} is required`);
  } else if (trimmed.length < 2) {
    errors.push(`${fieldName} must be at least 2 characters`);
  } else if (trimmed.length > 100) {
    errors.push(`${fieldName} must not exceed 100 characters`);
  } else if (!/^[a-zA-Z\s\u0900-\u097F]+$/.test(trimmed)) {
    // Allow English letters, spaces, and Hindi/Devanagari characters
    errors.push(`${fieldName} should only contain letters and spaces`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate Aadhaar number (12 digits)
 */
export const validateAadhaar = (aadhaar: string): ValidationResult => {
  const errors: string[] = [];
  const cleaned = aadhaar?.replace(/\D/g, "") || "";
  
  if (cleaned && cleaned.length !== 12) {
    errors.push("Aadhaar number must be exactly 12 digits");
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate PIN code (6 digits, doesn't start with 0)
 */
export const validatePinCode = (pinCode: string): ValidationResult => {
  const errors: string[] = [];
  const cleaned = pinCode?.replace(/\D/g, "") || "";
  
  if (cleaned) {
    if (cleaned.length !== 6) {
      errors.push("PIN code must be exactly 6 digits");
    } else if (cleaned.startsWith("0")) {
      errors.push("PIN code cannot start with 0");
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate age (1-120)
 */
export const validateAge = (age: number | string): ValidationResult => {
  const errors: string[] = [];
  const ageNum = typeof age === "string" ? parseInt(age, 10) : age;
  
  if (age !== undefined && age !== "" && age !== null) {
    if (isNaN(ageNum)) {
      errors.push("Age must be a number");
    } else if (ageNum < 1 || ageNum > 120) {
      errors.push("Age must be between 1 and 120");
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate land area (positive number)
 */
export const validateLandArea = (area: number | string): ValidationResult => {
  const errors: string[] = [];
  const areaNum = typeof area === "string" ? parseFloat(area) : area;
  
  if (area !== undefined && area !== "" && area !== null) {
    if (isNaN(areaNum)) {
      errors.push("Land area must be a number");
    } else if (areaNum < 0) {
      errors.push("Land area cannot be negative");
    } else if (areaNum > 10000) {
      errors.push("Land area seems too large. Please verify.");
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate livestock count (non-negative integer)
 */
export const validateLivestockCount = (count: number | string): ValidationResult => {
  const errors: string[] = [];
  const countNum = typeof count === "string" ? parseInt(count, 10) : count;
  
  if (count !== undefined && count !== "" && count !== null) {
    if (isNaN(countNum)) {
      errors.push("Count must be a number");
    } else if (countNum < 0) {
      errors.push("Count cannot be negative");
    } else if (!Number.isInteger(countNum)) {
      errors.push("Count must be a whole number");
    } else if (countNum > 10000) {
      errors.push("Count seems too large. Please verify.");
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate family member count (non-negative integer, max 50)
 */
export const validateFamilyCount = (count: number | string): ValidationResult => {
  const errors: string[] = [];
  const countNum = typeof count === "string" ? parseInt(count, 10) : count;
  
  if (count !== undefined && count !== "" && count !== null) {
    if (isNaN(countNum)) {
      errors.push("Count must be a number");
    } else if (countNum < 0) {
      errors.push("Count cannot be negative");
    } else if (!Number.isInteger(countNum)) {
      errors.push("Count must be a whole number");
    } else if (countNum > 50) {
      errors.push("Family member count seems too large. Please verify.");
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Personal details validation
 */
export interface PersonalDetailsInput {
  fathersName?: string;
  mothersName?: string;
  village?: string;
  district?: string;
  state?: string;
  pinCode?: string;
  educationalQualification?: string;
  sonsMarried?: number;
  sonsUnmarried?: number;
  daughtersMarried?: number;
  daughtersUnmarried?: number;
  otherFamilyMembers?: number;
}

export const validatePersonalDetails = (data: PersonalDetailsInput): ValidationResult => {
  const errors: string[] = [];
  
  // Father's name is required
  if (!data.fathersName?.trim()) {
    errors.push("Father's name is required");
  } else {
    const nameValidation = validateName(data.fathersName, "Father's name");
    errors.push(...nameValidation.errors);
  }
  
  // Mother's name (optional but validate if provided)
  if (data.mothersName?.trim()) {
    const nameValidation = validateName(data.mothersName, "Mother's name");
    errors.push(...nameValidation.errors);
  }
  
  // State is required
  if (!data.state?.trim()) {
    errors.push("State is required");
  }
  
  // PIN code validation (optional but validate format if provided)
  if (data.pinCode) {
    const pinValidation = validatePinCode(data.pinCode);
    errors.push(...pinValidation.errors);
  }
  
  // Family count validations
  const familyFields = [
    { value: data.sonsMarried, name: "Sons (married)" },
    { value: data.sonsUnmarried, name: "Sons (unmarried)" },
    { value: data.daughtersMarried, name: "Daughters (married)" },
    { value: data.daughtersUnmarried, name: "Daughters (unmarried)" },
    { value: data.otherFamilyMembers, name: "Other family members" },
  ];
  
  familyFields.forEach(({ value, name }) => {
    if (value !== undefined && value !== null) {
      const validation = validateFamilyCount(value);
      if (!validation.isValid) {
        errors.push(...validation.errors.map(e => `${name}: ${e}`));
      }
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Land entry validation
 */
export interface LandEntryInput {
  area: number;
  unit: string;
  crops: string[];
}

export const validateLandEntry = (entry: LandEntryInput): ValidationResult => {
  const errors: string[] = [];
  
  // Area validation
  if (entry.area === undefined || entry.area === null) {
    errors.push("Land area is required");
  } else {
    const areaValidation = validateLandArea(entry.area);
    errors.push(...areaValidation.errors);
    
    if (entry.area <= 0) {
      errors.push("Land area must be greater than 0");
    }
  }
  
  // Unit validation
  if (!entry.unit) {
    errors.push("Land unit is required");
  }
  
  // Crops validation
  if (!entry.crops || entry.crops.length === 0) {
    errors.push("At least one crop must be selected");
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Livestock entry validation
 */
export interface LivestockEntryInput {
  type: string;
  count: number;
}

export const validateLivestockEntry = (entry: LivestockEntryInput): ValidationResult => {
  const errors: string[] = [];
  
  // Type validation
  if (!entry.type) {
    errors.push("Animal type is required");
  }
  
  // Count validation
  if (entry.count === undefined || entry.count === null) {
    errors.push("Animal count is required");
  } else {
    const countValidation = validateLivestockCount(entry.count);
    errors.push(...countValidation.errors);
    
    if (entry.count <= 0) {
      errors.push("Animal count must be greater than 0");
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Combine multiple validation results
 */
export const combineValidations = (...results: ValidationResult[]): ValidationResult => {
  const allErrors = results.flatMap(r => r.errors);
  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
  };
};

// src/services/apiService.ts
import AsyncStorage from "@react-native-async-storage/async-storage";

// API Configuration
const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL;

// Log API URL on startup for debugging
console.log("🔗 API Base URL:", API_BASE_URL);

if (!process.env.EXPO_PUBLIC_API_URL) {
  console.warn(
    "⚠️ EXPO_PUBLIC_API_URL is not set! Using hardcoded fallback. " +
    "Set it in eas.json env or .env file."
  );
}

// Storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: "auth_token",
  USER_DATA: "user_data",
  REFRESH_TOKEN: "refresh_token",
} as const;

// Types
export interface ApiResponse<T = any> {
  status: "success" | "error";
  message: string;
  data?: T;
  error?: string;
}

export interface User {
  id: string;
  name: string;
  mobileNumber?: string;
  age?: number;
  village?: string;
  district?: string;
  state?: string;
  gender?: string;
  date_of_birth?: string;
  fathersName?: string;
  mothersName?: string;
  /** Snake_case aliases — returned directly from backend in some responses */
  fathers_name?: string;
  mothers_name?: string;
  educationalQualification?: string;
  block?: string;
  tehsil?: string;
  pinCode?: string;
  photoUrl?: string;
  isNewUser?: boolean;
  /** Snake_case alias — returned directly from /auth/verify-otp and /auth/verify-token */
  is_new_user?: boolean;
  is_verified?: boolean;
  /** Snake_case alias for mobile number — returned by some backend responses */
  mobile_number?: string;
}

export interface AuthData {
  user: User;
  token: string;
  token_type: string;
  is_new_user: boolean;
}

export interface SendOTPResponse {
  mobile_number: string;
  expires_in: string;
  otp?: string; // Only in development mode
}

export interface VerifyOTPResponse {
  user: User;
  token: string;
  token_type: string;
  is_new_user: boolean;
}

// Error class for API errors
export class ApiError extends Error {
  status: number;
  data?: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

// Token management
export const tokenManager = {
  async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    } catch (error) {
      console.error("Error getting token:", error);
      return null;
    }
  },

  async setToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    } catch (error) {
      console.error("Error setting token:", error);
      throw error;
    }
  },

  async removeToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    } catch (error) {
      console.error("Error removing token:", error);
      throw error;
    }
  },

  async getUser(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      if (!userData) return null;
      const parsed: User = JSON.parse(userData);
      // Normalize backend snake_case field → camelCase at read time,
      // so existing cached sessions work without needing a fresh login.
      if (!parsed.mobileNumber && parsed.mobile_number) {
        parsed.mobileNumber = parsed.mobile_number;
      }
      return parsed;
    } catch (error) {
      console.error("Error getting user:", error);
      return null;
    }
  },


  async setUser(user: User): Promise<void> {
    try {
      // Normalize snake_case mobile_number → camelCase mobileNumber so every
      // consumer of user.mobileNumber gets the right value regardless of which
      // auth route returned the user object.
      const normalized: User = {
        ...user,
        mobileNumber: user.mobileNumber || user.mobile_number,
      };
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(normalized));
    } catch (error) {
      console.error("Error setting user:", error);
      throw error;
    }
  },


  async removeUser(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
    } catch (error) {
      console.error("Error removing user:", error);
      throw error;
    }
  },

  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.AUTH_TOKEN,
        STORAGE_KEYS.USER_DATA,
        STORAGE_KEYS.REFRESH_TOKEN,
      ]);
    } catch (error) {
      console.error("Error clearing auth data:", error);
      throw error;
    }
  },
};

// Base fetch wrapper with auth handling and automatic retry for cold starts
async function fetchWithAuth<T>(
  endpoint: string,
  options: RequestInit = {},
  _retryCount = 0
): Promise<ApiResponse<T>> {
  const MAX_RETRIES = 1; // retry once on timeout (covers Render cold-start)
  const url = `${API_BASE_URL}${endpoint}`;

  console.log(`📤 API Request: ${options.method || "GET"} ${url}${_retryCount ? ` (retry #${_retryCount})` : ""}`);
  if (options.body) {
    console.log("📦 Request Body:", options.body);
  }

  // Get auth token
  const token = await tokenManager.getToken();

  // Build headers
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  try {
    // 50-second timeout to handle Render free-tier cold starts (~30-40s)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 50000);

    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const data = await response.json();
    console.log(`📥 API Response (${response.status}):`, JSON.stringify(data).slice(0, 200));

    if (!response.ok) {
      throw new ApiError(
        data.message || "Request failed",
        response.status,
        data
      );
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      console.error(`❌ API Error: ${error.message}`);
      throw error;
    }

    // Network or timeout error — retry once for Render cold starts
    const isTimeout = error instanceof Error && error.name === "AbortError";
    const isNetworkError =
      error instanceof Error &&
      (error.message.includes("Network request failed") ||
        error.message.includes("Failed to fetch"));

    if ((isTimeout || isNetworkError) && _retryCount < MAX_RETRIES) {
      console.log(`🔄 Server may be waking up — retrying in 3s... (attempt ${_retryCount + 1}/${MAX_RETRIES})`);
      await new Promise((r) => setTimeout(r, 3000));
      return fetchWithAuth<T>(endpoint, options, _retryCount + 1);
    }

    console.error("❌ API Request Error:", error);
    const message = isTimeout
      ? "Request timed out — the server may be starting up, please try again"
      : error instanceof Error
        ? error.message
        : "Network error";
    throw new ApiError(message, 0);
  }
}

// Auth API endpoints
export const authApi = {
  /**
   * Send OTP to mobile number
   * @param mobile_number - 10-digit Indian mobile number
   */
  async sendOTP(mobile_number: string, language = 'en'): Promise<ApiResponse<SendOTPResponse>> {
    return fetchWithAuth<SendOTPResponse>("/auth/send-otp", {
      method: "POST",
      body: JSON.stringify({ mobile_number, language }),
    });
  },

  /**
   * Verify OTP and authenticate user
   * @param mobile_number - Phone number that received OTP
   * @param otp - 6-digit OTP code
   */
  async verifyOTP(
    mobile_number: string,
    otp: string
  ): Promise<ApiResponse<VerifyOTPResponse>> {
    return fetchWithAuth<VerifyOTPResponse>("/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify({ mobile_number, otp }),
    });
  },

  /**
   * Resend OTP to mobile number
   * @param mobile_number - Phone number to resend OTP to
   */
  async resendOTP(mobile_number: string, language = 'en'): Promise<ApiResponse<SendOTPResponse>> {
    return fetchWithAuth<SendOTPResponse>("/auth/resend-otp", {
      method: "POST",
      body: JSON.stringify({ mobile_number, language }),
    });
  },

  /**
   * Verify current token and get user info
   */
  async verifyToken(): Promise<ApiResponse<{ user: User }>> {
    return fetchWithAuth<{ user: User }>("/auth/verify-token", {
      method: "GET",
    });
  },

  /**
   * Login with mobile number + password (no OTP)
   */
  async loginWithPassword(mobile_number: string, password: string): Promise<ApiResponse<VerifyOTPResponse>> {
    return fetchWithAuth<VerifyOTPResponse>("/auth/login-with-password", {
      method: "POST",
      body: JSON.stringify({ mobile_number, password }),
    });
  },

  /**
   * Set or reset password for the current user (call after OTP verification)
   */
  async setPassword(mobile_number: string, password: string): Promise<ApiResponse<void>> {
    return fetchWithAuth<void>("/auth/set-password", {
      method: "POST",
      body: JSON.stringify({ mobile_number, password }),
    });
  },

  /**
   * Send OTP for forgot-password flow
   */
  async forgotPassword(mobile_number: string, language = 'en'): Promise<ApiResponse<SendOTPResponse>> {
    return fetchWithAuth<SendOTPResponse>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ mobile_number, language }),
    });
  },
};

// User API endpoints
// ============================================================
// User API Helpers
// ============================================================

function convertApiUserToUserProfile(apiUser: ApiUserProfile): UserProfile {
  return {
    id: apiUser.id,
    name: apiUser.name,
    age: apiUser.age,
    gender: apiUser.gender,
    photoUrl: apiUser.photo_url,
    mobileNumber: apiUser.mobile_number,
    aadhaarNumber: apiUser.aadhaar_number,
    fathersName: apiUser.fathers_name,
    mothersName: apiUser.mothers_name,
    educationalQualification: apiUser.educational_qualification,
    sonsMarried: apiUser.sons_married,
    sonsUnmarried: apiUser.sons_unmarried,
    daughtersMarried: apiUser.daughters_married,
    daughtersUnmarried: apiUser.daughters_unmarried,
    otherFamilyMembers: apiUser.other_family_members,
    village: apiUser.village,
    gramPanchayat: apiUser.gram_panchayat,
    nyayPanchayat: apiUser.nyay_panchayat,
    postOffice: apiUser.post_office,
    tehsil: apiUser.tehsil,
    block: apiUser.block,
    district: apiUser.district,
    pinCode: apiUser.pin_code,
    state: apiUser.state,
    location: apiUser.location,
    landDetails: apiUser.land_details
      ? {
        totalLandArea: apiUser.land_details.total_land_area,
        rabiCrop: apiUser.land_details.rabi_crop,
        kharifCrop: apiUser.land_details.kharif_crop,
        zaidCrop: apiUser.land_details.zaid_crop,
        latitude: apiUser.land_details.latitude,
        longitude: apiUser.land_details.longitude,
        locationAddress: apiUser.land_details.location_address,
      }
      : undefined,
    livestockDetails: apiUser.livestock_details
      ? {
        cow: apiUser.livestock_details.cow,
        buffalo: apiUser.livestock_details.buffalo,
        goat: apiUser.livestock_details.goat,
        sheep: apiUser.livestock_details.sheep,
        pig: apiUser.livestock_details.pig,
        poultry: apiUser.livestock_details.poultry,
        others: apiUser.livestock_details.others,
      }
      : undefined,
    isNewUser: apiUser.is_new_user,
  };
}

export const userApi = {
  /**
   * Get current user profile with land and livestock details
   */
  async getProfile(): Promise<ApiResponse<{ user: UserProfile }>> {
    const response = await fetchWithAuth<{ user: ApiUserProfile }>("/users/profile", {
      method: "GET",
    });
    if (response.data?.user) {
      return {
        ...response,
        data: {
          user: convertApiUserToUserProfile(response.data.user),
        },
      };
    }
    return response as unknown as ApiResponse<{ user: UserProfile }>;
  },

  /**
   * Update user profile (includes land and livestock details)
   */
  async updateProfile(
    userData: Partial<UserProfileUpdate>
  ): Promise<ApiResponse<{ user: UserProfile }>> {
    const response = await fetchWithAuth<{ user: ApiUserProfile }>("/users/profile", {
      method: "PUT",
      body: JSON.stringify(userData),
    });
    if (response.data?.user) {
      return {
        ...response,
        data: {
          user: convertApiUserToUserProfile(response.data.user),
        },
      };
    }
    return response as unknown as ApiResponse<{ user: UserProfile }>;
  },

  /**
   * Look up a user by their mobile number (for admin mark-attendance flow)
   */
  async lookupByMobile(mobile_number: string): Promise<UserProfile | null> {
    try {
      const response = await fetchWithAuth<{ users: ApiUserProfile[] }>(
        `/users?search=${encodeURIComponent(mobile_number)}&limit=1`
      );
      const users = response.data?.users || [];
      if (users.length === 0) return null;
      return convertApiUserToUserProfile(users[0]);
    } catch {
      return null;
    }
  },
};

// ============================================================
// Upload API
// ============================================================

export const uploadApi = {
  /**
   * Upload a user avatar photo to Cloudinary via the backend.
   * @param imageUri - Local file URI from expo-image-picker
   * @returns Cloudinary URL of the uploaded image
   */
  async uploadUserPhoto(imageUri: string): Promise<string> {
    const token = await tokenManager.getToken();
    const url = `${API_BASE_URL}/upload/user-photo`;

    const formData = new FormData();
    const filename = imageUri.split('/').pop() ?? 'photo.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';
    formData.append('photo', { uri: imageUri, name: filename, type } as any);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        // Do NOT set Content-Type — let fetch set multipart boundary automatically
      },
      body: formData,
    });

    const data = await response.json();
    if (!response.ok || data.status !== 'success') {
      throw new Error(data.message || 'Failed to upload photo');
    }
    return data.data.url as string;
  },

  /**
   * Upload a professional profile image to Cloudinary via the backend.
   * @param imageUri - Local file URI from expo-image-picker
   * @returns Cloudinary URL of the uploaded image
   */
  async uploadProfessionalPhoto(imageUri: string): Promise<string> {
    const token = await tokenManager.getToken();
    const url = `${API_BASE_URL}/upload/professional`;

    const formData = new FormData();
    const filename = imageUri.split('/').pop() ?? 'image.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';
    formData.append('image', { uri: imageUri, name: filename, type } as any);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();
    if (!response.ok || data.status !== 'success') {
      throw new Error(data.message || 'Failed to upload photo');
    }
    return data.data.url as string;
  },

  /**
   * Upload an event hero image to Cloudinary via the backend.
   * @param imageUri - Local file URI from expo-image-picker
   * @returns Cloudinary URL of the uploaded image
   */
  async uploadEventImage(imageUri: string): Promise<string> {
    const token = await tokenManager.getToken();
    const url = `${API_BASE_URL}/upload/general`;

    const formData = new FormData();
    const filename = imageUri.split('/').pop() ?? 'event.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';
    formData.append('file', { uri: imageUri, name: filename, type } as any);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();
    if (!response.ok || data.status !== 'success') {
      throw new Error(data.message || 'Failed to upload event image');
    }
    return data.data.url as string;
  },
};

// ============================================================
// User Profile Types (Extended)
// ============================================================

export interface ApiLandDetails {
  id?: string;
  user_id?: string;
  total_land_area?: number;
  rabi_crop?: string;
  kharif_crop?: string;
  zaid_crop?: string;
  latitude?: number;
  longitude?: number;
  location_address?: string;
}

export interface ApiLivestockDetails {
  id?: string;
  user_id?: string;
  cow?: number;
  buffalo?: number;
  goat?: number;
  sheep?: number;
  pig?: number;
  poultry?: number;
  others?: number;
}

export interface ApiUserProfile {
  id: string;
  name: string;
  age?: number;
  gender?: string;
  photo_url?: string;
  mobile_number: string;
  aadhaar_number?: string;
  fathers_name?: string;
  mothers_name?: string;
  educational_qualification?: string;
  sons_married?: number;
  sons_unmarried?: number;
  daughters_married?: number;
  daughters_unmarried?: number;
  other_family_members?: number;
  village?: string;
  gram_panchayat?: string;
  nyay_panchayat?: string;
  post_office?: string;
  tehsil?: string;
  block?: string;
  district?: string;
  pin_code?: string;
  state?: string;
  location?: any;
  land_details?: ApiLandDetails;
  livestock_details?: ApiLivestockDetails;
  is_new_user?: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  age?: number;
  gender?: string;
  photoUrl?: string;
  mobileNumber: string;
  aadhaarNumber?: string;
  fathersName?: string;
  mothersName?: string;
  educationalQualification?: string;
  sonsMarried?: number;
  sonsUnmarried?: number;
  daughtersMarried?: number;
  daughtersUnmarried?: number;
  otherFamilyMembers?: number;
  village?: string;
  gramPanchayat?: string;
  nyayPanchayat?: string;
  postOffice?: string;
  tehsil?: string;
  block?: string;
  district?: string;
  pinCode?: string;
  state?: string;
  location?: any;
  landDetails?: {
    totalLandArea?: number;
    rabiCrop?: string;
    kharifCrop?: string;
    zaidCrop?: string;
    latitude?: number;
    longitude?: number;
    locationAddress?: string;
  };
  livestockDetails?: {
    cow?: number;
    buffalo?: number;
    goat?: number;
    sheep?: number;
    pig?: number;
    poultry?: number;
    others?: number;
  };
  isNewUser?: boolean;
}

export interface UserProfileUpdate {
  name?: string;
  age?: number;
  gender?: string;
  photo_url?: string;
  aadhaar_number?: string;
  fathers_name?: string;
  mothers_name?: string;
  educational_qualification?: string;
  sons_married?: number;
  sons_unmarried?: number;
  daughters_married?: number;
  daughters_unmarried?: number;
  other_family_members?: number;
  village?: string;
  gram_panchayat?: string;
  nyay_panchayat?: string;
  post_office?: string;
  tehsil?: string;
  block?: string;
  district?: string;
  pin_code?: string;
  state?: string;
  /** GPS-confirmed location from the location picker screen */
  location?: {
    lat: number;
    lng: number;
    address: string;
    accuracy: number;
    setAt: string;
    method: 'gps' | 'skipped';
  };
  land_details?: ApiLandDetails;
  livestock_details?: ApiLivestockDetails;
}

// ============================================================
// Utility: Snake case to camelCase converter
// ============================================================

function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

function convertKeysToCamelCase<T>(obj: any): T {
  if (Array.isArray(obj)) {
    return obj.map((item) => convertKeysToCamelCase(item)) as T;
  }
  if (obj !== null && typeof obj === "object") {
    return Object.keys(obj).reduce((result, key) => {
      const camelKey = toCamelCase(key);
      (result as any)[camelKey] = convertKeysToCamelCase(obj[key]);
      return result;
    }, {} as T);
  }
  return obj;
}

// ============================================================
// Banner Types
// ============================================================

export interface ApiBanner {
  id: string;
  title: string;
  subtitle?: string;
  title_hi?: string;
  subtitle_hi?: string;
  image_url: string;
  redirect_url?: string;
  sort_order?: number;
  is_active?: boolean;
  created_at?: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  titleHi?: string;
  subtitleHi?: string;
  imageUrl: string;
  redirectUrl?: string;
  sortOrder?: number;
  isActive?: boolean;
  createdAt?: string;
}

// ============================================================
// Scheme Types
// ============================================================

export interface ApiScheme {
  id: string;
  title: string;
  description?: string;
  title_hi?: string;
  description_hi?: string;
  overview_hi?: string;
  process_hi?: string;
  eligibility?: string;
  eligibility_hi?: string;
  key_objectives_hi?: string[];
  category: string;
  image_url?: string;
  hero_image_url?: string;
  location?: string;
  event_date?: string;
  key_objectives?: string[];
  overview?: string;
  process?: string;
  support_contact?: string;
  apply_url?: string;
  is_active?: boolean;
  created_at?: string;
}

export interface Scheme {
  id: string;
  title: string;
  description?: string;
  titleHi?: string;
  descriptionHi?: string;
  overviewHi?: string;
  processHi?: string;
  eligibility?: string;
  eligibilityHi?: string;
  keyObjectivesHi?: string[];
  category: string;
  imageUrl?: string;
  heroImageUrl?: string;
  location?: string;
  eventDate?: string;
  keyObjectives?: string[];
  overview?: string;
  process?: string;
  supportContact?: string;
  applyUrl?: string;
  isActive?: boolean;
  createdAt?: string;
}

// ============================================================
// Banners API
// ============================================================

export const bannersApi = {
  /**
   * Get all active banners
   */
  async getAll(): Promise<Banner[]> {
    const response = await fetchWithAuth<{ banners: ApiBanner[] }>(
      "/banners?active_only=true"
    );
    return convertKeysToCamelCase<Banner[]>(response.data?.banners || []);
  },

  /**
   * Get banner by ID
   */
  async getById(id: string): Promise<Banner | null> {
    const response = await fetchWithAuth<{ banner: ApiBanner }>(
      `/banners/${id}`
    );
    return response.data?.banner
      ? convertKeysToCamelCase<Banner>(response.data.banner)
      : null;
  },
};

// ============================================================
// Events API
// ============================================================

export interface ApiEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  start_time: string;
  end_time: string;
  location_name: string;
  location_address?: string;
  guidelines_and_rules?: string;
  requirements?: string;
  hero_image_url?: string;
  status: string;
}

export const eventsApi = {
  getAll: async (): Promise<ApiEvent[]> => {
    try {
      const response = await fetchWithAuth<{ events: ApiEvent[] }>("/events");
      return response.data?.events || [];
    } catch (error) {
      console.error("Error fetching events:", error);
      return [];
    }
  },

  getById: async (id: string): Promise<ApiEvent | null> => {
    try {
      const response = await fetchWithAuth<{ event: ApiEvent }>(`/events/${id}`);
      return response.data?.event || null;
    } catch (error) {
      console.error("Error fetching event:", error);
      return null;
    }
  },

  register: async (id: string, mobile_number: string, name?: string): Promise<any> => {
    // Strip any 91/+91 prefix — always send a clean 10-digit number
    const cleanMobile = mobile_number.replace(/^\+?91/, "").replace(/\D/g, "").slice(-10);
    return await fetchWithAuth(`/events/${id}/register`, {
      method: "POST",
      body: JSON.stringify({ mobile_number: cleanMobile, name }),
    });
  },

  create: async (eventData: Partial<ApiEvent>): Promise<ApiResponse<{ event: ApiEvent }>> => {
    return await fetchWithAuth<{ event: ApiEvent }>("/events", {
      method: "POST",
      body: JSON.stringify(eventData),
    });
  },

  getAttendees: async (eventId: string): Promise<any[]> => {
    try {
      const response = await fetchWithAuth<{ participants: any[] }>(`/events/${eventId}/participants`);
      return response.data?.participants || [];
    } catch (error) {
      console.error("Error fetching attendees:", error);
      return [];
    }
  },

  markAttendance: async (eventId: string, mobile_number: string, status: "present" | "absent", name?: string): Promise<any> => {
    // Strip any 91/+91 prefix — always send a clean 10-digit number
    const cleanMobile = mobile_number.replace(/^\+?91/, "").replace(/\D/g, "").slice(-10);
    return await fetchWithAuth(`/events/${eventId}/attendance`, {
      method: "POST",
      body: JSON.stringify({ mobile_number: cleanMobile, status, name }),
    });
  },
};



// ============================================================
// Schemes API
// ============================================================

export const schemesApi = {
  /**
   * Get all active schemes
   */
  async getAll(params?: {
    limit?: number;
    offset?: number;
    category?: string;
    search?: string;
  }): Promise<Scheme[]> {
    const queryParams = new URLSearchParams();
    queryParams.set("active_only", "true");
    if (params?.limit) queryParams.set("limit", params.limit.toString());
    if (params?.offset) queryParams.set("offset", params.offset.toString());
    if (params?.category) queryParams.set("category", params.category);
    if (params?.search) queryParams.set("search", params.search);

    const response = await fetchWithAuth<{ schemes: ApiScheme[] }>(
      `/schemes?${queryParams.toString()}`
    );
    return convertKeysToCamelCase<Scheme[]>(response.data?.schemes || []);
  },

  /**
   * Get scheme by ID
   */
  async getById(id: string): Promise<Scheme | null> {
    const response = await fetchWithAuth<{ scheme: ApiScheme }>(
      `/schemes/${id}`
    );
    return response.data?.scheme
      ? convertKeysToCamelCase<Scheme>(response.data.scheme)
      : null;
  },

  /**
   * Get scheme categories
   */
  async getCategories(): Promise<string[]> {
    const response = await fetchWithAuth<{ categories: string[] }>(
      "/schemes/categories"
    );
    return response.data?.categories || [];
  },

  /**
   * Search schemes
   */
  async search(query: string, limit = 20): Promise<Scheme[]> {
    const response = await fetchWithAuth<{ schemes: ApiScheme[] }>(
      `/schemes?search=${encodeURIComponent(query)}&limit=${limit}`
    );
    return convertKeysToCamelCase<Scheme[]>(response.data?.schemes || []);
  },
};

// ============================================================
// Professional Types
// ============================================================

export interface ApiProfessional {
  id: string;
  name: string;
  role: string;
  department?: string;
  category: string;
  image_url?: string;
  phone_number?: string;
  district?: string;
  service_area?: {
    district?: string;
    blocks?: string[];
    state?: string;
  };
  specializations?: string[];
  is_available?: boolean;
  created_at?: string;
}

export interface Professional {
  id: string;
  name: string;
  role: string;
  roleKey?: string;
  department?: string;
  departmentKey?: string;
  category: string;
  imageUrl?: string;
  phone?: string;
  district?: string;
  serviceArea?: {
    district?: string;
    blocks?: string[];
    state?: string;
  };
  specializations?: string[];
  specializationsKeys?: string[];
  isAvailable?: boolean;
  createdAt?: string;
}

// ============================================================
// Professionals API
// ============================================================

export const professionalsApi = {
  /**
   * Get all professionals with filters
   */
  async getAll(params?: {
    limit?: number;
    offset?: number;
    category?: string;
    district?: string;
    department?: string;
    search?: string;
    available_only?: boolean;
  }): Promise<Professional[]> {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.set("limit", params.limit.toString());
    if (params?.offset) queryParams.set("offset", params.offset.toString());
    if (params?.category) queryParams.set("category", params.category);
    if (params?.district) queryParams.set("district", params.district);
    if (params?.department) queryParams.set("department", params.department);
    if (params?.search) queryParams.set("search", params.search);
    if (params?.available_only) queryParams.set("available_only", "true");

    const response = await fetchWithAuth<{ professionals: ApiProfessional[] }>(
      `/professionals?${queryParams.toString()}`
    );

    // Convert and add translation keys
    const professionals = response.data?.professionals || [];
    return professionals.map((p) => ({
      id: p.id,
      name: p.name,
      role: p.role,
      roleKey: `connect.roles.${p.role.toLowerCase().replace(/\s+/g, "")}`,
      department: p.department,
      departmentKey: p.department
        ? `connect.departments.${p.department.toLowerCase().replace(/\s+/g, "")}`
        : undefined,
      category: p.category,
      imageUrl: p.image_url,
      phone: p.phone_number,
      district: p.district,
      serviceArea: p.service_area,
      specializations: p.specializations,
      specializationsKeys: p.specializations?.map(
        (s) => `connect.specializations.${s.toLowerCase().replace(/\s+/g, "")}`
      ),
      isAvailable: p.is_available,
      createdAt: p.created_at,
    }));
  },

  /**
   * Get professional by ID
   */
  async getById(id: string): Promise<Professional | null> {
    const response = await fetchWithAuth<{ professional: ApiProfessional }>(
      `/professionals/${id}`
    );
    const p = response.data?.professional;
    if (!p) return null;

    return {
      id: p.id,
      name: p.name,
      role: p.role,
      roleKey: `connect.roles.${p.role.toLowerCase().replace(/\s+/g, "")}`,
      department: p.department,
      departmentKey: p.department
        ? `connect.departments.${p.department.toLowerCase().replace(/\s+/g, "")}`
        : undefined,
      category: p.category,
      imageUrl: p.image_url,
      phone: p.phone_number,
      district: p.district,
      serviceArea: p.service_area,
      specializations: p.specializations,
      specializationsKeys: p.specializations?.map(
        (s) => `connect.specializations.${s.toLowerCase().replace(/\s+/g, "")}`
      ),
      isAvailable: p.is_available,
      createdAt: p.created_at,
    };
  },

  /**
   * Get professionals by category
   */
  async getByCategory(category: string, limit = 20): Promise<Professional[]> {
    return this.getAll({ category, limit });
  },

  /**
   * Search professionals
   */
  async search(query: string, limit = 20): Promise<Professional[]> {
    return this.getAll({ search: query, limit });
  },
};

// ============================================================
// Notification Types
// ============================================================

export interface ApiNotification {
  id: string;
  user_id: string;
  type: "approval" | "reminder" | "alert" | "announcement" | "info" | "update";
  title: string;
  message?: string;
  is_read: boolean;
  icon_name?: string;
  bg_color?: string;
  created_at: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: "approval" | "reminder" | "alert" | "announcement" | "info" | "update";
  title: string;
  titleKey?: string;
  description?: string;
  descriptionKey?: string;
  time: string;
  date: Date;
  isRead: boolean;
  icon: string;
  iconBgColor: string;
}

// ============================================================
// Notifications API
// ============================================================

export const notificationsApi = {
  /**
   * Register push notification token
   */
  async registerToken(pushToken: string, platform: string): Promise<void> {
    await fetchWithAuth("/notifications/register-token", {
      method: "POST",
      body: JSON.stringify({ push_token: pushToken, platform }),
    });
  },

  /**
   * Get current user's notifications
   */
  async getMy(params?: {
    limit?: number;
    offset?: number;
    unread_only?: boolean;
  }): Promise<Notification[]> {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.set("limit", params.limit.toString());
    if (params?.offset) queryParams.set("offset", params.offset.toString());
    if (params?.unread_only) queryParams.set("unread_only", "true");

    const response = await fetchWithAuth<{ notifications: ApiNotification[] }>(
      `/notifications/my?${queryParams.toString()}`
    );

    const notifications = response.data?.notifications || [];
    return notifications.map((n) => {
      const createdDate = new Date(n.created_at);
      return {
        id: n.id,
        userId: n.user_id,
        type: n.type,
        title: n.title,
        titleKey: `notifications.${n.type}`,
        description: n.message,
        descriptionKey: `notifications.${n.type}Desc`,
        time: createdDate.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }),
        date: createdDate,
        isRead: n.is_read,
        icon: n.icon_name || getDefaultIcon(n.type),
        iconBgColor: n.bg_color || getDefaultBgColor(n.type),
      };
    });
  },

  /**
   * Mark a notification as read
   */
  async markAsRead(id: string): Promise<void> {
    await fetchWithAuth(`/notifications/${id}/read`, {
      method: "PATCH",
    });
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<void> {
    await fetchWithAuth("/notifications/my/read-all", {
      method: "PATCH",
    });
  },

  /**
   * Delete a notification
   */
  async delete(id: string): Promise<void> {
    await fetchWithAuth(`/notifications/${id}`, {
      method: "DELETE",
    });
  },

  /**
   * Get unread notification count
   */
  async getUnreadCount(): Promise<number> {
    try {
      const unread = await this.getMy({ unread_only: true, limit: 100 });
      return unread.length;
    } catch {
      return 0;
    }
  },
};

// Helper functions for notification defaults
function getDefaultIcon(type: string): string {
  const icons: Record<string, string> = {
    approval: "card-outline",
    reminder: "time-outline",
    alert: "rainy-outline",
    announcement: "megaphone-outline",
    info: "information-circle-outline",
    update: "refresh-circle-outline",
  };
  return icons[type] || "notifications-outline";
}

function getDefaultBgColor(type: string): string {
  const colors: Record<string, string> = {
    approval: "#E3F2FD",
    reminder: "#FCE4EC",
    alert: "#FFF3E0",
    announcement: "#E8F5E9",
    info: "#E0F2FE",
    update: "#F3E8FF",
  };
  return colors[type] || "#E0E0E0";
}

// ============================================================================
// Appointments API
// ============================================================================

export interface Appointment {
  id: string;
  professionalId: string;
  userId: string;
  date: string; // ISO date string (YYYY-MM-DD)
  time: string; // Time string (e.g., "09:00 AM")
  status: "pending" | "confirmed" | "cancelled" | "completed";
  createdAt: string;
  // Optional fields from backend join
  professionalName?: string;
  professionalRole?: string;
  professionalDepartment?: string;
  professionalImage?: string;
  professionalPhone?: string;
}

export interface CreateAppointmentPayload {
  professionalId: string;
  date: string;
  time: string;
}

// Local storage key for appointments (used when backend is not available)
const APPOINTMENTS_STORAGE_KEY = "appointments";

// Maximum appointments per day per consultant
const MAX_APPOINTMENTS_PER_DAY = 3;

export const appointmentsApi = {
  /**
   * Get all appointments for a professional
   */
  async getByProfessional(professionalId: string): Promise<Appointment[]> {
    try {
      // Try to get from backend first
      const response = await fetchWithAuth<{ appointments: any[] }>(
        `/appointments/professional/${professionalId}`
      );
      // Convert snake_case to camelCase
      const appointments = response.data?.appointments || [];
      return appointments.map((a: any) => ({
        id: a.id,
        professionalId: a.professional_id,
        userId: a.user_id,
        date: a.appointment_date,
        time: a.appointment_time,
        status: a.status,
        createdAt: a.created_at,
      }));
    } catch (error) {
      // Fallback to local storage if backend is not available
      const stored = await AsyncStorage.getItem(APPOINTMENTS_STORAGE_KEY);
      if (stored) {
        const allAppointments: Appointment[] = JSON.parse(stored);
        return allAppointments.filter(
          (a) => a.professionalId === professionalId && a.status !== "cancelled"
        );
      }
      return [];
    }
  },

  /**
   * Get all appointments for the current user
   */
  async getMyAppointments(): Promise<Appointment[]> {
    try {
      const response = await fetchWithAuth<{ appointments: any[] }>(
        "/appointments/my"
      );
      // Convert snake_case to camelCase
      const appointments = response.data?.appointments || [];
      return appointments.map((a: any) => ({
        id: a.id,
        professionalId: a.professional_id,
        userId: a.user_id,
        date: a.appointment_date,
        time: a.appointment_time,
        status: a.status,
        createdAt: a.created_at,
        professionalName: a.professional_name,
        professionalRole: a.professional_role,
        professionalImage: a.professional_image,
      }));
    } catch (error) {
      // Fallback to local storage
      const stored = await AsyncStorage.getItem(APPOINTMENTS_STORAGE_KEY);
      if (stored) {
        const user = await tokenManager.getUser();
        const allAppointments: Appointment[] = JSON.parse(stored);
        return allAppointments.filter(
          (a) => a.userId === user?.id && a.status !== "cancelled"
        );
      }
      return [];
    }
  },

  /**
   * Get appointment count for a professional on a specific date
   */
  async getCountForDate(
    professionalId: string,
    date: string
  ): Promise<number> {
    const appointments = await this.getByProfessional(professionalId);
    return appointments.filter(
      (a) => a.date === date && a.status !== "cancelled"
    ).length;
  },

  /**
   * Check if a professional has reached max appointments for a date
   * Uses the dedicated backend endpoint for accurate real-time count.
   */
  async isDateFullyBooked(
    professionalId: string,
    date: string
  ): Promise<boolean> {
    try {
      // Use the dedicated backend count endpoint for accuracy
      const response = await fetchWithAuth<{
        count: number;
        max_per_day: number;
        is_fully_booked: boolean;
      }>(`/appointments/professional/${professionalId}/count/${date}`);
      return response.data?.is_fully_booked ?? false;
    } catch {
      // Fallback: count from the already-fetched appointments list
      const count = await this.getCountForDate(professionalId, date);
      return count >= MAX_APPOINTMENTS_PER_DAY;
    }
  },

  /**
   * Create a new appointment
   */
  async create(payload: CreateAppointmentPayload): Promise<Appointment> {
    try {
      // Try to create on backend first
      const response = await fetchWithAuth<{ appointment: any }>(
        "/appointments",
        {
          method: "POST",
          body: JSON.stringify(payload),
        }
      );
      const a = response.data?.appointment;
      if (a) {
        return {
          id: a.id,
          professionalId: a.professional_id,
          userId: a.user_id,
          date: a.appointment_date,
          time: a.appointment_time,
          status: a.status,
          createdAt: a.created_at,
        };
      }
      throw new ApiError("No appointment data returned", 500);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      // Fallback to local storage
      const user = await tokenManager.getUser();
      const newAppointment: Appointment = {
        id: `apt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        professionalId: payload.professionalId,
        userId: user?.id || "guest",
        date: payload.date,
        time: payload.time,
        status: "pending",
        createdAt: new Date().toISOString(),
      };

      // Save to local storage
      const stored = await AsyncStorage.getItem(APPOINTMENTS_STORAGE_KEY);
      const appointments: Appointment[] = stored ? JSON.parse(stored) : [];
      appointments.push(newAppointment);
      await AsyncStorage.setItem(
        APPOINTMENTS_STORAGE_KEY,
        JSON.stringify(appointments)
      );

      return newAppointment;
    }
  },

  /**
   * Cancel an appointment
   */
  async cancel(appointmentId: string): Promise<void> {
    try {
      await fetchWithAuth(`/appointments/${appointmentId}/cancel`, {
        method: "PATCH",
      });
    } catch (error) {
      // Fallback to local storage
      const stored = await AsyncStorage.getItem(APPOINTMENTS_STORAGE_KEY);
      if (stored) {
        const appointments: Appointment[] = JSON.parse(stored);
        const updatedAppointments = appointments.map((a) =>
          a.id === appointmentId ? { ...a, status: "cancelled" as const } : a
        );
        await AsyncStorage.setItem(
          APPOINTMENTS_STORAGE_KEY,
          JSON.stringify(updatedAppointments)
        );
      }
    }
  },

  /**
   * Get available time slots for a professional on a specific date
   */
  async getAvailableSlots(
    professionalId: string,
    date: string
  ): Promise<string[]> {
    try {
      // Try to get from backend
      const response = await fetchWithAuth<{ available_slots: string[] }>(
        `/appointments/professional/${professionalId}/slots/${date}`
      );
      return response.data?.available_slots || [];
    } catch (error) {
      // Fallback to local calculation
      const allSlots = [
        "09:00 AM",
        "10:00 AM",
        "11:00 AM",
        "02:00 PM",
        "03:00 PM",
        "04:00 PM",
      ];

      const appointments = await this.getByProfessional(professionalId);
      const bookedSlots = appointments
        .filter((a) => a.date === date && a.status !== "cancelled")
        .map((a) => a.time);

      return allSlots.filter((slot) => !bookedSlots.includes(slot));
    }
  },
};



// ============================================================================
// Analytics API
// ============================================================================

export interface DashboardStats {
  totalFarmers: number;
  totalLandCoverage: number;
  livestockCount: number;
  activeSchemes: number;
  availableProfessionals: number;
}

export const analyticsApi = {
  /**
   * Get dashboard statistics
   */
  async getDashboardStats(): Promise<DashboardStats | null> {
    try {
      const response = await fetchWithAuth<{
        totalFarmers: number;
        totalLandCoverage: number;
        livestockCount: number;
        activeSchemes: number;
        availableProfessionals: number;
      }>("/analytics/dashboard");

      return response.data || null;
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      return null;
    }
  },
};

export default {
  auth: authApi,
  user: userApi,
  banners: bannersApi,
  schemes: schemesApi,
  events: eventsApi,
  professionals: professionalsApi,
  notifications: notificationsApi,
  appointments: appointmentsApi,
  analytics: analyticsApi,
  upload: uploadApi,
  tokenManager,
};


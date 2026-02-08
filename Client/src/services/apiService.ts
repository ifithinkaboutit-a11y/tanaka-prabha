// src/services/apiService.ts
import AsyncStorage from "@react-native-async-storage/async-storage";

// API Configuration
const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://localhost:5000/api";

// Log API URL on startup for debugging
console.log("🔗 API Base URL:", API_BASE_URL);

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
  mobile_number: string;
  village?: string;
  district?: string;
  state?: string;
  gender?: string;
  date_of_birth?: string;
}

export interface AuthData {
  user: User;
  token: string;
  token_type: string;
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
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error("Error getting user:", error);
      return null;
    }
  },

  async setUser(user: User): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
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

// Base fetch wrapper with auth handling
async function fetchWithAuth<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;

  console.log(`📤 API Request: ${options.method || "GET"} ${url}`);
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
    const response = await fetch(url, {
      ...options,
      headers,
    });

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

    // Network or other error
    console.error("❌ API Request Error:", error);
    throw new ApiError(
      error instanceof Error ? error.message : "Network error",
      0
    );
  }
}

// Auth API endpoints
export const authApi = {
  /**
   * Send OTP to mobile number
   * @param mobile_number - 10-digit Indian mobile number
   */
  async sendOTP(mobile_number: string): Promise<ApiResponse<SendOTPResponse>> {
    return fetchWithAuth<SendOTPResponse>("/auth/send-otp", {
      method: "POST",
      body: JSON.stringify({ mobile_number }),
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
  async resendOTP(mobile_number: string): Promise<ApiResponse<SendOTPResponse>> {
    return fetchWithAuth<SendOTPResponse>("/auth/resend-otp", {
      method: "POST",
      body: JSON.stringify({ mobile_number }),
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
};

// User API endpoints
export const userApi = {
  /**
   * Get current user profile
   */
  async getProfile(): Promise<ApiResponse<{ user: User }>> {
    return fetchWithAuth<{ user: User }>("/users/profile", {
      method: "GET",
    });
  },

  /**
   * Update user profile
   */
  async updateProfile(
    userData: Partial<User>
  ): Promise<ApiResponse<{ user: User }>> {
    return fetchWithAuth<{ user: User }>("/users/profile", {
      method: "PUT",
      body: JSON.stringify(userData),
    });
  },
};

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

export default {
  auth: authApi,
  user: userApi,
  banners: bannersApi,
  schemes: schemesApi,
  tokenManager,
};

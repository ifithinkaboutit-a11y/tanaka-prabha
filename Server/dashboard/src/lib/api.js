/**
 * API Client for Tanak Prabha Backend
 * Base URL defaults to 34.131.190.214:5000 for development (backend server port)
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const DASHBOARD_API_KEY = process.env.NEXT_PUBLIC_DASHBOARD_API_KEY;

class ApiError extends Error {
    constructor(message, status, data) {
        super(message);
        this.status = status;
        this.data = data;
    }
}

/**
 * Make an API request
 */
async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;

    const config = {
        headers: {
            'Content-Type': 'application/json',
            'X-Dashboard-Api-Key': DASHBOARD_API_KEY,
            ...options.headers,
        },
        ...options,
    };

    // Add auth token if available (for user-specific requests)
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }

    try {
        const response = await fetch(url, config);

        // Handle non-JSON responses
        let data;
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            try {
                data = await response.json();
            } catch (jsonError) {
                throw new ApiError(
                    'Invalid JSON response from server',
                    response.status,
                    null
                );
            }
        } else {
            // For non-JSON responses, create a data object
            const text = await response.text();
            data = {
                message: text || 'An error occurred',
                status: response.status
            };
        }

        if (!response.ok) {
            throw new ApiError(
                data.message || data.error || 'An error occurred',
                response.status,
                data
            );
        }

        return data;
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        // Handle network errors
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            throw new ApiError(
                'Network error: Unable to connect to server. Please check your connection.',
                0,
                null
            );
        }
        throw new ApiError(
            error.message || 'Network error',
            0,
            null
        );
    }
}

// ============================================================
// Admin API (uses admin JWT token, not dashboard API key)
// ============================================================

export const adminApi = {
    changePassword: (currentPassword, newPassword, token) =>
        fetch(`${API_BASE_URL}/admin/change-password`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ currentPassword, newPassword }),
        }).then(async res => {
            const data = await res.json();
            if (!res.ok) throw new ApiError(data.error || 'Failed', res.status, data);
            return data;
        }),

    updateProfile: (profileData, token) =>
        fetch(`${API_BASE_URL}/admin/profile`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(profileData),
        }).then(async res => {
            const data = await res.json();
            if (!res.ok) throw new ApiError(data.error || 'Failed', res.status, data);
            return data;
        }),
};

// ============================================================
// Authentication API
// ============================================================

export const authApi = {
    sendOtp: (mobile_number) =>
        apiRequest('/auth/send-otp', {
            method: 'POST',
            body: JSON.stringify({ mobile_number }),
        }),

    verifyOtp: (mobile_number, otp) =>
        apiRequest('/auth/verify-otp', {
            method: 'POST',
            body: JSON.stringify({ mobile_number, otp }),
        }),

    resendOtp: (mobile_number) =>
        apiRequest('/auth/resend-otp', {
            method: 'POST',
            body: JSON.stringify({ mobile_number }),
        }),

    verifyToken: () =>
        apiRequest('/auth/verify-token'),
};

// ============================================================
// Users API
// ============================================================

export const usersApi = {
    getAll: (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return apiRequest(`/users${queryString ? `?${queryString}` : ''}`);
    },

    getById: (id) =>
        apiRequest(`/users/${id}`),

    create: (userData) =>
        apiRequest('/users', {
            method: 'POST',
            body: JSON.stringify(userData),
        }),

    update: (id, userData) =>
        apiRequest(`/users/${id}`, {
            method: 'PUT',
            body: JSON.stringify(userData),
        }),

    delete: (id) =>
        apiRequest(`/users/${id}`, {
            method: 'DELETE',
        }),

    getByLocation: (bounds) => {
        const queryString = new URLSearchParams(bounds).toString();
        return apiRequest(`/users/locations?${queryString}`);
    },

    getCountByDistrict: () =>
        apiRequest('/users/districts'),
};

// ============================================================
// Schemes API
// ============================================================

export const schemesApi = {
    getAll: (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return apiRequest(`/schemes${queryString ? `?${queryString}` : ''}`);
    },

    getById: (id) =>
        apiRequest(`/schemes/${id}`),

    getCategories: () =>
        apiRequest('/schemes/categories'),

    create: (schemeData) =>
        apiRequest('/schemes', {
            method: 'POST',
            body: JSON.stringify(schemeData),
        }),

    update: (id, schemeData) =>
        apiRequest(`/schemes/${id}`, {
            method: 'PUT',
            body: JSON.stringify(schemeData),
        }),

    delete: (id) =>
        apiRequest(`/schemes/${id}`, {
            method: 'DELETE',
        }),

    toggleStatus: (id) =>
        apiRequest(`/schemes/${id}/toggle`, {
            method: 'PATCH',
        }),
};

// ============================================================
// Events API
// ============================================================

export const eventsApi = {
    getAll: (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return apiRequest(`/events${queryString ? `?${queryString}` : ''}`);
    },

    getById: (id) =>
        apiRequest(`/events/${id}`),

    create: (eventData) =>
        apiRequest('/events', {
            method: 'POST',
            body: JSON.stringify(eventData),
        }),

    update: (id, eventData) =>
        apiRequest(`/events/${id}`, {
            method: 'PUT',
            body: JSON.stringify(eventData),
        }),

    delete: (id) =>
        apiRequest(`/events/${id}`, {
            method: 'DELETE',
        }),

    getParticipants: (id) =>
        apiRequest(`/events/${id}/participants`),

    markAttendance: (id, data) =>
        apiRequest(`/events/${id}/attendance`, {
            method: 'POST',
            body: JSON.stringify(data),
        }),
};

// ============================================================
// Professionals API
// ============================================================

export const professionalsApi = {
    getAll: (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return apiRequest(`/professionals${queryString ? `?${queryString}` : ''}`);
    },

    getById: (id) =>
        apiRequest(`/professionals/${id}`),

    create: (professionalData) =>
        apiRequest('/professionals', {
            method: 'POST',
            body: JSON.stringify(professionalData),
        }),

    update: (id, professionalData) =>
        apiRequest(`/professionals/${id}`, {
            method: 'PUT',
            body: JSON.stringify(professionalData),
        }),

    delete: (id) =>
        apiRequest(`/professionals/${id}`, {
            method: 'DELETE',
        }),

    toggleAvailability: (id) =>
        apiRequest(`/professionals/${id}/toggle`, {
            method: 'PATCH',
        }),
};

// ============================================================
// Banners API
// ============================================================

export const bannersApi = {
    getAll: (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return apiRequest(`/banners${queryString ? `?${queryString}` : ''}`);
    },

    getById: (id) =>
        apiRequest(`/banners/${id}`),

    create: (bannerData) =>
        apiRequest('/banners', {
            method: 'POST',
            body: JSON.stringify(bannerData),
        }),

    update: (id, bannerData) =>
        apiRequest(`/banners/${id}`, {
            method: 'PUT',
            body: JSON.stringify(bannerData),
        }),

    delete: (id) =>
        apiRequest(`/banners/${id}`, {
            method: 'DELETE',
        }),

    toggleStatus: (id) =>
        apiRequest(`/banners/${id}/toggle`, {
            method: 'PATCH',
        }),

    reorder: (banners) =>
        apiRequest('/banners/reorder', {
            method: 'PUT',
            body: JSON.stringify({ banners }),
        }),
};

// ============================================================
// Notifications API
// ============================================================

export const notificationsApi = {
    getByUser: (userId, params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return apiRequest(`/notifications/user/${userId}${queryString ? `?${queryString}` : ''}`);
    },

    create: (notificationData) =>
        apiRequest('/notifications', {
            method: 'POST',
            body: JSON.stringify(notificationData),
        }),

    sendBulk: (data) =>
        apiRequest('/notifications/bulk', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    markAsRead: (id) =>
        apiRequest(`/notifications/${id}/read`, {
            method: 'PATCH',
        }),

    markAllAsRead: (userId) =>
        apiRequest(`/notifications/user/${userId}/read-all`, {
            method: 'PATCH',
        }),

    delete: (id) =>
        apiRequest(`/notifications/${id}`, {
            method: 'DELETE',
        }),

    broadcast: (data) =>
        apiRequest('/notifications/broadcast', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
};

// ============================================================
// Analytics API
// ============================================================

export const analyticsApi = {
    getDashboardStats: () =>
        apiRequest('/analytics/dashboard'),

    getRecentActivity: (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return apiRequest(`/analytics/recent-activity${queryString ? `?${queryString}` : ''}`);
    },

    getUserDistribution: () =>
        apiRequest('/analytics/user-distribution'),

    getLandStatistics: () =>
        apiRequest('/analytics/land-statistics'),

    getLivestockStatistics: () =>
        apiRequest('/analytics/livestock-statistics'),

    getGrowthTrends: (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return apiRequest(`/analytics/growth-trends${queryString ? `?${queryString}` : ''}`);
    },

    getFarmerLocations: (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return apiRequest(`/analytics/farmer-locations${queryString ? `?${queryString}` : ''}`);
    },

    getUserHeatmap: () =>
        apiRequest('/analytics/user-heatmap'),
};

// ============================================================
// Upload API (Cloudinary)
// ============================================================

/**
 * Upload a file to Cloudinary
 * @param {string} endpoint - The upload endpoint (banner, scheme, scheme-hero, professional, user-photo, general)
 * @param {File} file - The file to upload
 * @param {string} fieldName - The form field name (default: 'image')
 */
async function uploadFile(endpoint, file, fieldName = 'image') {
    const url = `${API_BASE_URL}/upload/${endpoint}`;
    const formData = new FormData();
    formData.append(fieldName, file);

    const config = {
        method: 'POST',
        body: formData,
        headers: {
            'X-Dashboard-Api-Key': DASHBOARD_API_KEY,
        },
    };

    // Add auth token if available
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }

    try {
        const response = await fetch(url, config);

        // Handle non-JSON responses
        let data;
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            try {
                data = await response.json();
            } catch (jsonError) {
                throw new ApiError(
                    'Invalid JSON response from server',
                    response.status,
                    null
                );
            }
        } else {
            const text = await response.text();
            data = {
                message: text || 'Upload failed',
                status: response.status
            };
        }

        if (!response.ok) {
            throw new ApiError(
                data.message || data.error || 'Upload failed',
                response.status,
                data
            );
        }

        return data;
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        // Handle network errors
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            throw new ApiError(
                'Network error: Unable to connect to server. Please check your connection.',
                0,
                null
            );
        }
        throw new ApiError(
            error.message || 'Upload failed',
            0,
            null
        );
    }
}

export const uploadApi = {
    /**
     * Upload a banner image
     * @param {File} file - The image file
     * @returns {Promise<{status: string, data: {url: string, public_id: string}}>}
     */
    uploadBanner: (file) => uploadFile('banner', file),

    /**
     * Upload a scheme thumbnail image
     * @param {File} file - The image file
     * @returns {Promise<{status: string, data: {url: string, public_id: string}}>}
     */
    uploadSchemeImage: (file) => uploadFile('scheme', file),

    /**
     * Upload a scheme hero/banner image
     * @param {File} file - The image file
     * @returns {Promise<{status: string, data: {url: string, public_id: string}}>}
     */
    uploadSchemeHero: (file) => uploadFile('scheme-hero', file),

    /**
     * Upload a professional profile image
     * @param {File} file - The image file
     * @returns {Promise<{status: string, data: {url: string, public_id: string}}>}
     */
    uploadProfessionalImage: (file) => uploadFile('professional', file),

    /**
     * Upload a user photo
     * @param {File} file - The image file
     * @returns {Promise<{status: string, data: {url: string, public_id: string}}>}
     */
    uploadUserPhoto: (file) => uploadFile('user-photo', file, 'photo'),

    /**
     * Upload a general file
     * @param {File} file - The file
     * @returns {Promise<{status: string, data: {url: string, public_id: string}}>}
     */
    uploadGeneral: (file) => uploadFile('general', file, 'file'),

    /**
     * Delete an image from Cloudinary
     * @param {string} urlOrPublicId - The image URL or public_id
     * @returns {Promise<{status: string, message: string}>}
     */
    deleteImage: (urlOrPublicId) =>
        apiRequest('/upload/delete', {
            method: 'DELETE',
            body: JSON.stringify({ url: urlOrPublicId }),
        }),

    /**
     * Upload an image from an external URL
     * @param {string} imageUrl - The external image URL
     * @param {string} type - The image type (banner, scheme, scheme-hero, professional, user)
     * @returns {Promise<{status: string, data: {url: string, public_id: string}}>}
     */
    uploadFromUrl: (imageUrl, type = 'general') =>
        apiRequest('/upload/from-url', {
            method: 'POST',
            body: JSON.stringify({ url: imageUrl, type }),
        }),
};

// Export default object with all APIs
export default {
    admin: adminApi,
    auth: authApi,
    users: usersApi,
    schemes: schemesApi,
    events: eventsApi,
    professionals: professionalsApi,
    banners: bannersApi,
    notifications: notificationsApi,
    analytics: analyticsApi,
    upload: uploadApi,
};

/**
 * API Utility Functions
 *
 * Handles all communication with the backend API
 * Includes authentication token management
 */

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

/** Backend origin (no /api) for static assets like annotated face images */
export const getBackendOrigin = () => {
  const url = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  return url.replace(/\/api\/?$/, "") || "http://localhost:5000";
};

/**
 * Get stored authentication token (checks both admin and regular user)
 * Uses current route to determine which token to return if both exist
 */
const getToken = () => {
  // Check current route to determine which token to return
  const currentPath = window.location.pathname;
  const isAdminRoute =
    currentPath.startsWith("/admin") || currentPath === "/admin-login";

  if (isAdminRoute) {
    // On admin routes, ONLY return admin token (never regular user token)
    const adminToken = localStorage.getItem("admin_token");
    if (adminToken) return adminToken;
    return null; // Don't fallback to regular user token
  }

  // On regular routes, ONLY return regular user token (never admin token)
  const userToken = localStorage.getItem("token");
  if (userToken) return userToken;

  // No fallback - return null if token doesn't exist for this route
  return null;
};

/**
 * Get stored user data (checks both admin and regular user)
 * Uses current route to determine which user to return if both exist
 */
export const getUser = () => {
  // Check current route to determine which user to return
  const currentPath = window.location.pathname;
  const isAdminRoute =
    currentPath.startsWith("/admin") || currentPath === "/admin-login";

  if (isAdminRoute) {
    // On admin routes, check admin user first
    const adminUserStr = localStorage.getItem("admin_user");
    if (adminUserStr) {
      try {
        return JSON.parse(adminUserStr);
      } catch (e) {
        return null;
      }
    }
  }

  // Check regular user
  const userStr = localStorage.getItem("user");
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch (e) {
      return null;
    }
  }

  // If not on admin route and no regular user, check admin user as fallback
  if (!isAdminRoute) {
    const adminUserStr = localStorage.getItem("admin_user");
    if (adminUserStr) {
      try {
        return JSON.parse(adminUserStr);
      } catch (e) {
        return null;
      }
    }
  }

  return null;
};

/**
 * Store authentication data (uses separate keys for admin vs regular users)
 * @param {string} token - JWT token
 * @param {object} user - User object
 * @param {boolean} clearOther - Whether to clear other role's storage (default: false for refresh, true for login)
 */
export const setAuth = (token, user, clearOther = false) => {
  if (user && user.role === "admin") {
    // Store admin auth separately
    localStorage.setItem("admin_token", token);
    localStorage.setItem("admin_user", JSON.stringify(user));
    // Only clear regular user auth if explicitly requested (during login, not refresh)
    if (clearOther) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  } else {
    // Store regular user auth
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    // Only clear admin auth if explicitly requested (during login, not refresh)
    if (clearOther) {
      localStorage.removeItem("admin_token");
      localStorage.removeItem("admin_user");
    }
  }
};

/**
 * Clear authentication data (logout) - only clears the appropriate keys based on role
 * @param {string} userRole - 'admin' or 'user' or null (auto-detect)
 */
export const clearAuth = (userRole = null) => {
  // If role is explicitly specified, only clear that role's auth
  if (userRole === "admin") {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    return;
  }

  if (userRole === "user") {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return;
  }

  // If no role specified, try to determine from current storage
  if (userRole === null) {
    const currentUser = getUser();
    if (currentUser && currentUser.role === "admin") {
      // Only clear admin auth
      localStorage.removeItem("admin_token");
      localStorage.removeItem("admin_user");
    } else {
      // Only clear regular user auth
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  }
};

/**
 * Check if user is authenticated (checks both admin and regular user)
 * Uses current route to determine which token to check
 */
export const isAuthenticated = () => {
  return !!getToken();
};

/**
 * Make authenticated API request
 *
 * @param {string} endpoint - API endpoint (e.g., '/auth/profile')
 * @param {object} options - Fetch options
 * @returns {Promise} Response data
 */
const apiRequest = async (endpoint, options = {}) => {
  // Get token (checks both admin and regular user tokens)
  const token = getToken();

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  // Add authorization header if token exists
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    // If unauthorized, clear auth and redirect to appropriate login
    // BUT: Only clear if token is explicitly invalid/expired, not on temporary errors
    if (response.status === 401 || response.status === 403) {
      const currentPath = window.location.pathname;
      const isLoginPage =
        currentPath === "/login" ||
        currentPath === "/admin-login" ||
        currentPath === "/register";

      // IMPORTANT: Never clear storage on login pages - just throw error
      // This prevents logging out users when refreshing login pages
      if (isLoginPage) {
        const error = new Error(data.message || "Unauthorized");
        error.needsVerification = data.needsVerification;
        error.email = data.email;
        throw error;
      }

      // Only clear auth if error message indicates token is invalid/expired
      // Don't clear on generic 401/403 which might be temporary server issues
      const errorMessage = (data.message || "").toLowerCase();
      const isTokenError =
        errorMessage.includes("expired") ||
        errorMessage.includes("invalid") ||
        errorMessage.includes("token") ||
        errorMessage.includes("unauthorized");

      if (isTokenError) {
        // Determine which storage to clear based on the token that was used
        // Check which token exists to know which storage to clear
        const adminToken = localStorage.getItem("admin_token");
        const userToken = localStorage.getItem("token");

        // Determine which storage to clear based on the current route
        // Admin routes should clear admin storage, regular routes clear user storage
        if (
          currentPath.startsWith("/admin") ||
          currentPath === "/admin-login"
        ) {
          // Clear only admin storage
          if (adminToken) {
            clearAuth("admin");
          }
          if (currentPath !== "/admin-login") {
            window.location.href = "/admin-login";
          }
        } else {
          // Clear only regular user storage
          if (userToken) {
            clearAuth("user");
          }
          if (currentPath !== "/login" && currentPath !== "/register") {
            window.location.href = "/login";
          }
        }
      }

      throw new Error(data.message || "Unauthorized");
    }

    if (!response.ok) {
      throw new Error(data.message || "Request failed");
    }

    return data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

// ============================================
// AUTHENTICATION API
// ============================================

/**
 * Register a new user
 *
 * @param {object} userData - { username, email, password, full_name }
 * @returns {Promise} { success, token, user }
 */
export const registerUser = async (userData) => {
  const response = await apiRequest("/auth/register", {
    method: "POST",
    body: JSON.stringify(userData),
  });

  if (response.success && response.token) {
    // Don't clear other role - allow admin and user logged in at once (different tabs)
    setAuth(response.token, response.user, false);
  }

  return response;
};

/**
 * Login user
 *
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise} { success, token, user }
 */
export const loginUser = async (email, password) => {
  const response = await apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  if (response.success && response.token) {
    // Don't clear other role - allow admin and user logged in at once (different tabs)
    setAuth(response.token, response.user, false);
  }

  return response;
};

/**
 * Get current user profile
 *
 * @returns {Promise} { success, user }
 */
export const getProfile = async () => {
  return apiRequest("/auth/profile");
};

/**
 * Verify OTP code
 * @param {string} email
 * @param {string} otp
 */
export const verifyOTP = async (email, otp) => {
  const response = await apiRequest("/auth/verify-otp", {
    method: "POST",
    body: JSON.stringify({ email, otp }),
  });

  if (response.success && response.token) {
    setAuth(response.token, response.user, false);
  }

  return response;
};

/**
 * Resend OTP code
 * @param {string} email
 */
export const resendOTP = async (email) => {
  return apiRequest("/auth/resend-otp", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
};

/**
 * Request password reset OTP
 * @param {string} email
 */
export const forgotPassword = async (email) => {
  return apiRequest("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
};

/**
 * Verify reset code OTP
 * @param {string} email
 * @param {string} otp
 */
export const verifyResetCode = async (email, otp) => {
  return apiRequest("/auth/verify-reset-code", {
    method: "POST",
    body: JSON.stringify({ email, otp }),
  });
};

/**
 * Reset password using OTP code
 * @param {string} email
 * @param {string} otp
 * @param {string} password
 */
export const resetPassword = async (email, otp, password) => {
  return apiRequest("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ email, otp, password }),
  });
};


/**
 * Logout user
 * IMPORTANT: This function determines which storage to clear based on the current route
 * to prevent clearing the wrong user's storage when both admin and regular user are logged in
 */
export const logout = () => {
  const currentPath = window.location.pathname;

  // Determine which storage to clear based on current route
  // This is the most reliable way to know which user is logging out
  if (currentPath.startsWith("/admin") || currentPath === "/admin-login") {
    // Admin route - clear only admin storage
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    window.location.href = "/admin-login";
  } else {
    // Regular user route - clear only regular user storage
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  }
};

// ============================================
// FACE ANALYSIS API
// ============================================

/**
 * Upload image and analyze face shape
 *
 * @param {File} imageFile - Image file to upload
 * @returns {Promise} { success, data: { face_shape, confidence_score, ... } }
 */
export const analyzeFace = async (imageFile) => {
  const token = getToken();

  if (!token) {
    throw new Error("Please login to analyze face");
  }

  const formData = new FormData();
  formData.append("image", imageFile);

  const response = await fetch(`${API_BASE_URL}/face-analysis/analyze`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      // Don't set Content-Type for FormData - browser sets it automatically
    },
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Face analysis failed");
  }

  return data;
};

/**
 * Get user's face analysis history
 *
 * @returns {Promise} { success, count, data: [...] }
 */
export const getAnalysisHistory = async () => {
  return apiRequest("/face-analysis/history");
};

/**
 * Get specific analysis by ID
 *
 * @param {number} analysisId - Analysis ID
 * @returns {Promise} { success, data: {...} }
 */
export const getAnalysisById = async (analysisId) => {
  return apiRequest(`/face-analysis/${analysisId}`);
};

// ============================================
// USER PROFILE API
// ============================================

/**
 * Get user profile
 *
 * @returns {Promise} { success, user }
 */
export const getUserProfile = async () => {
  return apiRequest("/user/profile");
};

/**
 * Update user profile
 *
 * @param {object} profileData - { username, full_name }
 * @returns {Promise} { success, user }
 */
export const updateProfile = async (profileData) => {
  return apiRequest("/user/profile", {
    method: "PUT",
    body: JSON.stringify(profileData),
  });
};

/**
 * Update profile picture
 *
 * @param {FormData} formData - FormData with profile_picture file
 * @returns {Promise} { success, user }
 */
export const updateProfilePicture = async (formData) => {
  const token = getToken();

  if (!token) {
    throw new Error("Please login to update profile picture");
  }

  const response = await fetch(`${API_BASE_URL}/user/profile-picture`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      // Don't set Content-Type for FormData - browser sets it automatically
    },
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    // Provide more specific error messages
    if (response.status === 400) {
      throw new Error(
        data.message || "Invalid file. Please upload a valid image."
      );
    } else if (response.status === 401 || response.status === 403) {
      throw new Error("Please login again to update your profile picture.");
    } else if (response.status === 413) {
      throw new Error(
        "File too large. Please upload an image smaller than 2MB."
      );
    } else {
      throw new Error(
        data.message || "Failed to update profile picture. Please try again."
      );
    }
  }

  return data;
};

/**
 * Get user's analyses
 *
 * @returns {Promise} { success, count, data: [...] }
 */
export const getUserAnalyses = async () => {
  return apiRequest("/user/analyses");
};

/**
 * Get current user's membership status (credits + is_premium)
 *
 * @returns {Promise} { success, membership: { credits, is_premium } }
 */
export const getMembershipStatus = async () => {
  return apiRequest("/membership/status");
};

// ============================================
// ADMIN API
// ============================================

/**
 * Admin login
 *
 * @param {string} email - Admin email
 * @param {string} password - Admin password
 * @returns {Promise} { success, token, user }
 */
export const adminLogin = async (email, password) => {
  const response = await apiRequest("/admin/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  if (response.success && response.token && response.user) {
    // During admin login, clear other role's storage
    setAuth(response.token, response.user, false);
  }

  return response;
};

/**
 * Get all users (Admin only)
 *
 * @returns {Promise} { success, count, data: [...] }
 */
export const getAllUsers = async () => {
  return apiRequest("/admin/users");
};

/**
 * Get user statistics (Admin only)
 *
 * @returns {Promise} { success, stats: {...} }
 */
export const getUserStats = async () => {
  return apiRequest("/admin/stats");
};

/**
 * Delete user (Admin only)
 *
 * @param {number} userId - User ID to delete
 * @returns {Promise} { success, message }
 */
export const deleteUser = async (userId) => {
  return apiRequest(`/admin/users/${userId}`, {
    method: "DELETE",
  });
};

/**
 * Get chatbot conversations (Admin only)
 *
 * @param {object} params - { userId, limit, offset }
 * @returns {Promise} { success, count, data: [...] }
 */
export const getChatbotConversations = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.userId) queryParams.append("userId", params.userId);
  if (params.limit) queryParams.append("limit", params.limit);
  if (params.offset) queryParams.append("offset", params.offset);

  const queryString = queryParams.toString();
  return apiRequest(
    `/admin/chatbot/conversations${queryString ? `?${queryString}` : ""}`
  );
};

/**
 * Get chatbot statistics (Admin only)
 *
 * @returns {Promise} { success, stats: {...} }
 */
export const getChatbotStats = async () => {
  return apiRequest("/admin/chatbot/stats");
};

/**
 * Delete chatbot conversation (Admin only)
 * Admin can delete any conversation
 *
 * @param {number} id - Conversation ID
 * @returns {Promise} { success, message }
 */
export const adminDeleteChatbotConversation = async (id) => {
  return apiRequest(`/admin/chatbot/conversations/${id}`, {
    method: "DELETE",
  });
};

/**
 * Get all face analysis records (Admin only)
 *
 * @param {object} params - { limit, offset }
 * @returns {Promise} { success, count, data: [...] }
 */
export const getAllFaceAnalyses = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.limit) queryParams.append("limit", params.limit);
  if (params.offset) queryParams.append("offset", params.offset);
  const queryString = queryParams.toString();
  return apiRequest(
    `/admin/face-analysis${queryString ? `?${queryString}` : ""}`
  );
};

/**
 * Delete face analysis record (Admin only)
 *
 * @param {number} id - Face analysis record ID
 * @returns {Promise} { success, message }
 */
export const adminDeleteFaceAnalysis = async (id) => {
  return apiRequest(`/admin/face-analysis/${id}`, {
    method: "DELETE",
  });
};

/**
 * Get all makeup try-on sessions (Admin only)
 *
 * @param {object} params - { limit, offset }
 * @returns {Promise} { success, count, data: [...] }
 */
export const getAllMakeupTryOns = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (params.limit) queryParams.append("limit", params.limit);
    if (params.offset) queryParams.append("offset", params.offset);

    const queryString = queryParams.toString();
    const endpoint = `/admin/makeup-tryon${
      queryString ? `?${queryString}` : ""
    }`;

    console.log("📤 Admin fetching makeup try-on sessions:", endpoint);

    const response = await apiRequest(endpoint);

    console.log("📥 Admin makeup try-on sessions response:", response);
    console.log("📥 Response success:", response?.success);
    console.log("📥 Response data count:", response?.data?.length || 0);

    return response;
  } catch (error) {
    console.error("❌ getAllMakeupTryOns API error:", error);
    return {
      success: false,
      message: error.message || "Failed to fetch makeup try-on sessions",
      data: [],
    };
  }
};

/**
 * Get makeup try-on statistics (Admin only)
 *
 * @returns {Promise} { success, stats: {...} }
 */
export const getMakeupTryOnStats = async () => {
  return apiRequest("/admin/makeup-tryon/stats");
};

// ============================================
// NOTIFICATIONS API
// ============================================

/**
 * Get user's notifications
 *
 * @param {object} params - { limit, offset, unreadOnly }
 * @returns {Promise} { success, data, unreadCount }
 */
export const getNotifications = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.limit) queryParams.append("limit", params.limit);
  if (params.offset) queryParams.append("offset", params.offset);
  if (params.unreadOnly) queryParams.append("unreadOnly", params.unreadOnly);
  const queryString = queryParams.toString();
  return apiRequest(`/notifications${queryString ? `?${queryString}` : ""}`);
};

/**
 * Get unread notification count
 *
 * @returns {Promise} { success, unreadCount }
 */
export const getUnreadNotificationCount = async () => {
  return apiRequest("/notifications/unread-count");
};

/**
 * Mark notification as read
 *
 * @param {number} id - Notification ID
 * @returns {Promise} { success, message }
 */
export const markNotificationAsRead = async (id) => {
  return apiRequest(`/notifications/${id}/read`, {
    method: "PUT",
  });
};

/**
 * Mark all notifications as read
 *
 * @returns {Promise} { success, message }
 */
export const markAllNotificationsAsRead = async () => {
  return apiRequest("/notifications/read-all", {
    method: "PUT",
  });
};

/**
 * Delete a notification (user's own only)
 *
 * @param {number} id - Notification ID
 * @returns {Promise} { success, message }
 */
export const deleteNotification = async (id) => {
  return apiRequest(`/notifications/${id}`, {
    method: "DELETE",
  });
};

// ============================================
// HAIRSTYLE TRY-ON API (AILabTools Pro via backend)
// ============================================

/**
 * Swap hairstyle on uploaded photo (public — no login required)
 *
 * @param {File} imageFile
 * @param {object} options - { gender: 'male'|'female', styleId: number }
 * @returns {Promise} { success, data: { resultImageUrl, hairStyle, ... } }
 */
const tryOnAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const swapHairstyle = async (imageFile, { gender, styleId }) => {
  const formData = new FormData();
  formData.append("image", imageFile);
  formData.append("gender", gender);
  formData.append("styleId", String(styleId));

  const response = await fetch(`${API_BASE_URL}/hairstyle-tryon/swap`, {
    method: "POST",
    headers: tryOnAuthHeaders(),
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Hairstyle swap failed");
  }
  return data;
};

/**
 * Get hairstyle style ID → AILab hair_style mappings
 */
export const getHairstyleStyles = async () => {
  return apiRequest("/hairstyle-tryon/styles");
};

// ============================================
// BEARD TRY-ON API (AILabTools via backend)
// ============================================

/**
 * Apply beard style on uploaded photo (public — no login required)
 *
 * @param {File|null} imageFile - upload file, or null when using sourceImageUrl
 * @param {object} options - { styleId: number, sourceImageUrl?: string }
 */
export const swapBeard = async (imageFile, { styleId, sourceImageUrl }) => {
  const formData = new FormData();
  if (imageFile) formData.append("image", imageFile);
  if (sourceImageUrl) formData.append("sourceImageUrl", sourceImageUrl);
  formData.append("styleId", String(styleId));

  const response = await fetch(`${API_BASE_URL}/beard-tryon/swap`, {
    method: "POST",
    headers: tryOnAuthHeaders(),
    body: formData,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.success === false) {
    throw new Error(data.message || "Beard swap failed");
  }
  return data;
};

export const getBeardStyles = async () => {
  return apiRequest("/beard-tryon/styles");
};

// ============================================
// ADMIN — HAIRSTYLE & BEARD TRY-ON LOGS
// ============================================

export const getGroomingTryOnStats = async () => {
  return apiRequest("/admin/grooming-tryon/stats");
};

export const getAllHairstyleTryOns = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.limit) queryParams.append("limit", params.limit);
  if (params.offset) queryParams.append("offset", params.offset);
  const qs = queryParams.toString();
  return apiRequest(`/admin/hairstyle-tryon${qs ? `?${qs}` : ""}`);
};

export const getAllBeardTryOns = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.limit) queryParams.append("limit", params.limit);
  if (params.offset) queryParams.append("offset", params.offset);
  const qs = queryParams.toString();
  return apiRequest(`/admin/beard-tryon${qs ? `?${qs}` : ""}`);
};

export const adminDeleteHairstyleTryOn = async (id) => {
  return apiRequest(`/admin/hairstyle-tryon/${id}`, { method: "DELETE" });
};

export const adminDeleteBeardTryOn = async (id) => {
  return apiRequest(`/admin/beard-tryon/${id}`, { method: "DELETE" });
};

// ============================================
// MAKEUP TRY-ON API
// ============================================

/**
 * Save makeup try-on session
 *
 * @param {object} presetData - Makeup preset configuration
 * @param {string} sessionName - Optional session name
 * @returns {Promise} { success, message, data }
 */
export const saveMakeupTryOn = async (presetData, sessionName = null) => {
  try {
    console.log("📤 Calling saveMakeupTryOn API...", {
      hasPresetData: !!presetData,
      sessionName,
      endpoint: "/makeup-tryon/save",
    });

    const response = await apiRequest("/makeup-tryon/save", {
      method: "POST",
      body: JSON.stringify({ presetData, sessionName }),
    });

    console.log("📥 Save makeup try-on API response:", response);
    console.log("📥 Response success:", response?.success);
    console.log("📥 Response data:", response?.data);
    console.log("📥 Response message:", response?.message);
    return response;
  } catch (error) {
    console.error("❌ Save makeup try-on API error:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
    });
    return {
      success: false,
      message: error.message || "Failed to save makeup session",
      error: error,
    };
  }
};

/**
 * Get user's makeup try-on history
 *
 * @param {object} params - { limit, offset }
 * @returns {Promise} { success, count, data: [...] }
 */
export const getUserMakeupTryOns = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.limit) queryParams.append("limit", params.limit);
  if (params.offset) queryParams.append("offset", params.offset);

  const queryString = queryParams.toString();
  return apiRequest(`/makeup-tryon${queryString ? `?${queryString}` : ""}`);
};

/**
 * Get single makeup try-on session by ID
 *
 * @param {number} id - Session ID
 * @returns {Promise} { success, data }
 */
export const getMakeupTryOnById = async (id) => {
  return apiRequest(`/makeup-tryon/${id}`);
};

/**
 * Delete makeup try-on session (User endpoint)
 *
 * @param {number} id - Session ID
 * @returns {Promise} { success, message }
 */
export const deleteMakeupTryOn = async (id) => {
  return apiRequest(`/makeup-tryon/${id}`, {
    method: "DELETE",
  });
};

/**
 * Broadcast notification to all users (Admin only)
 *
 * @param {object} data - { title, message, type?, link? }
 * @returns {Promise} { success, message, count }
 */
/**
 * Send notification to a specific user (Admin only)
 * @param {object} data - { userId, title, message, type?, link? }
 * @returns {Promise} { success, message, username }
 */
export const sendNotificationToUser = async (data) => {
  return apiRequest("/admin/notifications/send", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const broadcastNotification = async (data) => {
  return apiRequest("/admin/notifications/broadcast", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

/**
 * Delete makeup try-on session (Admin endpoint)
 * Admin can delete any session
 *
 * @param {number} id - Session ID
 * @returns {Promise} { success, message }
 */
export const adminDeleteMakeupTryOn = async (id) => {
  return apiRequest(`/admin/makeup-tryon/${id}`, {
    method: "DELETE",
  });
};

// ============================================
// OAUTH API
// ============================================

/**
 * Google OAuth login
 *
 * @param {string} credential - Google credential token (JWT from Google Sign-In)
 * @param {string} accessToken - Google OAuth access token (optional, alternative to credential)
 * @returns {Promise} { success, token, user }
 */
export const googleLogin = async (credential = null, accessToken = null) => {
  const body = {};
  if (credential) {
    body.credential = credential;
  } else if (accessToken) {
    body.accessToken = accessToken;
  } else {
    throw new Error("Either credential or accessToken is required");
  }

  const response = await apiRequest("/oauth/google", {
    method: "POST",
    body: JSON.stringify(body),
  });

  if (response.success && response.token) {
    // During OAuth login, clear other role's storage
    setAuth(response.token, response.user, false);
  }

  return response;
};

/**
 * Instagram OAuth login (FREE & EASY)
 *
 * @param {string} accessToken - Instagram access token
 * @returns {Promise} { success, token, user }
 */
export const instagramLogin = async (accessToken) => {
  const response = await apiRequest("/oauth/instagram", {
    method: "POST",
    body: JSON.stringify({ accessToken }),
  });

  if (response.success && response.token) {
    // During OAuth login, clear other role's storage
    setAuth(response.token, response.user, false);
  }

  return response;
};

/**
 * GitHub OAuth login (FREE & EASY)
 *
 * @param {string} accessToken - GitHub access token
 * @returns {Promise} { success, token, user }
 */
export const githubLogin = async (accessToken) => {
  const response = await apiRequest("/oauth/github", {
    method: "POST",
    body: JSON.stringify({ accessToken }),
  });

  if (response.success && response.token) {
    setAuth(response.token, response.user, false);
  }

  return response;
};

/**
 * Discord OAuth login (FREE & EASY)
 *
 * @param {string} accessToken - Discord access token
 * @returns {Promise} { success, token, user }
 */
export const discordLogin = async (accessToken) => {
  const response = await apiRequest("/oauth/discord", {
    method: "POST",
    body: JSON.stringify({ accessToken }),
  });

  if (response.success && response.token) {
    setAuth(response.token, response.user, false);
  }

  return response;
};

/**
 * Log a share event
 *
 * @param {object} data - { platform, resource_type, resource_id, share_url, image_url }
 * @returns {Promise} { success, message }
 */
export const logShareEvent = async (data) => {
  return apiRequest("/shares/log", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const analyzeFaceShape = analyzeFace;

export const analyzeSkin = async (imageFile) => {
  const token = getToken();
  if (!token) throw new Error("Please login to analyze skin");

  const formData = new FormData();
  formData.append("image", imageFile);

  const response = await fetch(`${API_BASE_URL}/face-analysis/analyze-skin`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Skin analysis failed");
  return data;
};

export const getProductsForSkinType = async (skinType) => {
  const response = await fetch(
    `${API_BASE_URL}/face-analysis/products/${encodeURIComponent(skinType)}`
  );
  return response.json();
};

export const getTipsForSkinType = async (skinType) => {
  const response = await fetch(
    `${API_BASE_URL}/face-analysis/tips/${encodeURIComponent(skinType)}`
  );
  return response.json();
};

export const getProductImageUrl = (skinType, filename) => {
  const origin = getBackendOrigin();
  return `${origin}/api/face-analysis/products/${encodeURIComponent(skinType)}/${encodeURIComponent(filename)}`;
};

/**
 * Get share statistics (Admin only)
 *
 * @returns {Promise} { success, stats: {...} }
 */
export const getShareStats = async () => {
  return apiRequest("/shares/stats");
};

/**
 * Get all manual crypto payments (Admin)
 */
export const getManualPayments = async () => {
    return apiRequest("/admin/manual-payments");
};

/**
 * Approve a manual crypto payment (Admin)
 */
export const approveManualPayment = async (id) => {
    return apiRequest(`/admin/manual-payments/${id}/approve`, {
        method: "POST",
    });
};

/**
 * Reject a manual crypto payment (Admin)
 */
export const rejectManualPayment = async (id) => {
    return apiRequest(`/admin/manual-payments/${id}/reject`, {
        method: "POST",
    });
};

/**
 * Gift credits to all active users (Admin only)
 */
export const giftCreditsToAll = async (amount, description = "") => {
  return apiRequest("/admin/users/gift-credits", {
    method: "POST",
    body: JSON.stringify({ amount, description }),
  });
};

/**
 * Update credits for a specific user (Admin only)
 */
export const updateUserCredits = async (userId, { amount, action, description = "" }) => {
  return apiRequest(`/admin/users/${userId}/credits`, {
    method: "POST",
    body: JSON.stringify({ amount, action, description }),
  });
};

/**
 * Update premium status for a specific user (Admin only)
 */
export const updateUserPremium = async (userId, isPremium) => {
  return apiRequest(`/admin/users/${userId}/premium`, {
    method: "POST",
    body: JSON.stringify({ isPremium }),
  });
};

/**
 * Make all users free (Admin only)
 */
export const makeAllUsersFree = async () => {
  return apiRequest("/admin/users/make-all-free", {
    method: "POST",
  });
};

/**
 * Update password for a specific user (Admin only)
 */
export const updateUserPassword = async (userId, password) => {
  return apiRequest(`/admin/users/${userId}/change-password`, {
    method: "POST",
    body: JSON.stringify({ password }),
  });
};


/**
 * Authentication Context
 * 
 * Provides authentication state and methods throughout the app
 */

import { createContext, useContext, useState, useEffect } from 'react';
import { getUser, isAuthenticated, setAuth, clearAuth } from '../utils/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null); // Add token state

  // Load user from localStorage on mount and when route changes
  useEffect(() => {
    const loadUser = async () => {
      // Determine which user to load based on current route
      const currentPath = window.location.pathname;
      const isAdminRoute = currentPath.startsWith('/admin') || currentPath === '/admin-login';
      const isLoginPage = currentPath === '/login' || currentPath === '/admin-login' || currentPath === '/register';
      
      // Get the appropriate token and user based on route
      let currentToken = null;
      let storedUser = null;
      
      if (isAdminRoute) {
        // On admin routes, load admin user ONLY
        currentToken = localStorage.getItem('admin_token');
        const adminUserStr = localStorage.getItem('admin_user');
        if (adminUserStr) {
          try {
            storedUser = JSON.parse(adminUserStr);
          } catch (e) {
            storedUser = null;
          }
        }
      } else {
        // On regular routes, load regular user ONLY (never admin)
        currentToken = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        if (userStr) {
          try {
            storedUser = JSON.parse(userStr);
          } catch (e) {
            storedUser = null;
          }
        }
      }
      
      // Set token state
      setToken(currentToken);
      
      if (currentToken && storedUser) {
        // User data exists in localStorage - use it immediately
        // This ensures user stays logged in even if API call fails
        setUser(storedUser);
        setLoading(false);
        
        // IMPORTANT: On login pages, don't make API calls - just use stored data
        // This prevents any storage clearing when refreshing login pages
        if (isLoginPage) {
          // User is already logged in - they'll be redirected by the login page component
          // Don't make any API calls that might fail and clear storage
          return;
        }
        
        // On non-login pages, optionally verify with API in background (don't clear other storage)
        // Use a timeout to prevent blocking, and don't fail if API call fails
        setTimeout(async () => {
          try {
            // Make API call with the specific token for this route
            const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            const response = await fetch(`${API_BASE_URL}/auth/profile`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentToken}`,
              },
            });
            
            const data = await response.json();
            if (response.ok && data.success && data.user) {
              const { setAuth } = await import('../utils/api');
              // During refresh, don't clear other role's storage
              setAuth(currentToken, data.user, false);
              setUser(data.user);
              setToken(currentToken); // Update token state
            }
            // If API call fails (401, network error, etc.), silently keep using stored user data
            // This ensures user doesn't get logged out on refresh
            // Only clear auth if token is explicitly invalid (not just network error)
            if ((response.status === 401 || response.status === 403) && data.message && data.message.includes('expired')) {
              // Only clear if token is explicitly expired, not on other errors
              if (isAdminRoute) {
                clearAuth('admin');
              } else {
                clearAuth('user');
              }
            }
          } catch (err) {
            // If API call fails (network error), keep using stored user data - don't log error
            // This is expected if network issue - user will stay logged in with stored data
            // Only log if it's not a network error
            if (err.message && !err.message.includes('fetch')) {
              console.warn('Auth verification failed:', err.message);
            }
          }
        }, 100);
      } else if (currentToken && !isLoginPage) {
        // Token exists but no user data - fetch from API (only on non-login pages)
        try {
          // Make API call with the specific token for this route
          const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
          const response = await fetch(`${API_BASE_URL}/auth/profile`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${currentToken}`,
            },
          });
          
          const data = await response.json();
          if (response.ok && data.success && data.user) {
            const { setAuth } = await import('../utils/api');
            // During refresh, don't clear other role's storage
            setAuth(currentToken, data.user, false);
            setUser(data.user);
            setToken(currentToken); // Update token state
          } else if (response.status === 401 || response.status === 403) {
            // Token invalid - only clear if explicitly invalid, not on network errors
            if (data.message && (data.message.includes('expired') || data.message.includes('invalid'))) {
              if (isAdminRoute) {
                clearAuth('admin');
              } else {
                clearAuth('user');
              }
            }
            // Otherwise keep token - might be temporary server issue
          }
          // If other error, keep token and try again later
        } catch (err) {
          // Network error - don't clear auth, keep token for retry
          // Only log if it's not a network error
          if (err.message && !err.message.includes('fetch')) {
            console.error('Failed to load user profile:', err);
          }
        }
        setLoading(false);
      } else {
        // No token or on login page - user not authenticated or showing login form
        setLoading(false);
      }
    };
    
    loadUser();
  }, []);

  // Listen for storage changes to update token (for cross-tab sync)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'token' || e.key === 'admin_token') {
        const currentPath = window.location.pathname;
        const isAdminRoute = currentPath.startsWith('/admin') || currentPath === '/admin-login';
        const newToken = isAdminRoute 
          ? localStorage.getItem('admin_token')
          : localStorage.getItem('token');
        setToken(newToken);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const login = (loginToken, userData) => {
    // Don't clear other role - allow admin and user logged in at once (different tabs)
    setAuth(loginToken, userData, false);
    setUser(userData);
    setToken(loginToken); // Update token state
  };

  const logout = () => {
    // IMPORTANT: Check localStorage directly to determine which user is logged in THIS tab
    // Don't rely on state or getUser() which might return the wrong user if both are logged in
    const adminToken = localStorage.getItem('admin_token');
    const adminUserStr = localStorage.getItem('admin_user');
    const userToken = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    // Check which storage actually exists for THIS tab's context
    // If we're on admin routes, clear admin storage
    // If we're on regular routes, clear regular user storage
    const currentPath = window.location.pathname;
    
    if ((currentPath.startsWith('/admin') || currentPath === '/admin-login') && adminToken && adminUserStr) {
      // This is an admin tab - clear only admin storage
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      setUser(null);
      window.location.href = '/admin-login';
    } else if (userToken && userStr) {
      // This is a regular user tab - clear only regular user storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      window.location.href = '/login';
    } else {
      // Fallback: clear based on current user state
      if (user && user.role === 'admin') {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        setUser(null);
        window.location.href = '/admin-login';
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        window.location.href = '/login';
      }
    }
  };

  const updateUser = (userData) => {
    // Get the appropriate token based on user role
    const updateToken = userData && userData.role === 'admin'
      ? localStorage.getItem('admin_token')
      : localStorage.getItem('token');
    if (updateToken) {
      // During update, don't clear other role's storage
      setAuth(updateToken, userData, false);
      setUser(userData);
      setToken(updateToken); // Update token state
    }
  };

  // Check authentication - use stored data, not just user state
  // This ensures isAuthenticated works even on login pages
  // Make it reactive by checking both user state and localStorage
  const checkAuth = () => {
    // First check if user is loaded in state
    if (user) return true;
    
    // Otherwise check localStorage directly
    const currentPath = window.location.pathname;
    const isAdminRoute = currentPath.startsWith('/admin') || currentPath === '/admin-login';
    
    if (isAdminRoute) {
      const adminToken = localStorage.getItem('admin_token');
      const adminUser = localStorage.getItem('admin_user');
      return !!(adminToken && adminUser);
    } else {
      const userToken = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      return !!(userToken && userData);
    }
  };

  const value = {
    user,
    token, // Use token state instead of function
    isAuthenticated: checkAuth(),
    login,
    logout,
    updateUser,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
 
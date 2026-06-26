import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { getApiUrl } from '@/config/env';

const AuthContext = createContext(null);

const API = getApiUrl();

// All requests include cookies — no Authorization header needed.
// The backend sets httpOnly cookies on login; axios sends them automatically
// when withCredentials is true.
axios.defaults.withCredentials = true;

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const response = await axios.get(`${API}/auth/me`);
        setUser(response.data);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      const response = await axios.post(`${API}/auth/login`, { email, password }, {
        timeout: 10000
      });
      const { user: userData } = response.data;
      if (!userData) throw new Error('Invalid response from server');
      setUser(userData);
      return userData;
    } catch (error) {
      if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
        throw new Error('Cannot connect to backend server.');
      }
      if (error.code === 'ECONNABORTED') {
        throw new Error('Request timeout. The server took too long to respond.');
      }
      if (error.response) {
        throw new Error(error.response.data?.detail || 'Login failed');
      }
      throw error;
    }
  }, []);

  const register = useCallback(async (email, password, full_name, phone) => {
    const response = await axios.post(`${API}/auth/register`, {
      email, password, full_name, phone
    });
    const { user: userData } = response.data;
    setUser(userData);
    return userData;
  }, []);

  const logout = useCallback(async () => {
    try {
      await axios.post(`${API}/auth/logout`);
    } catch {
      // Ignore logout errors — clear client state regardless
    }
    setUser(null);
  }, []);

  // Stable no-op — cookies carry auth automatically via withCredentials.
  // Kept for call-site compatibility; spreading `getAuthHeader()` into
  // axios config is harmless and avoids touching every consumer.
  const getAuthHeader = useCallback(() => ({}), []);

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      getAuthHeader,
      isAdmin: user?.role === 'admin',
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

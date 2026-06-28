import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { getApiUrl } from '@/config/env';

const AuthContext = createContext(null);

const API = getApiUrl();

axios.defaults.withCredentials = true;

const TOKEN_KEY = 'voice_token';

function setAxiosToken(token) {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    sessionStorage.setItem(TOKEN_KEY, token);
  } else {
    delete axios.defaults.headers.common['Authorization'];
    sessionStorage.removeItem(TOKEN_KEY);
  }
}

// Restore token on page load
const savedToken = sessionStorage.getItem(TOKEN_KEY);
if (savedToken) setAxiosToken(savedToken);

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
        setAxiosToken(null);
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
      const { user: userData, access_token } = response.data;
      if (!userData) throw new Error('Invalid response from server');
      setAxiosToken(access_token);
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
    const { user: userData, access_token } = response.data;
    setAxiosToken(access_token);
    setUser(userData);
    return userData;
  }, []);

  const logout = useCallback(async () => {
    try {
      await axios.post(`${API}/auth/logout`);
    } catch {
      // Ignore logout errors — clear client state regardless
    }
    setAxiosToken(null);
    setUser(null);
  }, []);

  const getAuthHeader = useCallback(() => ({}), []);

  const refreshUser = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/auth/me`);
      setUser(response.data);
    } catch {
      setUser(null);
      setAxiosToken(null);
    }
  }, []);

  const updateUser = useCallback((userData) => {
    setUser(userData);
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      refreshUser,
      updateUser,
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

import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

import { getApiUrl, getBackendUrl } from '@/config/env';

const API = getApiUrl();
if (!getBackendUrl() || getBackendUrl() === 'http://localhost:8000') {
  if (import.meta.env.DEV) {
    console.warn('Using default backend URL. Set VITE_BACKEND_URL in .env for production.');
  }
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('token');
      if (savedToken) {
        try {
          const response = await axios.get(`${API}/auth/me`, {
            headers: { Authorization: `Bearer ${savedToken}` }
          });
          setUser(response.data);
          setToken(savedToken);
        } catch (error) {
          console.error('Token validation failed:', error.response?.data || error.message);
          localStorage.removeItem('token');
          setToken(null);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      if (!getBackendUrl()) {
        throw new Error('Backend URL is not configured. Please set VITE_BACKEND_URL in your .env file.');
      }

      const response = await axios.post(`${API}/auth/login`, { email, password }, {
        timeout: 10000 // 10 second timeout
      });
      
      const { access_token, user: userData } = response.data;
      
      if (!access_token || !userData) {
        throw new Error('Invalid response from server');
      }

      localStorage.setItem('token', access_token);
      setToken(access_token);
      setUser(userData);
      return userData;
    } catch (error) {
      // Enhanced error handling
      if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
        throw new Error('Cannot connect to backend server. Please ensure the backend is running.');
      }
      if (error.code === 'ECONNABORTED') {
        throw new Error('Request timeout. The server took too long to respond.');
      }
      if (error.response) {
        // Server responded with error status
        const detail = error.response.data?.detail || 'Login failed';
        throw new Error(detail);
      }
      // Other errors
      throw error;
    }
  };

  const register = async (email, password, full_name, phone) => {
    const response = await axios.post(`${API}/auth/register`, {
      email,
      password,
      full_name,
      phone
    });
    const { access_token, user: userData } = response.data;
    localStorage.setItem('token', access_token);
    setToken(access_token);
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const getAuthHeader = () => ({
    headers: { Authorization: `Bearer ${token}` }
  });

  return (
    <AuthContext.Provider value={{
      user,
      token,
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
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

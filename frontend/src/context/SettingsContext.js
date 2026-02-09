import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { getApiUrl } from '@/config/env';

const SettingsContext = createContext(null);
const API = getApiUrl();

const defaultSettings = {
  site_name: "VOICE-Victims' Outreach & Initiative for Crime of Medical Negligence",
  tagline: "",
  logo_url: null,
  contact_email: "",
  contact_phone: "",
  address: "",
  upi_id: "",
  upi_payee_name: "",
  hero_title: "",
  hero_subtitle: "",
  about_mission: "",
  about_vision: "",
  facebook_url: null,
  twitter_url: null,
  instagram_url: null,
  stats_years_of_service: 1,
  stats_cases_resolved: 0
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await axios.get(`${API}/settings`);
        setSettings({ ...defaultSettings, ...response.data });
      } catch (error) {
        console.error('Error fetching settings:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const refreshSettings = async () => {
    try {
      const response = await axios.get(`${API}/settings`);
      setSettings({ ...defaultSettings, ...response.data });
    } catch (error) {
      console.error('Error refreshing settings:', error);
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, loading, refreshSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
};

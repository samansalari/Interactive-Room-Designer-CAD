import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppSettings } from '../types';
import { useColorMode } from '@chakra-ui/react';

interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  resetSettings: () => void;
}

const defaultSettings: AppSettings = {
  unitSystem: 'metric',
  gridSize: 20,
  showGrid: true,
  theme: 'light',
  font: 'geist',
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const { setColorMode } = useColorMode();

  // Load settings from localStorage on initial render
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('appSettings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }, []);

  // Update settings in localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem('appSettings', JSON.stringify(settings));
      
      // Apply theme settings
      setColorMode(settings.theme);
      
      // Apply font settings
      const fontFamily = getFontFamily(settings.font);
      document.documentElement.style.setProperty('--font-family', fontFamily);
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }, [settings, setColorMode]);

  const getFontFamily = (font: string): string => {
    switch (font) {
      case 'roboto':
        return 'Roboto, system-ui, sans-serif';
      case 'openSans':
        return 'Open Sans, system-ui, sans-serif';
      default:
        return 'Geist, system-ui, sans-serif';
    }
  };

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
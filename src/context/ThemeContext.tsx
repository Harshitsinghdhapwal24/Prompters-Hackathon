'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { getStoredSettings, saveStoredSettings } from '@/lib/storage';

interface ThemeContextType {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  setTheme: (t: 'dark' | 'light') => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  toggleTheme: () => {},
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const settings = getStoredSettings();
    const initialTheme = settings.theme || 'dark';
    setThemeState(initialTheme);
    applyThemeClass(initialTheme);
  }, []);

  const applyThemeClass = (newTheme: 'dark' | 'light') => {
    const root = document.documentElement;
    if (newTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setThemeState(nextTheme);
    applyThemeClass(nextTheme);
    saveStoredSettings({ theme: nextTheme });
  };

  const setTheme = (t: 'dark' | 'light') => {
    setThemeState(t);
    applyThemeClass(t);
    saveStoredSettings({ theme: t });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

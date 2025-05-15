import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [useSystemTheme, setUseSystemTheme] = useState(false);

  // Function to detect system theme
  const detectSystemTheme = useCallback(() => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }, []);

  // Initialize theme based on settings store or system preference
  useEffect(() => {
    const loadThemeSettings = async () => {
      try {
        // Try to load from settings store first
        const themeSettings = await window.electronAPI.getThemeSettings();

        if (themeSettings) {
          if (themeSettings.useSystemTheme) {
            setUseSystemTheme(true);
            setIsDarkMode(detectSystemTheme());
          } else {
            setIsDarkMode(themeSettings.isDarkMode);
          }
          return;
        }

        // Fall back to localStorage for backward compatibility
        const savedUseSystemTheme = localStorage.getItem('useSystemTheme');
        const savedTheme = localStorage.getItem('theme');

        if (savedUseSystemTheme === 'true') {
          setUseSystemTheme(true);
          setIsDarkMode(detectSystemTheme());
        } else if (savedTheme === 'dark') {
          setIsDarkMode(true);
        }
      } catch (error) {
        console.error('Error loading theme settings:', error);
      }
    };

    loadThemeSettings();
  }, [detectSystemTheme]);

  // Listen for system theme changes
  useEffect(() => {
    if (!useSystemTheme) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      setIsDarkMode(e.matches);
    };

    // Add event listener
    mediaQuery.addEventListener('change', handleChange);

    // Clean up
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [useSystemTheme]);

  // Toggle manual theme
  const toggleTheme = () => {
    if (useSystemTheme) return; // Don't allow manual toggle when using system theme

    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);

    // Save to settings store
    window.electronAPI.saveThemeSettings({
      isDarkMode: newTheme,
      useSystemTheme: false
    });

    // Also save to localStorage for backward compatibility
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  // Toggle whether to use system theme
  const toggleUseSystemTheme = () => {
    const newUseSystemTheme = !useSystemTheme;
    setUseSystemTheme(newUseSystemTheme);

    // Update system theme state
    if (newUseSystemTheme) {
      // If enabling system theme, immediately apply system preference
      const systemIsDark = detectSystemTheme();
      setIsDarkMode(systemIsDark);

      // Save to settings store
      window.electronAPI.saveThemeSettings({
        isDarkMode: systemIsDark,
        useSystemTheme: true
      });
    } else {
      // If disabling system theme, revert to saved theme or default to light
      const savedTheme = localStorage.getItem('theme');
      const newIsDarkMode = savedTheme === 'dark';
      setIsDarkMode(newIsDarkMode);

      // Save to settings store
      window.electronAPI.saveThemeSettings({
        isDarkMode: newIsDarkMode,
        useSystemTheme: false
      });
    }

    // Also save to localStorage for backward compatibility
    localStorage.setItem('useSystemTheme', newUseSystemTheme.toString());
  };

  return (
    <ThemeContext.Provider value={{
      isDarkMode,
      toggleTheme,
      useSystemTheme,
      toggleUseSystemTheme
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
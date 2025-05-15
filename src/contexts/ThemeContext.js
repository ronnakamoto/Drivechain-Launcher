import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [useSystemTheme, setUseSystemTheme] = useState(false);

  // Function to detect system theme
  const detectSystemTheme = useCallback(() => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }, []);

  // Initialize theme based on localStorage or system preference
  useEffect(() => {
    const savedUseSystemTheme = localStorage.getItem('useSystemTheme');
    const savedTheme = localStorage.getItem('theme');

    if (savedUseSystemTheme === 'true') {
      setUseSystemTheme(true);
      setIsDarkMode(detectSystemTheme());
    } else if (savedTheme === 'dark') {
      setIsDarkMode(true);
    }
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
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  // Toggle whether to use system theme
  const toggleUseSystemTheme = () => {
    const newUseSystemTheme = !useSystemTheme;
    setUseSystemTheme(newUseSystemTheme);
    localStorage.setItem('useSystemTheme', newUseSystemTheme.toString());

    if (newUseSystemTheme) {
      // If enabling system theme, immediately apply system preference
      const systemIsDark = detectSystemTheme();
      setIsDarkMode(systemIsDark);
    } else {
      // If disabling system theme, revert to saved theme or default to light
      const savedTheme = localStorage.getItem('theme');
      setIsDarkMode(savedTheme === 'dark');
    }
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
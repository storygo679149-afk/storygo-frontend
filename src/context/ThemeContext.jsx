import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ThemeContext = createContext(null);

const THEME_KEY = 'pocket-fm-theme';
const FONT_SIZE_KEY = 'pocket-fm-font-size';

// Available font sizes
const fontSizes = {
  small:   { scale: 0.875, label: 'Small' },
  normal:  { scale: 1,     label: 'Normal' },
  large:   { scale: 1.125, label: 'Large' },
  xlarge:  { scale: 1.25,  label: 'Extra Large' },
};

export const ThemeProvider = ({ children }) => {
  // ---- State ----
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem(THEME_KEY) || 'dark';
  });

  const [fontSize, setFontSize] = useState(() => {
    return localStorage.getItem(FONT_SIZE_KEY) || 'normal';
  });

  const [isTransitioning, setIsTransitioning] = useState(false);

  // ---- Apply theme to <html> ----
  useEffect(() => {
    const root = document.documentElement;

    // Data attribute for CSS selectors
    root.setAttribute('data-theme', theme);

    // Update meta theme-color for mobile browsers
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute(
        'content',
        theme === 'dark' ? '#08080C' : '#F8F8FC'
      );
    }

    // Font size
    const scale = fontSizes[fontSize].scale;
    root.style.fontSize = `${16 * scale}px`;

    // Persist
    localStorage.setItem(THEME_KEY, theme);
    localStorage.setItem(FONT_SIZE_KEY, fontSize);
  }, [theme, fontSize]);

  // ---- Actions ----
  const toggleTheme = useCallback(() => {
    setIsTransitioning(true);
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
    // Let CSS transitions finish before removing the flag
    setTimeout(() => setIsTransitioning(false), 400);
  }, []);

  const setThemeMode = useCallback((mode) => {
    if (mode === 'dark' || mode === 'light') {
      setIsTransitioning(true);
      setTheme(mode);
      setTimeout(() => setIsTransitioning(false), 400);
    }
  }, []);

  const setFontSizeLevel = useCallback((size) => {
    if (fontSizes[size]) {
      setFontSize(size);
    }
  }, []);

  const value = {
    // Current values
    theme,                    // 'dark' | 'light'
    isDark: theme === 'dark',
    isLight: theme === 'light',
    fontSize,
    fontSizeScale: fontSizes[fontSize].scale,
    fontSizeLabel: fontSizes[fontSize].label,
    isTransitioning,

    // Actions
    toggleTheme,
    setTheme: setThemeMode,
    setFontSize: setFontSizeLevel,

    // Available options
    availableFontSizes: Object.entries(fontSizes).map(([key, val]) => ({
      key,
      label: val.label,
    })),
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;
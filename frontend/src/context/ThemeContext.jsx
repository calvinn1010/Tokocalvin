import React, { createContext, useState, useContext, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [nightMode, setNightMode] = useState(() => {
    const saved = localStorage.getItem('nightMode');
    return saved === 'true';
  });

  useEffect(() => {
    localStorage.setItem('nightMode', nightMode ? 'true' : 'false');
    if (nightMode) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }, [nightMode]);

  return (
    <ThemeContext.Provider value={{ nightMode, setNightMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

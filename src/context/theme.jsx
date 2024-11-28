"use client";
import { createContext, useEffect, useState } from "react";

export const ThemeContext = createContext("");

export const ThemeProvider = ({ children }) => {
  const [isLightTheme, setIsLightTheme] = useState(false);

  const updateTheme = () => {
    setIsLightTheme(!isLightTheme);
  };

  useEffect(() => {
    document.body.style.backgroundColor = isLightTheme ? "#F5F5F1" : "#1E1B1A";
  }, [isLightTheme]);

  return (
    <ThemeContext.Provider value={{ isLightTheme, updateTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

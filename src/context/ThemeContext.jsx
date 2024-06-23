import React, { createContext, useContext, useEffect, useState } from "react";
import Cookies from 'js-cookie';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => Cookies.get("theme") || "dark");

  useEffect(() => {
    // Remove todas as classes de tema antes de adicionar a classe do tema atual
    document.documentElement.className = theme;
    Cookies.set("theme", theme, { expires: 30 });
  }, [theme]);

  const changeTheme = (selectedTheme) => {
    setTheme(selectedTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, changeTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
// ThemeContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

    useEffect(() => {
        document.documentElement.classList.add(theme);
        return () => {
            document.documentElement.classList.remove(theme);
        };
    }, [theme]);

    const changeTheme = (selectedTheme) => {
        setTheme(selectedTheme);
        localStorage.setItem('theme', selectedTheme);

        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(selectedTheme);
    };

    return (
        <ThemeContext.Provider value={{ theme, changeTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);

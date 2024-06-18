// ThemeChange.js
import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import "./ThemeChange.scss";

function ThemeChange() {
    const { theme, changeTheme } = useTheme();

    const handleChange = (event) => {
        const selectedTheme = event.target.value;
        changeTheme(selectedTheme);
    };

    return (
        <div id='change-theme'>
            <p>Mudar tema</p>
            <select id="theme-select" value={theme} onChange={handleChange}>
                <option value="dark">Escuro</option>
                <option value="light">Claro</option>
            </select>
        </div>
    );
}

export default ThemeChange;

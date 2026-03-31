import { createContext, useContext, useEffect, useMemo, useState } from "react";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
    const [darkMode, setDarkMode] = useState(() => localStorage.getItem("darkMode") !== "false");

    useEffect(() => {
        localStorage.setItem("darkMode", String(darkMode));
        document.documentElement.dataset.themeMode = darkMode ? "dark" : "light";
        document.body.classList.toggle("dark", darkMode);
    }, [darkMode]);

    const value = useMemo(() => ({ darkMode, setDarkMode }), [darkMode]);

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemeMode() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useThemeMode must be used inside ThemeProvider");
    }

    return context;
}

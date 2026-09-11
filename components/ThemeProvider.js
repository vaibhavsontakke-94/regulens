import { createContext, useCallback, useContext, useEffect, useState } from "react";

const ThemeContext = createContext({ theme: "light", setTheme: () => {} });

const THEME_KEY = "regulens-theme";
const THEMES = ["light", "dark", "system"];

function getSystemDark() {
  if (typeof window === "undefined") return false;
  return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function applyTheme(theme, systemDark) {
  const resolved = theme === "system" ? (systemDark ? "dark" : "light") : theme;
  const root = document.documentElement;
  root.classList.toggle("dark", resolved === "dark");
  root.style.colorScheme = resolved;
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState("light");

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(THEME_KEY);
      if (THEMES.includes(stored)) setThemeState(stored);
    } catch (e) {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applyTheme(theme, mql.matches);
    if (theme === "system") {
      mql.addEventListener("change", handler);
      applyTheme(theme, mql.matches);
    } else {
      applyTheme(theme, getSystemDark());
    }
    return () => mql.removeEventListener("change", handler);
  }, [theme]);

  const setTheme = useCallback((next) => {
    setThemeState(next);
    try {
      window.localStorage.setItem(THEME_KEY, next);
    } catch (e) {
      /* ignore */
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
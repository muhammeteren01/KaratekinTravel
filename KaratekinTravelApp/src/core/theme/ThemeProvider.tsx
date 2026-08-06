import React, { createContext, useContext, useMemo } from "react";
import { useColorScheme } from "react-native";
import { makeTokens, ThemeTokens } from "./tokens";

const ThemeContext = createContext<ThemeTokens | null>(null);

export const AppThemeProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const scheme = useColorScheme();
  const tokens = useMemo(
    () => makeTokens(scheme === "dark" ? "dark" : "light"),
    [scheme],
  );
  return (
    <ThemeContext.Provider value={tokens}>{children}</ThemeContext.Provider>
  );
};

export const useAppTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useAppTheme must be used within AppThemeProvider");
  return ctx;
};

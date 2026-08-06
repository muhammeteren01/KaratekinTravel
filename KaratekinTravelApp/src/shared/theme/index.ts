import React, { createContext, useContext, useMemo } from "react";
import { useColorScheme } from "react-native";

// ---- Tokens (merged from core/theme/tokens.ts and shared/ui/theme.ts) ----
export type ColorTokens = {
  primary: string;
  primaryDark: string;
  brandBlue: string;
  text: string;
  textMuted: string;
  textSecondary: string;
  bg: string;
  bgSoft: string;
  bgAlt: string;
  divider: string;
  border: string;
  success: string;
  warning: string;
  error: string;
  black: string;
  white: string;
};

export type SpacingTokens = {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
  xxxl: number;
};
export type RadiusTokens = {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
  round: number;
};
export type TypographyTokens = {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
  display: number;
  weight: { regular: "400"; medium: "500"; semibold: "600"; bold: "700" };
};
export type ShadowTokens = {
  soft: {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };
  card: {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };
};

export type Theme = {
  palette: ColorTokens;
  spacing: SpacingTokens;
  radii: RadiusTokens;
  typography: TypographyTokens;
  shadows: ShadowTokens;
  mode: "light" | "dark";
};

const baseSpacing: SpacingTokens = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 30,
};
const baseRadii: RadiusTokens = {
  xs: 6,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  round: 999,
};
const baseTypography: TypographyTokens = {
  xs: 12,
  sm: 13,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 20,
  display: 36,
  weight: { regular: "400", medium: "500", semibold: "600", bold: "700" },
};

export const lightColors: ColorTokens = {
  primary: "#FF7029",
  primaryDark: "#FF6B35",
  brandBlue: "#24BAEC",
  text: "#1B1E28",
  textMuted: "#7D848D",
  textSecondary: "#333",
  bg: "#FFFFFF",
  bgSoft: "#F7F7F9",
  bgAlt: "#F8F9FA",
  divider: "#E9ECEF",
  border: "#E0E0E0",
  success: "#22C55E",
  warning: "#F59E0B",
  error: "#EF4444",
  black: "#000000",
  white: "#FFFFFF",
};

export const darkColors: ColorTokens = {
  primary: "#FF7029",
  primaryDark: "#FF6B35",
  brandBlue: "#24BAEC",
  text: "#F3F4F6",
  textMuted: "#9CA3AF",
  textSecondary: "#E5E7EB",
  bg: "#0B0F15",
  bgSoft: "#121822",
  bgAlt: "#0F141C",
  divider: "#1F2937",
  border: "#1F2A37",
  success: "#22C55E",
  warning: "#F59E0B",
  error: "#EF4444",
  black: "#000000",
  white: "#FFFFFF",
};

const makeTheme = (mode: "light" | "dark"): Theme => ({
  mode,
  palette: mode === "light" ? lightColors : darkColors,
  spacing: baseSpacing,
  radii: baseRadii,
  typography: baseTypography,
  shadows: {
    soft: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2,
    },
    card: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
      elevation: 8,
    },
  },
});

export const lightTheme: Theme = makeTheme("light");
export const darkTheme: Theme = makeTheme("dark");

// Keep a static export named `theme` for parity with previous code (light by default)
export const theme: Theme = lightTheme;

// ---- Provider + hook (merged from core/theme/ThemeProvider.tsx) ----
const ThemeContext = createContext<Theme | null>(null);

export const AppThemeProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const scheme = useColorScheme();
  const value = useMemo(
    () => makeTheme(scheme === "dark" ? "dark" : "light"),
    [scheme],
  );
  return React.createElement(ThemeContext.Provider, { value }, children as any);
};

export const useAppTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useAppTheme must be used within AppThemeProvider");
  return ctx;
};

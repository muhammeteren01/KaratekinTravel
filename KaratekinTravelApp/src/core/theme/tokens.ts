// Light/Dark theme tokens for future use (no visual changes today)
export type ColorTokens = {
  text: string;
  textMuted: string;
  textSecondary: string;
  bg: string;
  bgSoft: string;
  bgAlt: string;
  divider: string;
  border: string;
  primary: string;
  primaryDark: string;
  success: string;
  warning: string;
  error: string;
  black: string;
  white: string;
  brandBlue: string;
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

export type RadiusTokens = {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
  round: number;
};

export type ShadowTokens = {
  soft: object;
  card: object;
};

export type ThemeTokens = {
  colors: ColorTokens;
  spacing: SpacingTokens;
  radii: RadiusTokens;
  typography: TypographyTokens;
  shadows: ShadowTokens;
  mode: "light" | "dark";
};

// Keep values aligned with existing shared/ui/theme to avoid visual diffs
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

export const makeTokens = (mode: "light" | "dark"): ThemeTokens => ({
  mode,
  colors: mode === "light" ? lightColors : darkColors,
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

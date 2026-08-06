// Centralized theme tokens (colors, spacing, radii, typography, shadows)
// Turkish-only app context for now; structure supports theming later.

export type Theme = typeof theme;

export const palette = {
  // brand
  primary: '#FF7029',
  primaryDark: '#FF6B35',
  brandBlue: '#24BAEC',

  // greys
  text: '#1B1E28',
  textMuted: '#7D848D',
  textSecondary: '#333',
  bg: '#FFFFFF',
  bgSoft: '#F7F7F9',
  bgAlt: '#F8F9FA',
  divider: '#E9ECEF',
  border: '#E0E0E0',

  // state
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',

  // misc
  black: '#000000',
  white: '#FFFFFF',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 30,
};

export const radii = {
  xs: 6,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  round: 999,
};

export const typography = {
  xs: 12,
  sm: 13,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 20,
  display: 36,
  weight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};

export const shadows = {
  soft: {
    shadowColor: palette.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  card: {
    shadowColor: palette.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
};

export const theme = {
  palette,
  spacing,
  radii,
  typography,
  shadows,
};

export function useTheme() {
  return theme;
}

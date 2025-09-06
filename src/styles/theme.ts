// Zyro Premium Color Palette
export const colors = {
  // Premium Gold Colors
  goldElegant: '#C9A961',
  goldDark: '#A68B47', 
  goldBright: '#D4AF37',
  
  // Dark Theme Colors
  black: '#000000',
  darkGray: '#111111',
  mediumGray: '#666666',
  lightGray: '#999999',
  white: '#FFFFFF',
  
  // Status Colors
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  info: '#2196F3',
  
  // Semantic Colors (aliases for consistency)
  primary: '#C9A961', // goldElegant
  primaryDark: '#A68B47', // goldDark
  accent: '#D4AF37', // goldBright
  background: '#000000', // black
  surface: '#111111', // darkGray
  text: '#FFFFFF', // white
  textSecondary: '#999999', // lightGray
  border: '#666666', // mediumGray
};

// Typography
export const fonts = {
  logo: 'Cinzel', // For Zyro logo
  primary: 'Inter', // For all other text
};

export const fontSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  logo: 32,
};

export const fontWeights = {
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

// Spacing
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Border Radius
export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  round: 50,
};

// Shadows
export const shadows = {
  small: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
};

// Animation durations
export const animations = {
  fast: 200,
  normal: 300,
  slow: 500,
};

export const theme = {
  colors,
  fonts,
  fontSizes,
  fontWeights,
  spacing,
  borderRadius,
  shadows,
  animations,
};
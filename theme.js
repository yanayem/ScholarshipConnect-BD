export const theme = {
  colors: {
    // Primary Brand
    primary: '#2A9D8F',       // Warm Teal
    primaryHover: '#23867A',
    primaryLight: '#E6F7F5',
    primaryDark: '#1F6F66',

    // Backgrounds
    background: '#F8F2E7',    // Warm Cream
    secondaryBackground: '#FCF8F2',
    surface: '#FFFFFF',       // Card/Surface
    sidebar: '#FFFCF8',

    // Typography
    heading: '#222222',
    textPrimary: '#333333',
    textSecondary: '#6B7280',
    placeholder: '#9CA3AF',
    disabled: '#C7CBD1',

    // Borders & Dividers
    border: '#ECECEC',
    divider: '#F2F2F2',
    inputBorder: '#E5E7EB',

    // Pastel Section Colors
    tealCard: '#E6F7F5',
    lavenderCard: '#F2ECFF',
    peachCard: '#FFF2E8',
    yellowCard: '#FFF8D8',
    mintCard: '#EEF9F2',

    // Status Colors
    success: '#4CAF50',
    warning: '#F4B942',
    error: '#E85D75',
    info: '#6AA9FF',
  },
  typography: {
    fontFamily: {
      regular: 'Inter-Regular',
      medium: 'Inter-Medium',
      bold: 'Inter-Bold',
      semiBold: 'Inter-SemiBold',
    },
    sizes: {
      xs: 12,
      sm: 14,
      base: 16,
      lg: 18,
      xl: 20,
      xxl: 24,
      h1: 32,
      h2: 28,
    }
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    base: 12,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    full: 9999,
  },
  shadows: {
    soft: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.03,
      shadowRadius: 6,
      elevation: 1,
    },
    premium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.05,
      shadowRadius: 12,
      elevation: 3,
    }
  }
};

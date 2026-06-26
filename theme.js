export const theme = {
  colors: {
    background: '#FFF8F0',    // Warm Cream
    surface: '#FFFFFF',       // Card/Surface
    primaryAccent: '#EDE7FF', // Soft Lavender
    secondaryAccent: '#FFE7DF', // Soft Peach
    communityMint: '#EAF7F7', // Soft Mint
    ctaPrimary: '#FFC93C',    // Warm Yellow
    textPrimary: '#2D3748',
    textSecondary: '#718096',
    border: '#E5E7EB',
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
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  },
  shadows: {
    soft: {
      shadowColor: '#2D3748',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.05,
      shadowRadius: 12,
      elevation: 2,
    },
    medium: {
      shadowColor: '#2D3748',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.08,
      shadowRadius: 16,
      elevation: 4,
    }
  }
};

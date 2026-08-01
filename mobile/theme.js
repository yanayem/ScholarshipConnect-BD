// =============================================================================
//  ScholarshipConnect BD — Design System Tokens
//  Version: 2.0.0
//  Style: Premium · Warm Teal · Minimal · Academic · Modern SaaS
// =============================================================================

/**
 * DESIGN SYSTEM: Global theme tokens for the application.
 * - Defines Colors, Typography, Spacing, Shadows, and Border Radii.
 * - Centralized source of truth for the "Premium Warm Teal" look.
 * - Connected to: All UI components and screens in the mobile app.
 */
export const theme = {
  // ---------------------------------------------------------------------------
  // COLORS
  // ---------------------------------------------------------------------------
  colors: {
    // — Primary Brand (Sophisticated Warm Teal) ——————————————————————————————
    primary:        '#2A9D8F',   // Main brand teal
    primaryHover:   '#23867A',   // Hover / pressed state
    primaryLight:   '#E6F7F5',   // Tint for backgrounds, badges
    primaryDark:    '#1F6F66',   // Dark variant for contrast

    // — Backgrounds ——————————————————————————————————————————————————————————
    background:          '#F8F2E7',   // Main app background — Warm Cream
    secondaryBackground: '#F5F5F5',   // Section / secondary areas
    surface:             '#FFFFFF',   // Cards, modals, sheets
    sidebar:             '#FFFFFF',   // Navigation sidebar

    // — Typography ———————————————————————————————————————————————————————————
    heading:       '#222222',   // H1–H3, page titles
    textPrimary:   '#333333',   // Body text, labels
    textSecondary: '#6B7280',   // Captions, helper text
    placeholder:   '#9CA3AF',   // Input placeholders
    disabled:      '#C7CBD1',   // Disabled labels & icons

    // — Borders & Dividers ———————————————————————————————————————————————————
    border:      '#ECECEC',     // General component borders
    divider:     '#F2F2F2',     // Horizontal rules, list separators
    inputBorder: '#E5E7EB',     // Input field borders (default)

    // — Pastel Section Cards ——————————————————————————————————————————————————
    tealCard:     '#E6F7F5',   // Teal-tinted card / badge bg
    lavenderCard: '#F2ECFF',   // Purple-tinted accent card
    peachCard:    '#FFF2E8',   // Warm peach highlight card
    yellowCard:   '#FFF8D8',   // Soft yellow info card
    mintCard:     '#EEF9F2',   // Soft mint success card

    // — Status & Feedback ————————————————————————————————————————————————————
    success: '#4CAF50',   // Confirmed, approved
    warning: '#F4B942',   // Pending, caution
    error:   '#E85D75',   // Error, rejected
    info:    '#6AA9FF',   // Informational

    // — Status Light Variants (background pills / banners) ——————————————————
    successLight: '#EEF9F2',
    warningLight: '#FFF8D8',
    errorLight:   '#FFF0F3',
    infoLight:    '#EBF3FF',

    // — Charts & Data Viz ————————————————————————————————————————————————————
    chartPrimary:   '#2A9D8F',   // Primary data series
    chartSecondary: '#8E7DF5',   // Secondary data series
    chartAccent:    '#F4B942',   // Accent / highlight series
    chartExtra:     '#FFB38A',   // Extra / fourth series
    chartNeutral:   '#CBD5E1',   // Empty / placeholder bars

    // — Progress Bars ————————————————————————————————————————————————————————
    progressFilled: '#2A9D8F',
    progressBg:     '#E6F7F5',

    // — Icon States ———————————————————————————————————————————————————————————
    iconDefault: '#6B7280',
    iconActive:  '#2A9D8F',
    iconMuted:   '#A0AEC0',

    // — White & Transparency ——————————————————————————————————————————————————
    white:       '#FFFFFF',
    black:       '#000000',
    transparent: 'transparent',
  },

  // ---------------------------------------------------------------------------
  // PLACEHOLDERS (Standard images for missing data)
  // ---------------------------------------------------------------------------
  images: {
    avatar:      'https://ui-avatars.com/api/?background=2A9D8F&color=fff&name=',
    scholarship: 'https://images.unsplash.com/photo-1523050335456-c38a70c7ef21?w=800&q=80',
    blog:        'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&q=80',
    mentor:      'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80',
  },

  // ---------------------------------------------------------------------------
  // TYPOGRAPHY
  // ---------------------------------------------------------------------------
  typography: {
    fontFamily: {
      regular:  'Inter-Regular',
      medium:   'Inter-Medium',
      semiBold: 'Inter-SemiBold',
      bold:     'Inter-Bold',
    },
    sizes: {
      xs:   12,
      sm:   14,
      base: 16,
      lg:   18,
      xl:   20,
      xxl:  24,
      h3:   20,
      h2:   28,
      h1:   32,
    },
    lineHeights: {
      tight:   1.2,
      normal:  1.5,
      relaxed: 1.75,
    },
    letterSpacing: {
      tight:  -0.5,
      normal:  0,
      wide:    0.5,
      wider:   1.0,
    },
  },

  // ---------------------------------------------------------------------------
  // SPACING
  // ---------------------------------------------------------------------------
  spacing: {
    xxs:  2,
    xs:   4,
    sm:   8,
    md:   16,
    lg:   24,
    xl:   32,
    xxl:  48,
    xxxl: 64,
  },

  // ---------------------------------------------------------------------------
  // BORDER RADIUS
  // ---------------------------------------------------------------------------
  borderRadius: {
    none:   0,
    xs:     4,
    sm:     8,
    base:   12,
    md:     12,
    lg:     16,
    xl:     24,
    xxl:    32,
    full:   999,
  },

  // ---------------------------------------------------------------------------
  // SHADOWS (React Native — shadowColor + elevation)
  // ---------------------------------------------------------------------------
  shadows: {
    none: {
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    xs: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 1,
    },
    soft: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 3,
    },
    card: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.08,
      shadowRadius: 16,
      elevation: 6,
    },
    premium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.12,
      shadowRadius: 24,
      elevation: 10,
    },
    teal: {
      shadowColor: '#2A9D8F',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.25,
      shadowRadius: 16,
      elevation: 8,
    },
  },

  // ---------------------------------------------------------------------------
  // COMPONENT TOKENS — Buttons
  // ---------------------------------------------------------------------------
  button: {
    primary: {
      background: '#2A9D8F',
      text:       '#FFFFFF',
      hover:      '#23867A',
      border:     'transparent',
    },
    secondary: {
      background: '#FFFFFF',
      text:       '#2A9D8F',
      hover:      '#E6F7F5',
      border:     '#2A9D8F',
    },
    ghost: {
      background: 'transparent',
      text:       '#2A9D8F',
      hover:      '#E6F7F5',
      border:     'transparent',
    },
    danger: {
      background: '#E85D75',
      text:       '#FFFFFF',
      hover:      '#D04A61',
      border:     'transparent',
    },
    disabled: {
      background: '#F2F2F2',
      text:       '#C7CBD1',
      border:     'transparent',
    },
    // Dimensions
    height: {
      sm: 36,
      md: 44,
      lg: 52,
    },
    paddingHorizontal: {
      sm: 12,
      md: 20,
      lg: 28,
    },
  },

  // ---------------------------------------------------------------------------
  // COMPONENT TOKENS — Inputs
  // ---------------------------------------------------------------------------
  input: {
    background:   '#F5F5F5',
    border:       '#E5E7EB',
    focusBorder:  '#2A9D8F',
    focusShadow:  'rgba(42,157,143,0.15)',
    errorBorder:  '#E85D75',
    text:         '#333333',
    placeholder:  '#9CA3AF',
    label:        '#333333',
    height:       48,
    borderRadius: 0,
  },

  // ---------------------------------------------------------------------------
  // COMPONENT TOKENS — Cards
  // ---------------------------------------------------------------------------
  card: {
    background:   '#FFFFFF',
    border:       '#F2F2F2',
    borderWidth:  1,
    borderRadius: 20,
    shadow:       '0 10px 30px rgba(0,0,0,0.06)',
    padding:      20,
  },

  // ---------------------------------------------------------------------------
  // COMPONENT TOKENS — Badges / Tags
  // ---------------------------------------------------------------------------
  badge: {
    success:  { bg: '#EEF9F2', text: '#2E7D32' },
    warning:  { bg: '#FFF8D8', text: '#B7880A' },
    error:    { bg: '#FFF0F3', text: '#C62828' },
    info:     { bg: '#EBF3FF', text: '#1565C0' },
    primary:  { bg: '#E6F7F5', text: '#1F6F66' },
    neutral:  { bg: '#F2F2F2', text: '#6B7280' },
  },

  // ---------------------------------------------------------------------------
  // COMPONENT TOKENS — Navigation / Tab Bar
  // ---------------------------------------------------------------------------
  nav: {
    background:     '#FFFCF8',
    activeIcon:     '#2A9D8F',
    inactiveIcon:   '#A0AEC0',
    activeLabel:    '#2A9D8F',
    inactiveLabel:  '#9CA3AF',
    indicator:      '#2A9D8F',
    border:         '#ECECEC',
  },

  // ---------------------------------------------------------------------------
  // ANIMATION DURATIONS (ms)
  // ---------------------------------------------------------------------------
  animation: {
    fast:   150,
    normal: 250,
    slow:   400,
  },
};

// ---------------------------------------------------------------------------
// SEMANTIC ALIASES — convenience exports
// ---------------------------------------------------------------------------
export const colors    = theme.colors;
export const spacing   = theme.spacing;
export const radius    = theme.borderRadius;
export const shadows   = theme.shadows;
export const fonts     = theme.typography;

export default theme;

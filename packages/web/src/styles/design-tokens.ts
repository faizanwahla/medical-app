/**
 * Design Tokens - Centralized design system configuration
 * Used for consistent spacing, typography, colors, and responsive breakpoints
 */

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
} as const;

export const typography = {
  // Page Title
  pageTitle: {
    desktop: { fontSize: '32px', fontWeight: 'bold', lineHeight: '1.2' },
    mobile: { fontSize: '24px', fontWeight: 'bold', lineHeight: '1.2' },
  },
  // Section Header
  sectionHeader: {
    desktop: { fontSize: '24px', fontWeight: 'bold', lineHeight: '1.3' },
    mobile: { fontSize: '18px', fontWeight: 'bold', lineHeight: '1.3' },
  },
  // Subheader
  subheader: {
    desktop: { fontSize: '18px', fontWeight: '600', lineHeight: '1.4' },
    mobile: { fontSize: '16px', fontWeight: '600', lineHeight: '1.4' },
  },
  // Body
  body: {
    desktop: { fontSize: '16px', fontWeight: '400', lineHeight: '1.5' },
    mobile: { fontSize: '14px', fontWeight: '400', lineHeight: '1.5' },
  },
  // Caption
  caption: {
    fontSize: '12px',
    fontWeight: '400',
    lineHeight: '1.4',
    color: '#6b7280',
  },
} as const;

export const colors = {
  primary: '#0ea5e9',
  primaryDark: '#0284c7',
  primaryLight: '#7dd3fc',

  success: '#10b981',
  successLight: '#d1fae5',
  successDark: '#047857',

  warning: '#f59e0b',
  warningLight: '#fef3c7',
  warningDark: '#d97706',

  error: '#ef4444',
  errorLight: '#fee2e2',
  errorDark: '#dc2626',

  info: '#3b82f6',
  infoLight: '#dbeafe',
  infoDark: '#1d4ed8',

  critical: '#dc2626',
  criticalLight: '#fee2e2',
  criticalDark: '#991b1b',

  neutral: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },

  medical: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c3d66',
  },
} as const;

export const breakpoints = {
  mobile: '320px',
  mobileLg: '480px',
  tablet: '768px',
  tabletLg: '1024px',
  desktop: '1280px',
  desktopLg: '1440px',
} as const;

export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
} as const;

export const borderRadius = {
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  full: '9999px',
} as const;

export const transitions = {
  fast: '150ms ease-in-out',
  base: '200ms ease-in-out',
  slow: '300ms ease-in-out',
} as const;

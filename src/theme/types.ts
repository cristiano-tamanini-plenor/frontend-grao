/**
 * Color format - accepts both HSL and HEX values
 * HSL Example: "209 29% 32%" for hsl(209, 29%, 32%)
 * HEX Example: "#1F212A" or "1F212A"
 */
export type ColorValue = string;

/**
 * Gradient definition
 */
export type Gradient = string;

/**
 * Shadow definition
 */
export type Shadow = string;

/**
 * Sidebar color palette
 */
export interface SidebarColors {
  bg: ColorValue;
  background: ColorValue;
  foreground: ColorValue;
  primary: ColorValue;
  primaryForeground: ColorValue;
  accent: ColorValue;
  accentForeground: ColorValue;
  border: ColorValue;
  ring: ColorValue;
  itemHover: ColorValue;
  sectionLabel: ColorValue;
  separator: ColorValue;
}

/**
 * Status color palette (success, warning, info)
 */
export interface StatusColors {
  success: ColorValue;
  successForeground: ColorValue;
  warning: ColorValue;
  warningForeground: ColorValue;
  info: ColorValue;
  infoForeground: ColorValue;
}

/**
 * Primary color palette
 */
export interface PrimaryColors {
  primary: ColorValue;
  primaryForeground: ColorValue;
  primaryHover: ColorValue;
}

/**
 * Secondary color palette
 */
export interface SecondaryColors {
  secondary: ColorValue;
  secondaryForeground: ColorValue;
  secondaryHover: ColorValue;
}

/**
 * Complete theme colors structure
 */
export interface ThemeColors {
  // Layout
  headerHeight: string;
  headerBgColor: ColorValue;

  footerHeight: string;
  footerBgColor: ColorValue;

  // Primary colors
  primary: ColorValue;
  primaryForeground: ColorValue;
  primaryHover: ColorValue;
  
  // Secondary colors
  secondary: ColorValue;
  secondaryForeground: ColorValue;
  secondaryHover: ColorValue;
  
  // Backgrounds & Surfaces
  background: ColorValue;
  foreground: ColorValue;
  card: ColorValue;
  cardForeground: ColorValue;
  popover: ColorValue;
  popoverForeground: ColorValue;
  
  // UI Elements
  muted: ColorValue;
  mutedForeground: ColorValue;
  accent: ColorValue;
  accentForeground: ColorValue;
  border: ColorValue;
  input: ColorValue;
  ring: ColorValue;
  
  // Actions
  destructive: ColorValue;
  destructiveForeground: ColorValue;
  
  // Status colors
  success: ColorValue;
  successForeground: ColorValue;
  warning: ColorValue;
  warningForeground: ColorValue;
  info: ColorValue;
  infoForeground: ColorValue;
  
  // Sidebar
  sidebarBg: ColorValue;
  sidebarBackground: ColorValue;
  sidebarForeground: ColorValue;
  sidebarPrimary: ColorValue;
  sidebarPrimaryForeground: ColorValue;
  sidebarAccent: ColorValue;
  sidebarAccentForeground: ColorValue;
  sidebarBorder: ColorValue;
  sidebarRing: ColorValue;
  sidebarItemHover: ColorValue;
  sidebarSectionLabel: ColorValue;
  sidebarSeparator: ColorValue;
  
  // Gradients
  gradientPrimary: Gradient;
  gradientSecondary: Gradient;
  gradientHero: Gradient;
  
  // Shadows
  shadowSm: Shadow;
  shadowMd: Shadow;
  shadowLg: Shadow;
  shadowPrimary: Shadow;
  shadowSecondary: Shadow;
  
  // Other
  radius: string;
  transitionSmooth: string;
}


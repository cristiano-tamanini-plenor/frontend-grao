import { lightTheme } from './light';
import { darkTheme } from './dark';
import type { ThemeColors } from './types';
import { normalizeColor } from './color-utils';

export { lightTheme, darkTheme };
export { useTheme, ThemeProvider } from './useTheme';
export type { ThemeColors } from './types';
export type { ThemePreference } from './useTheme';
export { hexToHsl, normalizeColor, isHexColor } from './color-utils';

/**
 * Theme mode type
 */
export type ThemeMode = 'light' | 'dark';

/**
 * Get theme colors based on mode
 */
export function getTheme(mode: ThemeMode): ThemeColors {
  return mode === 'dark' ? darkTheme : lightTheme;
}

/**
 * Apply theme colors to CSS variables on the document root
 * This function updates all CSS custom properties based on the theme
 * Automatically converts HEX colors to HSL format
 */
export function applyTheme(mode: ThemeMode) {
  const theme = getTheme(mode);
  const root = document.documentElement;
  
  // Layout
  root.style.setProperty('--header-height', theme.headerHeight);
  root.style.setProperty('--header-bg-color', normalizeColor(theme.headerBgColor));
  root.style.setProperty('--footer-height', theme.footerHeight);
  root.style.setProperty('--footer-bg-color', normalizeColor(theme.footerBgColor));
  
  // Primary colors
  root.style.setProperty('--primary', normalizeColor(theme.primary));
  root.style.setProperty('--primary-foreground', normalizeColor(theme.primaryForeground));
  root.style.setProperty('--primary-hover', normalizeColor(theme.primaryHover));
  
  // Secondary colors
  root.style.setProperty('--secondary', normalizeColor(theme.secondary));
  root.style.setProperty('--secondary-foreground', normalizeColor(theme.secondaryForeground));
  root.style.setProperty('--secondary-hover', normalizeColor(theme.secondaryHover));
  
  // Backgrounds & Surfaces
  root.style.setProperty('--background', normalizeColor(theme.background));
  root.style.setProperty('--foreground', normalizeColor(theme.foreground));
  root.style.setProperty('--card', normalizeColor(theme.card));
  root.style.setProperty('--card-foreground', normalizeColor(theme.cardForeground));
  root.style.setProperty('--popover', normalizeColor(theme.popover));
  root.style.setProperty('--popover-foreground', normalizeColor(theme.popoverForeground));
  
  // UI Elements
  root.style.setProperty('--muted', normalizeColor(theme.muted));
  root.style.setProperty('--muted-foreground', normalizeColor(theme.mutedForeground));
  root.style.setProperty('--accent', normalizeColor(theme.accent));
  root.style.setProperty('--accent-foreground', normalizeColor(theme.accentForeground));
  root.style.setProperty('--border', normalizeColor(theme.border));
  root.style.setProperty('--input', normalizeColor(theme.input));
  root.style.setProperty('--ring', normalizeColor(theme.ring));
  
  // Actions
  root.style.setProperty('--destructive', normalizeColor(theme.destructive));
  root.style.setProperty('--destructive-foreground', normalizeColor(theme.destructiveForeground));
  
  // Status colors
  root.style.setProperty('--success', normalizeColor(theme.success));
  root.style.setProperty('--success-foreground', normalizeColor(theme.successForeground));
  root.style.setProperty('--warning', normalizeColor(theme.warning));
  root.style.setProperty('--warning-foreground', normalizeColor(theme.warningForeground));
  root.style.setProperty('--info', normalizeColor(theme.info));
  root.style.setProperty('--info-foreground', normalizeColor(theme.infoForeground));
  
  // Sidebar
  root.style.setProperty('--sidebar-bg', normalizeColor(theme.sidebarBg));
  root.style.setProperty('--sidebar-background', normalizeColor(theme.sidebarBackground));
  root.style.setProperty('--sidebar-foreground', normalizeColor(theme.sidebarForeground));
  root.style.setProperty('--sidebar-primary', normalizeColor(theme.sidebarPrimary));
  root.style.setProperty('--sidebar-primary-foreground', normalizeColor(theme.sidebarPrimaryForeground));
  root.style.setProperty('--sidebar-accent', normalizeColor(theme.sidebarAccent));
  root.style.setProperty('--sidebar-accent-foreground', normalizeColor(theme.sidebarAccentForeground));
  root.style.setProperty('--sidebar-border', normalizeColor(theme.sidebarBorder));
  root.style.setProperty('--sidebar-ring', normalizeColor(theme.sidebarRing));
  root.style.setProperty('--sidebar-item-hover', normalizeColor(theme.sidebarItemHover));
  root.style.setProperty('--sidebar-section-label', normalizeColor(theme.sidebarSectionLabel));
  root.style.setProperty('--sidebar-separator', normalizeColor(theme.sidebarSeparator));
  
  // Gradients
  root.style.setProperty('--gradient-primary', theme.gradientPrimary);
  root.style.setProperty('--gradient-secondary', theme.gradientSecondary);
  root.style.setProperty('--gradient-hero', theme.gradientHero);
  
  // Shadows
  root.style.setProperty('--shadow-sm', theme.shadowSm);
  root.style.setProperty('--shadow-md', theme.shadowMd);
  root.style.setProperty('--shadow-lg', theme.shadowLg);
  root.style.setProperty('--shadow-primary', theme.shadowPrimary);
  root.style.setProperty('--shadow-secondary', theme.shadowSecondary);
  
  // Other
  root.style.setProperty('--radius', theme.radius);
  root.style.setProperty('--transition-smooth', theme.transitionSmooth);
  
  // Toggle dark class for Tailwind
  if (mode === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

/**
 * Hook-like function to get current theme mode based on document class
 */
export function getCurrentThemeMode(): ThemeMode {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

/**
 * Apply theme colors to CSS variables on a specific element
 * Similar to applyTheme but for a specific container element
 */
export function applyThemeToElement(element: HTMLElement, mode: ThemeMode) {
  const theme = getTheme(mode);
  
  // Layout
  element.style.setProperty('--header-height', theme.headerHeight);
  element.style.setProperty('--header-bg-color', normalizeColor(theme.headerBgColor));
  element.style.setProperty('--footer-height', theme.footerHeight);
  element.style.setProperty('--footer-bg-color', normalizeColor(theme.footerBgColor));
  
  // Primary colors
  element.style.setProperty('--primary', normalizeColor(theme.primary));
  element.style.setProperty('--primary-foreground', normalizeColor(theme.primaryForeground));
  element.style.setProperty('--primary-hover', normalizeColor(theme.primaryHover));
  
  // Secondary colors
  element.style.setProperty('--secondary', normalizeColor(theme.secondary));
  element.style.setProperty('--secondary-foreground', normalizeColor(theme.secondaryForeground));
  element.style.setProperty('--secondary-hover', normalizeColor(theme.secondaryHover));
  
  // Backgrounds & Surfaces
  element.style.setProperty('--background', normalizeColor(theme.background));
  element.style.setProperty('--foreground', normalizeColor(theme.foreground));
  element.style.setProperty('--card', normalizeColor(theme.card));
  element.style.setProperty('--card-foreground', normalizeColor(theme.cardForeground));
  element.style.setProperty('--popover', normalizeColor(theme.popover));
  element.style.setProperty('--popover-foreground', normalizeColor(theme.popoverForeground));
  
  // UI Elements
  element.style.setProperty('--muted', normalizeColor(theme.muted));
  element.style.setProperty('--muted-foreground', normalizeColor(theme.mutedForeground));
  element.style.setProperty('--accent', normalizeColor(theme.accent));
  element.style.setProperty('--accent-foreground', normalizeColor(theme.accentForeground));
  element.style.setProperty('--border', normalizeColor(theme.border));
  element.style.setProperty('--input', normalizeColor(theme.input));
  element.style.setProperty('--ring', normalizeColor(theme.ring));
  
  // Actions
  element.style.setProperty('--destructive', normalizeColor(theme.destructive));
  element.style.setProperty('--destructive-foreground', normalizeColor(theme.destructiveForeground));
  
  // Status colors
  element.style.setProperty('--success', normalizeColor(theme.success));
  element.style.setProperty('--success-foreground', normalizeColor(theme.successForeground));
  element.style.setProperty('--warning', normalizeColor(theme.warning));
  element.style.setProperty('--warning-foreground', normalizeColor(theme.warningForeground));
  element.style.setProperty('--info', normalizeColor(theme.info));
  element.style.setProperty('--info-foreground', normalizeColor(theme.infoForeground));
  
  // Sidebar
  element.style.setProperty('--sidebar-bg', normalizeColor(theme.sidebarBg));
  element.style.setProperty('--sidebar-background', normalizeColor(theme.sidebarBackground));
  element.style.setProperty('--sidebar-foreground', normalizeColor(theme.sidebarForeground));
  element.style.setProperty('--sidebar-primary', normalizeColor(theme.sidebarPrimary));
  element.style.setProperty('--sidebar-primary-foreground', normalizeColor(theme.sidebarPrimaryForeground));
  element.style.setProperty('--sidebar-accent', normalizeColor(theme.sidebarAccent));
  element.style.setProperty('--sidebar-accent-foreground', normalizeColor(theme.sidebarAccentForeground));
  element.style.setProperty('--sidebar-border', normalizeColor(theme.sidebarBorder));
  element.style.setProperty('--sidebar-ring', normalizeColor(theme.sidebarRing));
  element.style.setProperty('--sidebar-item-hover', normalizeColor(theme.sidebarItemHover));
  element.style.setProperty('--sidebar-section-label', normalizeColor(theme.sidebarSectionLabel));
  element.style.setProperty('--sidebar-separator', normalizeColor(theme.sidebarSeparator));
  
  // Gradients
  element.style.setProperty('--gradient-primary', theme.gradientPrimary);
  element.style.setProperty('--gradient-secondary', theme.gradientSecondary);
  element.style.setProperty('--gradient-hero', theme.gradientHero);
  
  // Shadows
  element.style.setProperty('--shadow-sm', theme.shadowSm);
  element.style.setProperty('--shadow-md', theme.shadowMd);
  element.style.setProperty('--shadow-lg', theme.shadowLg);
  element.style.setProperty('--shadow-primary', theme.shadowPrimary);
  element.style.setProperty('--shadow-secondary', theme.shadowSecondary);
  
  // Other
  element.style.setProperty('--radius', theme.radius);
  element.style.setProperty('--transition-smooth', theme.transitionSmooth);
  
  // Toggle dark class for Tailwind
  if (mode === 'dark') {
    element.classList.add('dark');
  } else {
    element.classList.remove('dark');
  }
}


import type { ThemeColors } from './types';

/**
 * Light theme color palette
 * 
 * Colors can be defined in two formats:
 * - HSL format: "H S% L%" - Example: '209 29% 32%'
 * - HEX format: "#RRGGBB" or "RRGGBB" - Example: '#1F212A' or '1F212A'
 * 
 * The system automatically converts HEX colors to HSL when applying the theme.
 * Mix and match formats as needed for your convenience!
 */
export const lightTheme: ThemeColors = {
  // Layout
  // Light Header
  headerHeight: '64px',
  headerBgColor: '#F0F0F0',

  // Light Footer
  footerHeight: '50',
  footerBgColor: '#F0F0F0',

  // Primary: #00C092 (166, 100%, 38%)
  primary: '#00C092',
  primaryForeground: '0 0% 100%',
  primaryHover: '166 100% 32%',
  
  // Secondary: #5BC0BE (178, 47%, 55%) - Turquesa vibrante
  secondary: '178 47% 55%',
  secondaryForeground: '209 29% 20%',
  secondaryHover: '178 47% 48%',
  
  // Backgrounds & Surfaces
  background: '0 0% 100%',
  foreground: '209 20% 15%',
  card: '0 0% 100%',
  cardForeground: '209 20% 15%',
  popover: '0 0% 100%',
  popoverForeground: '209 20% 15%',
  
  // UI Elements
  muted: '210 20% 96%',
  mutedForeground: '209 15% 45%',
  accent: '178 47% 95%',
  accentForeground: '#00C092',
  border: '210 20% 88%',
  input: '210 20% 88%',
  ring: '#00C092',
  
  // Actions
  destructive: '0 72% 51%',
  destructiveForeground: '0 0% 100%',
  
  // Status colors
  success: '142 71% 45%',
  successForeground: '0 0% 100%',
  warning: '38 92% 50%',
  warningForeground: '0 0% 100%',
  info: '199 89% 48%',
  infoForeground: '0 0% 100%',
  
  // Sidebar - Light Mode
  sidebarBg: '#f6f6f9',
  sidebarBackground: '#f6f6f9',
  sidebarForeground: '220 13% 46%',
  sidebarPrimary: '#00C092',
  sidebarPrimaryForeground: '0 0% 100%',
  sidebarAccent: '220 14% 95%',
  sidebarAccentForeground: '220 13% 46%',
  sidebarBorder: '220 13% 90%',
  sidebarRing: '#00C092',
  sidebarItemHover: '#00C092',
  sidebarSectionLabel: '220 9% 46%',
  sidebarSeparator: '220 13% 88%',
  
  // Gradients
  gradientPrimary: 'linear-gradient(135deg, hsl(166 100% 38%) 0%, hsl(166 100% 48%) 100%)',
  gradientSecondary: 'linear-gradient(135deg, hsl(178 47% 55%) 0%, hsl(178 47% 65%) 100%)',
  gradientHero: 'linear-gradient(135deg, hsl(166 100% 38%) 0%, hsl(178 47% 55%) 100%)',
  
  // Shadows
  shadowSm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  shadowMd: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
  shadowLg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
  shadowPrimary: '0 10px 30px -10px hsl(166 100% 38% / 0.3)',
  shadowSecondary: '0 10px 30px -10px hsl(178 47% 55% / 0.3)',
  
  // Other
  radius: '0.5rem',
  transitionSmooth: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
};


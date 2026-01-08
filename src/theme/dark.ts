import type { ThemeColors } from './types';

/**
 * Dark theme color palette
 * 
 * Colors can be defined in two formats:
 * - HSL format: "H S% L%" - Example: '209 29% 32%'
 * - HEX format: "#RRGGBB" or "RRGGBB" - Example: '#1F212A' or '1F212A'
 * 
 * The system automatically converts HEX colors to HSL when applying the theme.
 * Mix and match formats as needed for your convenience!
 */
export const darkTheme: ThemeColors = {
  // Layout
  // Dark Header
  headerHeight: '64px',
  headerBgColor: '#0D0E12',

  // Dark Footer
  footerHeight: '64px',
  footerBgColor: '#0D0E12',
  
  // Primary remains strong in dark mode
  primary: '178 47% 55%',
  primaryForeground: '209 29% 10%',
  primaryHover: '178 47% 48%',
  
  // Secondary adjusts for dark
  secondary: '209 29% 42%',
  secondaryForeground: '0 0% 100%',
  secondaryHover: '209 29% 38%',
  
  // Dark backgrounds - using HEX format for easier configuration
  background: '#1F212A', // Dark background
  foreground: '#F2F2F2', // Light text (equivalent to '0 0% 95%')
  card: '#1A1D23', // Card background
  cardForeground: '#F2F2F2',
  popover: '#1A1D23',
  popoverForeground: '#F2F2F2',
  
  // Dark UI Elements - mix of HSL and HEX
  muted: '#222530',
  mutedForeground: '210 10% 65%',
  accent: '#222530',
  accentForeground: '0 0% 95%',
  border: '#292D39',
  input: '#292D39',
  ring: '178 47% 55%',
  
  // Actions
  destructive: '0 62% 45%',
  destructiveForeground: '0 0% 100%',
  
  // Dark status colors
  success: '142 71% 40%',
  successForeground: '0 0% 100%',
  warning: '38 92% 45%',
  warningForeground: '0 0% 100%',
  info: '199 89% 43%',
  infoForeground: '0 0% 100%',
  
  // Dark Sidebar
  sidebarBg: '#1A1D23',
  sidebarBackground: '#1A1D23',
  sidebarForeground: '220 13% 69%',
  sidebarPrimary: '178 47% 55%',
  sidebarPrimaryForeground: '215 28% 17%',
  sidebarAccent: '215 28% 21%',
  sidebarAccentForeground: '220 13% 69%',
  sidebarBorder: '215 28% 21%',
  sidebarRing: '178 47% 55%',
  sidebarItemHover: '178 47% 55%',
  sidebarSectionLabel: '220 9% 56%',
  sidebarSeparator: '0 0% 100%',
  
  // Dark gradients
  gradientPrimary: 'linear-gradient(135deg, hsl(178 47% 55%) 0%, hsl(178 47% 45%) 100%)',
  gradientSecondary: 'linear-gradient(135deg, hsl(209 29% 42%) 0%, hsl(209 29% 32%) 100%)',
  gradientHero: 'linear-gradient(135deg, hsl(178 47% 55%) 0%, hsl(209 29% 32%) 100%)',
  
  // Dark shadows with glow
  shadowSm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  shadowMd: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
  shadowLg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
  shadowPrimary: '0 10px 30px -10px hsl(178 47% 55% / 0.4)',
  shadowSecondary: '0 10px 30px -10px hsl(209 29% 42% / 0.3)',
  
  // Other
  radius: '0.5rem',
  transitionSmooth: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
};


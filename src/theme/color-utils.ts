/**
 * Color utility functions for theme system
 * Converts between HEX and HSL formats
 */

/**
 * Checks if a color value is in hexadecimal format
 */
export function isHexColor(color: string): boolean {
  return /^#?[0-9A-Fa-f]{6}$/.test(color.trim());
}

/**
 * Converts a hexadecimal color to HSL format
 * @param hex - Hexadecimal color (with or without #)
 * @returns HSL color in format "H S% L%" (without hsl() wrapper)
 * 
 * @example
 * hexToHsl('#1F212A') // returns "221 23% 15%"
 * hexToHsl('1F212A') // returns "221 23% 15%"
 */
export function hexToHsl(hex: string): string {
  // Remove # if present
  hex = hex.replace(/^#/, '');
  
  // Parse hex values
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  
  // Find min and max values
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;
  
  // Calculate lightness
  let l = (max + min) / 2;
  
  // Calculate saturation
  let s = 0;
  if (diff !== 0) {
    s = l > 0.5 ? diff / (2 - max - min) : diff / (max + min);
  }
  
  // Calculate hue
  let h = 0;
  if (diff !== 0) {
    switch (max) {
      case r:
        h = ((g - b) / diff + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / diff + 2) / 6;
        break;
      case b:
        h = ((r - g) / diff + 4) / 6;
        break;
    }
  }
  
  // Convert to degrees and percentages
  h = Math.round(h * 360);
  s = Math.round(s * 100);
  l = Math.round(l * 100);
  
  return `${h} ${s}% ${l}%`;
}

/**
 * Converts a color value (HEX or HSL) to HSL format
 * If already in HSL format, returns as is
 * If in HEX format, converts to HSL
 * 
 * @param color - Color in HEX or HSL format
 * @returns HSL color in format "H S% L%"
 * 
 * @example
 * normalizeColor('#1F212A') // returns "221 23% 15%"
 * normalizeColor('209 29% 32%') // returns "209 29% 32%"
 */
export function normalizeColor(color: string): string {
  if (isHexColor(color)) {
    return hexToHsl(color);
  }
  return color;
}

/**
 * Converts HSL format to CSS hsl() function
 * @param hsl - HSL in format "H S% L%"
 * @returns CSS hsl() function string
 * 
 * @example
 * hslToCss('209 29% 32%') // returns "hsl(209, 29%, 32%)"
 */
export function hslToCss(hsl: string): string {
  return `hsl(${hsl.replace(/ /g, ', ')})`;
}


import type { Theme, ThemeColors } from '@/services/theme.api';

/**
 * Default theme values that mirror globals.css tokens.
 * Used as a fallback before the DB theme is loaded.
 */
export const DEFAULT_THEME: Omit<Theme, 'source' | 'themeVersion'> = {
  mode: 'light',
  colors: {
    background: '#f8fafc',
    surface: '#ffffff',
    primary: '#006970',
    secondary: '#00b4bb',
  },
  branding: {
    logo: '',
    favicon: '',
  },
};

/**
 * The single source of truth for injecting theme into CSS variables.
 *
 * Maps semantic theme tokens → CSS custom properties defined in globals.css.
 * Never set colors directly on components — always go through this function.
 *
 * Usage:
 *   applyTheme(theme) // called by ThemeProvider once on load, and on every update
 */
export function applyTheme(theme: Partial<Theme>): void {
  const root = document.documentElement;
  const colors: Partial<ThemeColors> = theme.colors || {};

  // --- Brand layer (identity) ---
  if (colors.primary) {
    root.style.setProperty('--brand-primary', colors.primary);
    // Derive hover/active shades by darkening (approximation; V2 can use a color library)
    root.style.setProperty('--brand-primary-hover', darkenHex(colors.primary, 0.08));
    root.style.setProperty('--brand-primary-active', darkenHex(colors.primary, 0.16));
  }
  if (colors.secondary) {
    root.style.setProperty('--brand-secondary', colors.secondary);
    root.style.setProperty('--brand-accent', lightenHex(colors.secondary, 0.15));
  }

  // --- Surface layer ---
  if (colors.background) root.style.setProperty('--color-background', colors.background);
  if (colors.surface)    root.style.setProperty('--color-surface', colors.surface);

  // --- Sidebar active inherits brand primary automatically via var(--brand-primary) ---
  // No extra work needed here.
}

/**
 * Removes all inline theme overrides from the root element.
 * Useful for resetting to the global defaults from globals.css.
 */
export function resetTheme(): void {
  const root = document.documentElement;
  const propsToReset = [
    '--brand-primary',
    '--brand-primary-hover',
    '--brand-primary-active',
    '--brand-secondary',
    '--brand-accent',
    '--color-background',
    '--color-surface',
  ];
  propsToReset.forEach((prop) => root.style.removeProperty(prop));
}

// ===========================
// COLOR HELPERS (internal)
// ===========================

/**
 * Very lightweight hex darkening — no library dependency.
 * Multiplies each RGB channel by (1 - amount).
 */
function darkenHex(hex: string, amount: number): string {
  const { r, g, b } = hexToRgb(hex);
  const d = (v: number) => Math.max(0, Math.round(v * (1 - amount)));
  return rgbToHex(d(r), d(g), d(b));
}

function lightenHex(hex: string, amount: number): string {
  const { r, g, b } = hexToRgb(hex);
  const l = (v: number) => Math.min(255, Math.round(v + (255 - v) * amount));
  return rgbToHex(l(r), l(g), l(b));
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const cleaned = hex.replace('#', '');
  const full = cleaned.length === 3
    ? cleaned.split('').map((c) => c + c).join('')
    : cleaned;
  return {
    r: parseInt(full.substring(0, 2), 16),
    g: parseInt(full.substring(2, 4), 16),
    b: parseInt(full.substring(4, 6), 16),
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

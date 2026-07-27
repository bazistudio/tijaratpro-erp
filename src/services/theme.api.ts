import axiosInstance from '@/lib/api/axios';

// ===========================
// TYPES
// ===========================

export interface ThemeColors {
  background: string;
  surface: string;
  primary: string;
  secondary: string;
}

export interface ThemeBranding {
  logo: string;
  favicon: string;
}

export interface Theme {
  mode: 'light' | 'dark' | 'system';
  colors: ThemeColors;
  branding: ThemeBranding;
  source: 'organization' | 'branch';
  themeVersion: number;
}

export interface ThemeUpdatePayload {
  mode?: Theme['mode'];
  colors?: Partial<ThemeColors>;
}

// ===========================
// API CALLS
// ===========================

export const themeApi = {
  /**
   * Fetches the resolved theme for the current user.
   * Backend handles Single Shop vs. Organization inheritance transparently.
   */
  getCurrentTheme: async (): Promise<Theme> => {
    const res = await axiosInstance.get<{ success: boolean; data: Theme }>('/api/v1/theme/current');
    return res.data.data;
  },

  /**
   * Updates the theme for the current organization.
   * Only sends the fields that changed.
   */
  updateTheme: async (payload: ThemeUpdatePayload): Promise<Theme> => {
    const res = await axiosInstance.patch<{ success: boolean; data: Theme }>('/api/v1/theme', payload);
    return res.data.data;
  },
};

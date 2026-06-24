import { create } from 'zustand';
import { useAuthStore } from './core/auth.store';

interface PermissionsState {
  matrix: Record<string, boolean>;
  setMatrix: (matrix: Record<string, boolean>) => void;
}

export const usePermissionsStore = create<PermissionsState>((set) => ({
  matrix: {},
  setMatrix: (matrix) => set({ matrix })
}));

export const usePermissions = () => {
  const matrix = usePermissionsStore(state => state.matrix);
  const user = useAuthStore(state => state.user);
  
  const role = user?.role || null;

  const hasPermission = (permission: string) => {
    if (!role) return true; // Fallback during hydration so we don't break UI
    
    // Global Admins bypass checks
    if (role === 'SUPER_ADMIN' || role === 'MULTI_ADMIN') return true;
    
    // SHOP_ADMIN typically has all access to their shop
    if (role === 'SHOP_ADMIN') return true;

    // Evaluate against the loaded matrix
    // If matrix is entirely empty, assume we haven't loaded it yet, fallback true for now
    if (Object.keys(matrix).length === 0) return true;
    
    return matrix[permission] === true;
  };

  return { hasPermission, role };
};

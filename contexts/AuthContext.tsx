'use client';
import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';

interface AuthUser {
  id: string;
  email: string;
  role: string;
}

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error?: string;
}

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_AUTH_DATA'; payload: { user: AuthUser } }
  | { type: 'CLEAR_AUTH' }
  | { type: 'SET_ERROR'; payload: string };

const initialState: AuthState = {
  user: null,
  isLoading: true,
  isAuthenticated: false,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_AUTH_DATA':
      return {
        ...state,
        user: action.payload.user,
        isLoading: false,
        isAuthenticated: true,
      };
    case 'CLEAR_AUTH':
      return {
        ...state,
        user: null,
        isLoading: false,
        isAuthenticated: false,
      };
    case 'SET_ERROR':
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };
    default:
      return state;
  }
}

interface AuthContextType {
  state: AuthState;
  dispatch: React.Dispatch<AuthAction>;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Don't check auth on public pages
    const publicPages = ['/admin-login', '/login'];
    if (publicPages.includes(pathname)) {
      dispatch({ type: 'SET_LOADING', payload: false });
      return;
    }
    
    checkAuth();
  }, [pathname]);

  const checkAuth = async () => {
    try {
      console.log('Checking admin authentication...');
      const result = await authApi.verify();
      
      if (result.success && result.data) {
        const userData = result.data.user;
        console.log('Admin user data received:', userData);
        
        dispatch({
          type: 'SET_AUTH_DATA',
          payload: {
            user: {
              id: userData.id,
              email: userData.email,
              role: userData.role,
            }
          }
        });
      } else {
        console.log('Admin auth check failed - clearing auth');
        dispatch({ type: 'CLEAR_AUTH' });
      }
    } catch (error) {
      console.error('Admin auth check failed:', error);
      dispatch({ type: 'CLEAR_AUTH' });
    }
  };

  const refreshAuth = async (): Promise<boolean> => {
    try {
      // Try to refresh the token
      const result = await authApi.refresh();

      if (result.success) {
        // If refresh succeeds, re-check auth
        await checkAuth();
        return true;
      } else {
        // If refresh fails, clear auth and redirect to login
        dispatch({ type: 'CLEAR_AUTH' });
        if (!pathname.startsWith('/admin-login')) {
          router.push('/admin-login');
        }
        return false;
      }
    } catch (error) {
      console.error('Admin token refresh failed:', error);
      dispatch({ type: 'CLEAR_AUTH' });
      if (!pathname.startsWith('/admin-login')) {
        router.push('/admin-login');
      }
      return false;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      console.log('Attempting login with:', { email });
      dispatch({ type: 'SET_LOADING', payload: true });
      const result = await authApi.login(email, password);

      console.log('Login response data:', result);

      if (result.success && result.data) {
        const userData = result.data.user;
        dispatch({
          type: 'SET_AUTH_DATA',
          payload: {
            user: {
              id: userData.id,
              email: userData.email,
              role: userData.role,
            }
          }
        });

        // ADMIN users are redirected to stores, SUPERADMIN stays on dashboard
        if (userData.role === 'ADMIN' && typeof window !== 'undefined') {
          window.location.href = '/admin-dashboard/stores';
        }

        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error: any) {
      console.error('Admin login failed:', error);
      const errorMessage = error.message || 'Login failed';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return { success: false, error: errorMessage };
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
      dispatch({ type: 'CLEAR_AUTH' });
      window.location.href = '/admin-login';
    } catch (error) {
      console.error('Admin logout failed:', error);
      // Still clear auth state even if API call fails
      dispatch({ type: 'CLEAR_AUTH' });
      window.location.href = '/admin-login';
    }
  };

  return (
    <AuthContext.Provider value={{ state, dispatch, login, logout, refreshAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

import { useState, useEffect } from 'react';
import { api, type ApiResponse } from '../controller/api-controller.js';

interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'admin';
  name?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: localStorage.getItem('authToken'),
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token && token !== 'null' && token !== 'undefined') {
      validateToken(token);
    } else {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const validateToken = async (token: string) => {
    if (!token || token === 'undefined' || token === 'null') {
      logout();
      return;
    }

    try {
      const response = await api('validateToken', { token });
      const useCaseResponse = response.data;
      
      if (response.success && useCaseResponse?.success && useCaseResponse.user) {
        setState({
          user: useCaseResponse.user,
          token,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        logout();
      }
    } catch (error) {
      logout();
    }
  };

  const login = async (payload: LoginPayload): Promise<ApiResponse> => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const response = await api('loginUser', payload as unknown as Record<string, unknown>);
      const useCaseResponse = response.data;
      
      if (response.success && useCaseResponse?.success && useCaseResponse.user && useCaseResponse.token) {
        const { user, token } = useCaseResponse;
        localStorage.setItem('authToken', token);
        setState({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
      
      return response.success && response.data ? response.data : response;
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Login failed',
      };
    }
  };

  const register = async (payload: RegisterPayload): Promise<ApiResponse> => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const response = await api('registerUser', payload as unknown as Record<string, unknown>);
      setState(prev => ({ ...prev, isLoading: false }));
      
      return response.success && response.data ? response.data : response;
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Registration failed',
      };
    }
  };

  const logout = () => {
    localStorage.clear();
    setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
    window.location.reload();
  };

  return {
    ...state,
    login,
    register,
    logout,
  };
};
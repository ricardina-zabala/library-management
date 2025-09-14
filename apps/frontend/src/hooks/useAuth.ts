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
  name: string;
  role: 'user' | 'admin';
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
    if (token) {
      validateToken(token);
    } else {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const validateToken = async (token: string) => {
    try {
      const response = await api('validateToken', { token });
      if (response.success && response.data) {
        setState({
          user: response.data.user,
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
      
      if (response.success && response.data) {
        const { user, token } = response.data;
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
      
      return response;
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
      return response;
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Registration failed',
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  return {
    ...state,
    login,
    register,
    logout,
  };
};
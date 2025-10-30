import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ApiUser } from '../api/client';
import { AuthAPI } from '../api/client';
import type { ResetPasswordRequest } from '../api/auth';

interface AuthContextType {
  user: ApiUser | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, password_confirmation: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (currentPassword: string, newPassword: string, confirmPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      try {
        // Check if we have a stored token
        const token = localStorage.getItem('auth_token');
        if (!token) {
          setUser(null);
          setLoading(false);
          return;
        }
        
        console.log('Found stored token, verifying with server...');
        const { user } = await AuthAPI.getUser();
        console.log('Token is valid, user:', user);
        setUser(user);
      } catch (err) {
        console.log('Token validation failed:', err);
        // If token validation fails, clear it
        localStorage.removeItem('auth_token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      console.log('AuthContext: Attempting login...');
      const { user } = await AuthAPI.login(email, password);
      console.log('AuthContext: Login successful, user:', user);
      setUser(user);
    } catch (err: any) {
      console.error('AuthContext: Login error:', err);
      // Handle Laravel validation errors
      if (err.response?.data?.errors) {
        const errorMessages = Object.values(err.response.data.errors)
          .flat()
          .map((msg: any) => String(msg))
          .join('\n');
        setError(errorMessages);
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError(err instanceof Error ? err.message : 'Failed to login');
      }
      throw err;
    }
  };

  const register = async (name: string, email: string, password: string, password_confirmation: string) => {
    try {
      setError(null);
      const { user } = await AuthAPI.register(name, email, password, password_confirmation);
      setUser(user);
    } catch (err: any) {
      console.error('Registration error:', err);
      // Handle Laravel validation errors
      if (err.response?.data?.errors) {
        const errorMessages = Object.values(err.response.data.errors)
          .flat()
          .map((msg: any) => String(msg))
          .join('\n');
        setError(errorMessages);
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError(err instanceof Error ? err.message : 'Failed to register');
      }
      throw err;
    }
  };

  const logout = async () => {
    try {
      await AuthAPI.logout(); // This will clear localStorage token
      setUser(null);
    } catch (err) {
      // Even if logout fails, clear the local state and token
      localStorage.removeItem('auth_token');
      setUser(null);
      setError(err instanceof Error ? err.message : 'Failed to logout');
      throw err;
    }
  };

  const resetPassword = async (currentPassword: string, newPassword: string, confirmPassword: string) => {
    try {
      setError(null);
      const data: ResetPasswordRequest = {
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: confirmPassword,
      };
      await AuthAPI.resetPassword(data);
    } catch (err: any) {
      console.error('Password reset error:', err);
      // Handle Laravel validation errors
      if (err.response?.data?.errors) {
        const errorMessages = Object.values(err.response.data.errors)
          .flat()
          .map((msg: any) => String(msg))
          .join('\n');
        setError(errorMessages);
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError(err instanceof Error ? err.message : 'Failed to reset password');
      }
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout, register, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
}
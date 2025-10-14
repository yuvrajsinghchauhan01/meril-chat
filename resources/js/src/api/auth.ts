import { apiFetch } from './client';
import type { ApiResponse } from './client';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface ResetPasswordRequest {
  current_password: string;
  password: string;
  password_confirmation: string;
}

// Add csrf token interface
export interface CsrfResponse {
  csrf_token: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export const AuthAPI = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const res = await apiFetch<ApiResponse<AuthResponse>>('/api/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    return res.data;
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    // First, get CSRF token
    await apiFetch('/sanctum/csrf-cookie', {
      method: 'GET',
      credentials: 'include'
    });

    const res = await apiFetch<ApiResponse<AuthResponse>>('/api/register', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return res.data;
  },

  async logout(): Promise<void> {
    await apiFetch('/api/logout', { method: 'POST' });
  },

  async getUser(): Promise<User> {
    const res = await apiFetch<ApiResponse<User>>('/api/user');
    return res.data;
  },

  async refresh(): Promise<{ token: string }> {
    const res = await apiFetch<ApiResponse<{ token: string }>>('/api/refresh', {
      method: 'POST',
    });
    return res.data;
  },

  async resetPassword(data: ResetPasswordRequest): Promise<{ message: string }> {
    const res = await apiFetch<ApiResponse<{ message: string }>>('/api/reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.data;
  },
};

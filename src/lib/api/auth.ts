import { apiClient } from './client';
import { AuthResponse, LoginCredentials, User } from '@/types';

export const authApi = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/auth/login', credentials);
  },

  async getProfile(): Promise<User> {
    return apiClient.get<User>('/auth/profile');
  },

  async logout(): Promise<void> {
    return apiClient.post('/auth/logout');
  },
};

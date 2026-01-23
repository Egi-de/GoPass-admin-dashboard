import { apiClient } from './client';
import { User } from '@/types';

export const usersApi = {
  async getAll(): Promise<User[]> {
    return apiClient.get<User[]>('/users');
  },

  async getById(id: string): Promise<User> {
    return apiClient.get<User>(`/users/${id}`);
  },

  async create(data: Partial<User>): Promise<User> {
    return apiClient.post<User>('/users', data);
  },

  async update(id: string, data: Partial<User>): Promise<User> {
    return apiClient.put<User>(`/users/${id}`, data);
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete(`/users/${id}`);
  },

  async updateRole(id: string, role: string): Promise<User> {
    return apiClient.patch<User>(`/users/${id}/role`, { role });
  },
};

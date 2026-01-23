import { apiClient } from './client';
import { Pass } from '@/types';

export const passesApi = {
  async getAll(): Promise<Pass[]> {
    return apiClient.get<Pass[]>('/passes');
  },

  async getById(id: string): Promise<Pass> {
    return apiClient.get<Pass>(`/passes/${id}`);
  },

  async updateStatus(id: string, status: string): Promise<Pass> {
    return apiClient.patch<Pass>(`/passes/${id}/status`, { status });
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete(`/passes/${id}`);
  },
};

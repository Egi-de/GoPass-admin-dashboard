import { apiClient } from './client';
import { Bus } from '@/types';

export const busesApi = {
  async getAll(): Promise<Bus[]> {
    return apiClient.get<Bus[]>('/buses');
  },

  async getById(id: string): Promise<Bus> {
    return apiClient.get<Bus>(`/buses/${id}`);
  },

  async create(data: Partial<Bus>): Promise<Bus> {
    return apiClient.post<Bus>('/buses', data);
  },

  async update(id: string, data: Partial<Bus>): Promise<Bus> {
    return apiClient.put<Bus>(`/buses/${id}`, data);
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete(`/buses/${id}`);
  },

  async assignDriver(busId: string, driverId: string): Promise<Bus> {
    return apiClient.post<Bus>(`/buses/${busId}/assign-driver`, { driverId });
  },

  async updateStatus(id: string, status: string): Promise<Bus> {
    return apiClient.patch<Bus>(`/buses/${id}/status`, { status });
  },
};

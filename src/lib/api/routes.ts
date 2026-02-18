import { apiClient } from './client';
import { Route } from '@/types';

export const routesApi = {
  async getAll(): Promise<Route[]> {
    return apiClient.get<Route[]>('/routes');
  },

  async getById(id: string): Promise<Route> {
    return apiClient.get<Route>(`/routes/${id}`);
  },

  async create(data: Partial<Route>): Promise<Route> {
    return apiClient.post<Route>('/routes', data);
  },

  async update(id: string, data: Partial<Route>): Promise<Route> {
    return apiClient.put<Route>(`/routes/${id}`, data);
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete(`/routes/${id}`);
  },
};

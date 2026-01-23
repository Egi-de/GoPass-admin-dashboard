import { apiClient } from './client';
import { Booking } from '@/types';

export const bookingsApi = {
  async getAll(): Promise<Booking[]> {
    return apiClient.get<Booking[]>('/bookings');
  },

  async getById(id: string): Promise<Booking> {
    return apiClient.get<Booking>(`/bookings/${id}`);
  },

  async create(data: Partial<Booking>): Promise<Booking> {
    return apiClient.post<Booking>('/bookings', data);
  },

  async updateStatus(id: string, status: string): Promise<Booking> {
    return apiClient.patch<Booking>(`/bookings/${id}/status`, { status });
  },

  async cancel(id: string): Promise<Booking> {
    return apiClient.post<Booking>(`/bookings/${id}/cancel`);
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete(`/bookings/${id}`);
  },
};

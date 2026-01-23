import { apiClient } from './client';
import { DashboardStats } from '@/types/stats';

export const statsApi = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await apiClient.get<DashboardStats>('/stats');
    return response as DashboardStats;
  },
};

export interface DashboardStats {
  totalUsers: number;
  activeBuses: number;
  totalBookings: number;
  activePasses: number;
  totalRevenue: number;
  recentBookings: Array<{
    id: string;
    status: string;
    totalAmount: number;
    travelDate: string;
    user?: { name: string; email: string };
    route?: { name: string; origin: string; destination: string };
  }>;
}

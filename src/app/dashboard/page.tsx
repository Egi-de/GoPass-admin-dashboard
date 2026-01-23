'use client';

import { useEffect, useState } from 'react';
import { statsApi } from '@/lib/api/stats';
import { DashboardStats } from '@/types/stats';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Bus, Bookmark, Ticket } from 'lucide-react';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await statsApi.getStats();
        setStats(data);
      } catch (error) {
        console.error('Failed to load dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Overview of your transport system
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Users"
          value={stats?.totalUsers}
          loading={loading}
          icon={<Users className="w-4 h-4 text-purple-600" />}
        />
        <StatsCard
          title="Active Buses"
          value={stats?.activeBuses}
          loading={loading}
          icon={<Bus className="w-4 h-4 text-blue-600" />}
        />
        <StatsCard
          title="Total Bookings"
          value={stats?.totalBookings}
          loading={loading}
          icon={<Bookmark className="w-4 h-4 text-green-600" />}
        />
        <StatsCard
          title="Active Passes"
          value={stats?.activePasses}
          loading={loading}
          icon={<Ticket className="w-4 h-4 text-orange-600" />}
        />
      </div>
    </div>
  );
}

function StatsCard({ 
  title, 
  value, 
  loading,
  icon
}: { 
  title: string; 
  value?: number; 
  loading: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
          {icon && <div className="p-2 bg-gray-50 dark:bg-gray-900 rounded-full">{icon}</div>}
        </div>
        {loading ? (
          <Skeleton className="h-8 w-16 mt-2" />
        ) : (
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
            {value !== undefined ? value : '-'}
          </p>
        )}
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { statsApi } from '@/lib/api/stats';
import { DashboardStats } from '@/types/stats';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Users, Bus, Bookmark, Ticket, DollarSign } from 'lucide-react';
import { format } from 'date-fns';

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

    // Load immediately
    loadStats();
    
    // Refresh every 30 seconds
    const interval = setInterval(loadStats, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
      case 'CONFIRMED': return 'default';
      case 'ACTIVE': return 'default';
      case 'PENDING': return 'secondary';
      case 'CANCELLED': return 'destructive';
      case 'USED': return 'outline';
      default: return 'secondary';
    }
  };

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Overview of your transport system
        </p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
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
        <StatsCard
          title="Total Revenue"
          value={stats?.totalRevenue}
          loading={loading}
          isCurrency
          icon={<DollarSign className="w-4 h-4 text-emerald-600" />}
        />
      </div>

      {/* Recent Bookings */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Recent Bookings</h2>
        <div className="rounded-lg border bg-white dark:bg-gray-800 shadow overflow-hidden">
          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : !stats?.recentBookings?.length ? (
            <div className="p-8 text-center text-gray-500">No recent bookings</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900 border-b">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Passenger</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Route</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Travel Date</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {stats.recentBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4">
                      {booking.user ? (
                        <div>
                          <p className="font-medium">{booking.user.name}</p>
                          <p className="text-xs text-gray-500">{booking.user.email}</p>
                        </div>
                      ) : (
                        <span className="text-gray-400">Unknown</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {booking.route ? (
                        <span>{booking.route.origin} → {booking.route.destination}</span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                      {format(new Date(booking.travelDate), 'PPP')}
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {new Intl.NumberFormat('rw-RW', { style: 'currency', currency: 'RWF' }).format(booking.totalAmount)}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={getStatusVariant(booking.status)}>
                        {booking.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

function StatsCard({ 
  title, 
  value, 
  loading,
  icon,
  isCurrency = false,
}: { 
  title: string; 
  value?: number; 
  loading: boolean;
  icon?: React.ReactNode;
  isCurrency?: boolean;
}) {
  const displayValue = () => {
    if (value === undefined) return '-';
    if (isCurrency) {
      return new Intl.NumberFormat('rw-RW', { style: 'currency', currency: 'RWF', maximumFractionDigits: 0 }).format(value);
    }
    return value.toLocaleString();
  };

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
          <p className={`font-bold text-gray-900 dark:text-white mt-2 ${isCurrency ? 'text-lg' : 'text-3xl'}`}>
            {displayValue()}
          </p>
        )}
      </div>
    </div>
  );
}

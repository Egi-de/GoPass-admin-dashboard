'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { bookingsApi } from '@/lib/api/bookings';
import { Booking } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Ban, Trash2, Eye, CheckCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

const STATUS_TABS = ['ALL', 'PENDING', 'CONFIRMED', 'ACTIVE', 'USED', 'CANCELLED'] as const;
type StatusTab = typeof STATUS_TABS[number];

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<StatusTab>('ALL');
  const router = useRouter();

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const data = await bookingsApi.getAll();
      setBookings(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await bookingsApi.updateStatus(id, status);
      await loadBookings();
    } catch (error) {
      console.error('Failed to update booking status:', error);
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await bookingsApi.cancel(id);
      await loadBookings();
    } catch (error) {
      console.error('Failed to cancel booking:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this booking?')) return;
    try {
      await bookingsApi.delete(id);
      await loadBookings();
    } catch (error) {
      console.error('Failed to delete booking:', error);
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (booking.user?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (booking.user?.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (booking.route?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'ALL' || booking.status === activeTab;
    return matchesSearch && matchesTab;
  });

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
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Bookings</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage passenger reservations ({bookings.length} total)
          </p>
        </div>
      </div>

      {/* Status filter tabs */}
      <div className="mb-4 flex gap-2 flex-wrap">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              activeTab === tab
                ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="mb-4">
        <Input
          placeholder="Search by name, email, or route..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="rounded-lg border bg-white dark:bg-gray-800 shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Booking ID</TableHead>
              <TableHead>Passenger</TableHead>
              <TableHead>Route</TableHead>
              <TableHead>Travel Date</TableHead>
              <TableHead>Seats</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : filteredBookings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                  No bookings found
                </TableCell>
              </TableRow>
            ) : (
              filteredBookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell className="font-medium font-mono text-xs">{booking.id.substring(0, 8)}...</TableCell>
                  <TableCell>
                    {booking.user ? (
                      <div>
                        <p className="font-medium text-sm">{booking.user.name}</p>
                        <p className="text-xs text-gray-500">{booking.user.email}</p>
                      </div>
                    ) : (
                      <span className="font-mono text-xs text-gray-400">{booking.userId.substring(0, 8)}...</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {booking.route ? (
                      <div>
                        <p className="font-medium text-sm">{booking.route.name}</p>
                        <p className="text-xs text-gray-500">{booking.route.origin} → {booking.route.destination}</p>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">{booking.routeId}</span>
                    )}
                  </TableCell>
                  <TableCell>{format(new Date(booking.travelDate), 'PPP p')}</TableCell>
                  <TableCell>{booking.seats.join(', ')}</TableCell>
                  <TableCell>{new Intl.NumberFormat('rw-RW', { style: 'currency', currency: 'RWF' }).format(booking.totalAmount)}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(booking.status)}>
                      {booking.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => router.push(`/dashboard/bookings/${booking.id}`)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        {booking.status === 'PENDING' && (
                          <DropdownMenuItem onClick={() => handleStatusUpdate(booking.id, 'CONFIRMED')}>
                            <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                            Confirm
                          </DropdownMenuItem>
                        )}
                        {booking.status !== 'CANCELLED' && booking.status !== 'USED' && (
                          <DropdownMenuItem className="text-red-600" onClick={() => handleCancel(booking.id)}>
                            <Ban className="mr-2 h-4 w-4" />
                            Cancel
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(booking.id)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

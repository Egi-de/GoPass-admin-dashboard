'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { bookingsApi } from '@/lib/api/bookings';
import { Booking } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Printer, Calendar, MapPin, User, FileText, Ban } from 'lucide-react';
import { format } from 'date-fns';

export default function BookingDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      loadBooking(params.id as string);
    }
  }, [params.id]);

  const loadBooking = async (id: string) => {
    try {
      setLoading(true);
      const data = await bookingsApi.getById(id);
      setBooking(data);
    } catch (error) {
      console.error('Failed to load booking:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!booking || !confirm('Are you sure you want to cancel this booking?')) return;
    
    try {
      await bookingsApi.cancel(booking.id);
      loadBooking(booking.id);
    } catch (error) {
      console.error('Failed to cancel booking:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-semibold mb-4">Booking not found</h2>
        <Button onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Bookings
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              Booking Details
              <Badge variant="outline" className="font-mono text-lg">
                #{booking.id.substring(0, 8)}
              </Badge>
            </h1>
            <p className="text-gray-500 mt-1">
              Created on {format(new Date(booking.createdAt), 'PPP p')}
            </p>
          </div>
          <div className="flex gap-2">
            {booking.status !== 'CANCELLED' && booking.status !== 'USED' && (
              <Button variant="destructive" onClick={handleCancel}>
                <Ban className="mr-2 h-4 w-4" />
                Cancel Booking
              </Button>
            )}
            <Button variant="outline" onClick={() => window.print()}>
              <Printer className="mr-2 h-4 w-4" />
              Print Ticket
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Journey Details */}
        <Card className="col-span-full md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-500" />
              Journey Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Route</p>
              {booking.route ? (
                <p className="text-lg font-semibold">{booking.route.name}</p>
              ) : (
                <p className="text-lg font-semibold text-gray-400">Route ID: {booking.routeId}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Origin</p>
                <p>{booking.route?.origin || 'Unknown'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Destination</p>
                <p>{booking.route?.destination || 'Unknown'}</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Departure Time</p>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <p>{format(new Date(booking.travelDate), 'PPP p')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Passenger & Ticket Details */}
        <Card className="col-span-full md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-green-500" />
              Passenger Info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Passenger Name</p>
              <p className="text-lg font-semibold">{booking.user?.name || 'Unknown'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Contact</p>
              <p>{booking.user?.email}</p>
              <p>{booking.user?.phone}</p>
            </div>
            <div className="pt-4 border-t">
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm font-medium text-gray-500">Status</p>
                <Badge variant={booking.status === 'ACTIVE' ? 'default' : 'secondary'}>
                  {booking.status}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-sm font-medium text-gray-500">Seats</p>
                <p className="font-mono font-bold">{booking.seats.join(', ')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Summary */}
        <Card className="col-span-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-500" />
              Payment Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span>Price per seat</span>
                <span>{booking.route?.price ? new Intl.NumberFormat('rw-RW', { style: 'currency', currency: 'RWF' }).format(booking.route.price) : 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center mb-4">
                <span>Seats ({booking.seats.length})</span>
                <span>
                 x {booking.seats.length}
                </span>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 flex justify-between items-center font-bold text-lg">
                <span>Total Amount</span>
                <span className="text-green-600">
                  {new Intl.NumberFormat('rw-RW', { style: 'currency', currency: 'RWF' }).format(booking.totalAmount)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

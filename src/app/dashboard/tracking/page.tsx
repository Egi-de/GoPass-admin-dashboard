'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { db } from '@/lib/firebase';
import { ref, onValue, off } from 'firebase/database';
import { routesApi } from '@/lib/api/routes';
import { busesApi } from '@/lib/api/buses';
import { Route, Bus } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bus as BusIcon, MapPin, Navigation } from 'lucide-react';
import { format } from 'date-fns';

// Dynamic import for Leaflet map to avoid SSR issues
const TrackingMap = dynamic(() => import('./TrackingMap'), { 
  ssr: false,
  loading: () => (
    <div className="h-[600px] w-full bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg flex items-center justify-center">
      <span className="text-gray-400">Loading Map...</span>
    </div>
  ),
});

interface BusLocation {
  latitude: number;
  longitude: number;
  speed: number;
  heading: number;
  timestamp: number;
  busId: string;
}

export default function TrackingPage() {
  const [activeBuses, setActiveBuses] = useState<Bus[]>([]);
  const [locations, setLocations] = useState<Record<string, BusLocation>>({});
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();

    // Listen to Firebase Realtime Database
    const busesRef = ref(db, 'buses');
    const unsubscribe = onValue(busesRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setLocations(data);
      }
    });

    return () => {
      off(busesRef);
    };
  }, []);

  const loadData = async () => {
    try {
      const [busesData, routesData] = await Promise.all([
        busesApi.getAll(),
        routesApi.getAll(),
      ]);
      setActiveBuses(busesData.filter(bus => bus.status === 'ON_ROUTE'));
      setRoutes(routesData);
    } catch (error) {
      console.error('Failed to load tracking data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getBusRoute = (bus: Bus) => {
    return routes.find(r => r.id === bus.routeId);
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Live Tracking</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Monitor bus locations in real-time
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="px-4 py-2 text-sm">
            <BusIcon className="w-4 h-4 mr-2 text-blue-500" />
            {Object.keys(locations).length} Active Tracking
          </Badge>
          <Badge variant="outline" className="px-4 py-2 text-sm">
            <Navigation className="w-4 h-4 mr-2 text-green-500" />
            {activeBuses.length} Buses on Route
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="h-[600px] w-full">
                <TrackingMap 
                  locations={locations} 
                  buses={activeBuses}
                  routes={routes}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <h2 className="font-semibold text-lg">Active Buses</h2>
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
            {activeBuses.length === 0 ? (
              <div className="text-center py-8 text-gray-500 bg-gray-50 dark:bg-gray-800 rounded-lg">
                No buses currently on route
              </div>
            ) : (
              activeBuses.map((bus) => {
                const location = locations[bus.id];
                const route = getBusRoute(bus);
                
                return (
                  <Card key={bus.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader className="p-4 pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-base font-bold">{bus.plateNumber}</CardTitle>
                        {location ? (
                          <Badge className="bg-green-500 hover:bg-green-600">Live</Badge>
                        ) : (
                          <Badge variant="secondary">Offline</Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-2 text-sm space-y-2">
                      <div className="flex items-center text-gray-600 dark:text-gray-300">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span className="truncate">{route?.name || 'Unknown Route'}</span>
                      </div>
                      {location && (
                        <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 mt-2 pt-2 border-t">
                          <div>
                            <span className="block font-medium">Speed</span>
                            {location.speed.toFixed(1)} km/h
                          </div>
                          <div>
                            <span className="block font-medium">Last Update</span>
                            {format(new Date(location.timestamp), 'HH:mm:ss')}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

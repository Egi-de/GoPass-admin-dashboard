'use client';

import { useEffect, useState } from 'react';
import { routesApi } from '@/lib/api/routes';
import { Route } from '@/types';
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
import { MoreHorizontal, Plus, Trash2, Edit } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { RouteDialog } from '@/components/routes/RouteDialog';

export default function RoutesPage() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);

  useEffect(() => {
    loadRoutes();
  }, []);

  const loadRoutes = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const data = await routesApi.getAll();
      setRoutes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load routes:', error);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedRoute(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (route: Route) => {
    setSelectedRoute(route);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (data: Partial<Route>) => {
    if (selectedRoute) {
      await routesApi.update(selectedRoute.id, data);
      setRoutes((prev) =>
        prev.map((r) => (r.id === selectedRoute.id ? { ...r, ...data } : r))
      );
      loadRoutes(true);
    } else {
      await routesApi.create(data);
      await loadRoutes();
    }
    setIsDialogOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this route?')) return;
    try {
      await routesApi.delete(id);
      setRoutes((prev) => prev.filter((r) => r.id !== id));
    } catch (error) {
      console.error('Failed to delete route:', error);
    }
  };

  const filteredRoutes = routes.filter(
    (route) =>
      route.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      route.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (route.operator?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (route.buses || []).some((b) =>
        b.plateNumber.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  const formatTime = (iso: string) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('en-RW', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('rw-RW', { style: 'currency', currency: 'RWF' }).format(price);

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Routes</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage travel routes and pricing
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Route
        </Button>
      </div>

      <div className="mb-4">
        <Input
          placeholder="Search by origin, destination, or operator..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="rounded-lg border bg-white dark:bg-gray-800 shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Route</TableHead>
              <TableHead>Departure</TableHead>
              <TableHead>Arrival</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Seats</TableHead>
              <TableHead>Operator</TableHead>
              <TableHead>Bus Plate</TableHead>
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
            ) : filteredRoutes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                  No routes found
                </TableCell>
              </TableRow>
            ) : (
              filteredRoutes.map((route) => (
                <TableRow key={route.id}>
                  <TableCell className="font-medium">
                    <span className="text-orange-600 dark:text-orange-400">{route.origin}</span>
                    <span className="mx-1 text-gray-400">→</span>
                    <span className="text-orange-600 dark:text-orange-400">{route.destination}</span>
                  </TableCell>
                  <TableCell className="text-sm">{formatTime(route.departureTime)}</TableCell>
                  <TableCell className="text-sm">{formatTime(route.arrivalTime)}</TableCell>
                  <TableCell>{formatPrice(route.price)}</TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {route.seatsAvailable ?? route.totalSeats}/{route.totalSeats}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                    {route.operator || '—'}
                  </TableCell>
                  <TableCell>
                    {route.buses && route.buses.length > 0 ? (
                      <div className="space-y-0.5">
                        {route.buses.map((bus) => (
                          <p key={bus.id} className="text-xs font-mono font-medium text-gray-700 dark:text-gray-300">
                            {bus.plateNumber}
                          </p>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(route)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDelete(route.id)}
                        >
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

      <RouteDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        route={selectedRoute}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

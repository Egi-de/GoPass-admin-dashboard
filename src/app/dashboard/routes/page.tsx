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
import { MoreHorizontal, Plus, Trash2, Edit, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { RouteDialog } from '@/components/routes/RouteDialog';
import { Badge } from '@/components/ui/badge';

export default function RoutesPage() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);

  useEffect(() => {
    loadRoutes();
  }, []);

  const loadRoutes = async () => {
    try {
      setLoading(true);
      const data = await routesApi.getAll();
      setRoutes(data);
    } catch (error) {
      console.error('Failed to load routes:', error);
    } finally {
      setLoading(false);
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
    try {
      if (selectedRoute) {
        await routesApi.update(selectedRoute.id, data);
      } else {
        await routesApi.create(data);
      }
      loadRoutes();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Failed to save route:', error);
      throw error;
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this route?')) return;
    
    try {
      await routesApi.delete(id);
      await loadRoutes();
    } catch (error) {
      console.error('Failed to delete route:', error);
    }
  };

  const filteredRoutes = routes.filter(
    (route) =>
      (route.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (route.origin?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (route.destination?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

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
          placeholder="Search by name, origin, or destination..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="rounded-lg border bg-white dark:bg-gray-800 shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Route Name</TableHead>
              <TableHead>Origin</TableHead>
              <TableHead>Destination</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : filteredRoutes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  No routes found
                </TableCell>
              </TableRow>
            ) : (
              filteredRoutes.map((route) => (
                <TableRow key={route.id}>
                  <TableCell className="font-medium">{route.name}</TableCell>
                  <TableCell>{route.origin}</TableCell>
                  <TableCell>{route.destination}</TableCell>
                  <TableCell>{new Intl.NumberFormat('rw-RW', { style: 'currency', currency: 'RWF' }).format(route.price)}</TableCell>
                  <TableCell>{route.estimatedDuration}</TableCell>
                  <TableCell>
                    <Badge variant={route.isActive ? 'default' : 'secondary'}>
                      {route.isActive ? 'Active' : 'Inactive'}
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
                        <DropdownMenuItem onClick={() => handleEdit(route)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <MapPin className="mr-2 h-4 w-4" />
                          Stops
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(route.id)}>
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

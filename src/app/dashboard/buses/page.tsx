'use client';

import { useState, useEffect } from 'react';
import { busesApi } from '@/lib/api/buses';
import { Bus } from '@/types';
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
import { MoreHorizontal, Plus, Trash2, Edit, User, Activity } from 'lucide-react';
import { Input } from '@/components/ui/input';

import { BusDialog } from '@/components/buses/BusDialog';

export default function BusesPage() {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedBus, setSelectedBus] = useState<Bus | null>(null);

  useEffect(() => {
    loadBuses();
  }, []);

  const loadBuses = async () => {
    try {
      setLoading(true);
      const data = await busesApi.getAll();
      setBuses(data);
    } catch (error) {
      console.error('Failed to load buses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedBus(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (bus: Bus) => {
    setSelectedBus(bus);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (data: Partial<Bus>) => {
    try {
      if (selectedBus) {
        await busesApi.update(selectedBus.id, data);
      } else {
        await busesApi.create(data);
      }
      loadBuses();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Failed to save bus:', error);
      throw error;
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this bus?')) return;
    
    try {
      await busesApi.delete(id);
      await loadBuses();
    } catch (error) {
      console.error('Failed to delete bus:', error);
    }
  };

  const filteredBuses = buses.filter(
    (bus) =>
      bus.plateNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ON_ROUTE':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'IDLE':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      case 'MAINTENANCE':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'DELAYED':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Buses</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage your fleet and drivers
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Bus
        </Button>
      </div>

      <div className="mb-4">
        <Input
          placeholder="Search by plate number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="rounded-lg border bg-white dark:bg-gray-800 shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Plate Number</TableHead>
              <TableHead>Capacity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Driver</TableHead>
              <TableHead>Route</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : filteredBuses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  No buses found
                </TableCell>
              </TableRow>
            ) : (
              filteredBuses.map((bus) => (
                <TableRow key={bus.id}>
                  <TableCell className="font-medium">{bus.plateNumber}</TableCell>
                  <TableCell>{bus.capacity} seats</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        bus.status
                      )}`}
                    >
                      {bus.status.replace('_', ' ')}
                    </span>
                  </TableCell>
                  <TableCell>{bus.driverId || 'Unassigned'}</TableCell>
                  <TableCell>{bus.routeId || 'Unassigned'}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(bus)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <User className="mr-2 h-4 w-4" />
                          Assign Driver
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(bus.id)}>
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

      <BusDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        bus={selectedBus}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

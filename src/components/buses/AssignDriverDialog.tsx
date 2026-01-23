'use client';

import { useState, useEffect } from 'react';
import { usersApi } from '@/lib/api/users';
import { busesApi } from '@/lib/api/buses';
import { Bus } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AssignDriverDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bus: Bus | null;
  onAssigned: () => void;
}

export function AssignDriverDialog({ open, onOpenChange, bus, onAssigned }: AssignDriverDialogProps) {
  const [drivers, setDrivers] = useState<User[]>([]);
  const [selectedDriverId, setSelectedDriverId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      loadDrivers();
      // Pre-select current driver if assigned
      if (bus?.driverId) {
        setSelectedDriverId(bus.driverId);
      } else {
        setSelectedDriverId('');
      }
    }
  }, [open, bus]);

  const loadDrivers = async () => {
    try {
      setLoading(true);
      const allUsers = await usersApi.getAll();
      // Filter only users with DRIVER role
      const driverUsers = allUsers.filter((user: User) => user.role === 'DRIVER');
      setDrivers(driverUsers);
    } catch (error) {
      console.error('Failed to load drivers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!bus || !selectedDriverId) {
      return;
    }

    try {
      setSubmitting(true);
      
      // Update bus with selected driver
      await busesApi.update(bus.id, {
        driverId: selectedDriverId === 'unassign' ? undefined : selectedDriverId,
      });

      onAssigned();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to assign driver:', error);
      alert('Failed to assign driver. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Assign Driver</DialogTitle>
          <DialogDescription>
            Assign a driver to bus {bus?.plateNumber}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="driver">Driver</Label>
              {loading ? (
                <div className="text-sm text-gray-500">Loading drivers...</div>
              ) : (
                <Select
                  value={selectedDriverId}
                  onValueChange={setSelectedDriverId}
                  required
                >
                  <SelectTrigger id="driver">
                    <SelectValue placeholder="Select a driver" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassign">Unassign Driver</SelectItem>
                    {drivers.map((driver) => (
                      <SelectItem key={driver.id} value={driver.id}>
                        {driver.name} ({driver.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {drivers.length === 0 && !loading && (
                <p className="text-sm text-yellow-600">
                  No drivers available. Please create driver accounts first.
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting || !selectedDriverId}>
              {submitting ? 'Assigning...' : 'Assign Driver'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const busSchema = z.object({
  plateNumber: z.string().min(2, 'Plate number is required').toUpperCase(),
  capacity: z.number().min(1, 'Capacity must be at least 1'),
  status: z.enum(['IDLE', 'ON_ROUTE', 'MAINTENANCE', 'DELAYED']),
});

type BusFormValues = z.infer<typeof busSchema>;

interface BusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bus?: Bus | null;
  onSubmit: (data: Partial<Bus>) => Promise<void>;
}

export function BusDialog({ open, onOpenChange, bus, onSubmit }: BusDialogProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm<BusFormValues>({
    resolver: zodResolver(busSchema),
    defaultValues: {
      plateNumber: '',
      capacity: 30,
      status: 'IDLE',
    },
  });

  useEffect(() => {
    if (bus) {
      form.reset({
        plateNumber: bus.plateNumber,
        capacity: bus.capacity,
        status: bus.status,
      });
    } else {
      form.reset({
        plateNumber: '',
        capacity: 30,
        status: 'IDLE',
      });
    }
  }, [bus, form]);

  const handleSubmit = async (values: BusFormValues) => {
    try {
      setLoading(true);
      await onSubmit(values);
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error('Failed to submit bus:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{bus ? 'Edit Bus' : 'Add New Bus'}</DialogTitle>
          <DialogDescription>
            {bus ? 'Update bus details' : 'Enter the details for the new bus'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="plateNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Plate Number</FormLabel>
                  <FormControl>
                    <Input placeholder="RAC 123A" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="capacity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Capacity</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      {...field} 
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="IDLE">Idle</SelectItem>
                      <SelectItem value="ON_ROUTE">On Route</SelectItem>
                      <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                      <SelectItem value="DELAYED">Delayed</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Save Bus'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

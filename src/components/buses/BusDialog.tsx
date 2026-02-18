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
import { ImageUploader } from '@/components/ui/ImageUploader';

const busSchema = z.object({
  plateNumber: z.string().min(2, 'Plate number is required').toUpperCase(),
  totalSeats: z.number().min(1, 'Capacity must be at least 1'),
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
  const [imageUrl, setImageUrl] = useState('');

  const form = useForm<BusFormValues>({
    resolver: zodResolver(busSchema),
    defaultValues: {
      plateNumber: '',
      totalSeats: 40,
      status: 'IDLE',
    },
  });

  useEffect(() => {
    if (bus) {
      form.reset({
        plateNumber: bus.plateNumber,
        totalSeats: bus.totalSeats,
        status: bus.status,
      });
      setImageUrl(bus.imageUrl || '');
    } else {
      form.reset({
        plateNumber: '',
        totalSeats: 40,
        status: 'IDLE',
      });
      setImageUrl('');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bus, open]);

  const handleSubmit = async (values: BusFormValues) => {
    try {
      setLoading(true);
      await onSubmit({
        ...values,
        imageUrl: imageUrl || undefined,
      });
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
              name="totalSeats"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Seats</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="40"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <ImageUploader
              value={imageUrl}
              onChange={setImageUrl}
              folder="buses"
              label="Bus Image"
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
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

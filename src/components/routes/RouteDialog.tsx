'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Route } from '@/types';
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
import { Switch } from '@/components/ui/switch';

const routeSchema = z.object({
  name: z.string().min(2, 'Route name is required'),
  origin: z.string().min(2, 'Origin is required'),
  destination: z.string().min(2, 'Destination is required'),
  price: z.coerce.number().min(0, 'Price must be positive'),
  estimatedDuration: z.string().min(1, 'Duration is required'),
  isActive: z.boolean().default(true),
});

type RouteFormValues = z.infer<typeof routeSchema>;

interface RouteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  route?: Route | null;
  onSubmit: (data: Partial<Route>) => Promise<void>;
}

export function RouteDialog({ open, onOpenChange, route, onSubmit }: RouteDialogProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm<RouteFormValues>({
    resolver: zodResolver(routeSchema),
    defaultValues: {
      name: '',
      origin: '',
      destination: '',
      price: 0,
      estimatedDuration: '',
      isActive: true,
    },
  });

  useEffect(() => {
    if (route) {
      form.reset({
        name: route.name,
        origin: route.origin,
        destination: route.destination,
        price: route.price,
        estimatedDuration: route.estimatedDuration,
        isActive: route.isActive,
      });
    } else {
      form.reset({
        name: '',
        origin: '',
        destination: '',
        price: 0,
        estimatedDuration: '',
        isActive: true,
      });
    }
  }, [route, form]);

  const handleSubmit = async (values: RouteFormValues) => {
    try {
      setLoading(true);
      await onSubmit(values);
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error('Failed to submit route:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>{route ? 'Edit Route' : 'Add New Route'}</DialogTitle>
          <DialogDescription>
            {route ? 'Update route details' : 'Enter the details for the new route'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Route Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Kigali - Musanze" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="origin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Origin</FormLabel>
                    <FormControl>
                      <Input placeholder="Kigali" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="destination"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Destination</FormLabel>
                    <FormControl>
                      <Input placeholder="Musanze" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price (RWF)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="estimatedDuration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration</FormLabel>
                    <FormControl>
                      <Input placeholder="2h 30m" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Active Route</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Enable or disable this route
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Save Route'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

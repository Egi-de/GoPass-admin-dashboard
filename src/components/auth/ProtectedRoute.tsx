'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, loadStoredAuth } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    loadStoredAuth();
    setMounted(true);
  }, [loadStoredAuth]);

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.push('/login');
    }
  }, [mounted, isAuthenticated, router]);

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted || !isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

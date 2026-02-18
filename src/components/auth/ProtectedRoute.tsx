'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, user, loadStoredAuth } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    loadStoredAuth();
    setMounted(true);
  }, [loadStoredAuth]);

  useEffect(() => {
    if (!mounted) return;
    if (!isAuthenticated) {
      router.push('/login');
    } else if (user && user.role !== 'ADMIN') {
      // Non-admin users are not allowed in the dashboard
      router.push('/login?error=unauthorized');
    }
  }, [mounted, isAuthenticated, user, router]);

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted || !isAuthenticated || (user && user.role !== 'ADMIN')) {
    return null;
  }

  return <>{children}</>;
}

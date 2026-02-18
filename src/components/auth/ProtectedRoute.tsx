'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, user, loadStoredAuth } = useAuthStore();

  useEffect(() => {
    const init = async () => {
      await loadStoredAuth();
      const { isAuthenticated: authed, user: u } = useAuthStore.getState();
      if (!authed) {
        router.push('/login');
      } else if (u && u.role !== 'ADMIN') {
        router.push('/login?error=unauthorized');
      }
    };
    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Don't render children until authenticated as admin
  if (!isAuthenticated || (user && user.role !== 'ADMIN')) {
    return null;
  }

  return <>{children}</>;
}

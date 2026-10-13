'use client';

import { useState, useEffect } from 'react';

/**
 * Hook to check if current logged-in user has admin privileges.
 */
export function useAdminStatus() {
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    if (
      typeof window !== 'undefined' &&
      localStorage.getItem('is_admin') === '1'
    ) {
      return true;
    }
    return false;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    fetch('/api/auth/me')
      .then(res => (res.ok ? res.json() : null))
      .then(data => {
        if (isMounted) {
          if (data && (data.is_admin === 1 || data.is_admin === true)) {
            try {
              localStorage.setItem('is_admin', '1');
            } catch {}
            setIsAdmin(true);
          } else {
            try {
              localStorage.removeItem('is_admin');
            } catch {}
            setIsAdmin(false);
          }
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setIsAdmin(false);
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return { isAdmin, isLoading };
}

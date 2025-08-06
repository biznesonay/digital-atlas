import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store';
import { selectIsAuthenticated, selectUser } from '@/store/slices/authSlice';

interface UseAuthOptions {
  redirectTo?: string;
  redirectIfFound?: boolean;
  allowedRoles?: string[];
}

export function useAuth(options: UseAuthOptions = {}) {
  const router = useRouter();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectUser);
  
  const {
    redirectTo = '/login',
    redirectIfFound = false,
    allowedRoles = [],
  } = options;

  useEffect(() => {
    // Если не аутентифицирован и нужно быть аутентифицированным
    if (!isAuthenticated && !redirectIfFound) {
      router.push(redirectTo);
    }
    
    // Если аутентифицирован и нужно редиректить аутентифицированных
    if (isAuthenticated && redirectIfFound) {
      router.push(redirectTo);
    }
    
    // Проверка ролей
    if (isAuthenticated && allowedRoles.length > 0 && user) {
      if (!allowedRoles.includes(user.role)) {
        router.push('/');
      }
    }
  }, [isAuthenticated, redirectIfFound, redirectTo, router, user, allowedRoles]);

  return { isAuthenticated, user };
}

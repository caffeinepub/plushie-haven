import { ReactNode } from 'react';
import { useUserRole } from '../../hooks/useUserRole';
import { UserRole } from '../../backend';
import AccessDeniedScreen from './AccessDeniedScreen';
import LoadingState from '../LoadingState';

interface RoleGuardProps {
  requiredRole: UserRole;
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Role-based route guard component that checks if the current user has the required role.
 */
export default function RoleGuard({ requiredRole, children, fallback }: RoleGuardProps) {
  const { data: role, isLoading } = useUserRole();

  if (isLoading) {
    return <LoadingState message="Checking permissions..." />;
  }

  const roleHierarchy: Record<UserRole, number> = {
    [UserRole.guest]: 0,
    [UserRole.user]: 1,
    [UserRole.admin]: 2,
  };

  const hasPermission = role ? roleHierarchy[role] >= roleHierarchy[requiredRole] : false;

  if (!hasPermission) {
    return fallback || <AccessDeniedScreen requiredRole={requiredRole} currentRole={role} />;
  }

  return <>{children}</>;
}

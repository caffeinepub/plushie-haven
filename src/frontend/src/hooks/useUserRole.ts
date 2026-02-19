import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import { UserRole } from '../backend';

/**
 * Hook to fetch and manage the current user's role.
 */
export function useUserRole() {
  const { actor, isFetching } = useActor();

  return useQuery<UserRole>({
    queryKey: ['userRole'],
    queryFn: async () => {
      if (!actor) return UserRole.guest;
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !isFetching,
  });
}

/**
 * Hook to check if the current user is an admin.
 */
export function useIsAdmin() {
  const { data: role, isLoading } = useUserRole();
  return {
    isAdmin: role === UserRole.admin,
    isLoading,
  };
}

/**
 * Hook to check if the current user is a moderator.
 */
export function useIsModerator() {
  const { data: role, isLoading } = useUserRole();
  return {
    isModerator: role === UserRole.admin || role === UserRole.user, // Note: Backend doesn't have moderator role yet
    isLoading,
  };
}

/**
 * Hook to check if the current user has at least the required role level.
 */
export function useHasPermission(requiredRole: UserRole) {
  const { data: role, isLoading } = useUserRole();
  
  const roleHierarchy: Record<UserRole, number> = {
    [UserRole.guest]: 0,
    [UserRole.user]: 1,
    [UserRole.admin]: 2,
  };

  const hasPermission = role ? roleHierarchy[role] >= roleHierarchy[requiredRole] : false;

  return {
    hasPermission,
    isLoading,
  };
}

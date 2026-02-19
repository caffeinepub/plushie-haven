import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useActor } from '../hooks/useActor';
import { useGetCallerUserProfile } from '../hooks/useProfileQueries';
import { useUserRole } from '../hooks/useUserRole';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOut, Shield, User, Edit } from 'lucide-react';
import { toast } from 'sonner';
import { normalizeActorError } from '../utils/actorError';
import { UserRole } from '../backend';

export default function AuthControls() {
  const { identity, login, clear, isLoggingIn, isInitializing } = useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { data: userProfile, isLoading: profileLoading } = useGetCallerUserProfile();
  const { data: userRole } = useUserRole();

  const isAuthenticated = identity && !identity.getPrincipal().isAnonymous();
  const isConnecting = actorFetching && !actor;

  const handleClaimAdmin = async () => {
    if (isConnecting) {
      toast.error('Connecting to the server. Please wait a moment...');
      return;
    }

    if (!actor) {
      toast.error('Failed to connect to the server. Please try again.');
      return;
    }

    try {
      const actorWithClaimAdmin = actor as any;
      
      if (typeof actorWithClaimAdmin.claimAdmin !== 'function') {
        toast.error('Admin claim functionality is not yet available. Please contact support.');
        return;
      }
      
      await actorWithClaimAdmin.claimAdmin();
      
      await queryClient.invalidateQueries({ queryKey: ['isAdmin'] });
      await queryClient.invalidateQueries({ queryKey: ['userRole'] });
      
      toast.success('You are now an admin.');
    } catch (error: any) {
      toast.error(normalizeActorError(error));
    }
  };

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    toast.success('You have been signed out.');
  };

  const handleViewProfile = () => {
    if (identity) {
      const principalString = identity.getPrincipal().toString();
      navigate({ to: '/profiles/$principal', params: { principal: principalString } });
    }
  };

  const handleEditProfile = () => {
    if (identity) {
      const principalString = identity.getPrincipal().toString();
      navigate({ to: '/profiles/$principal', params: { principal: principalString }, search: { edit: true } });
    }
  };

  if (isInitializing) {
    return null;
  }

  if (!isAuthenticated) {
    return (
      <Button onClick={login} disabled={isLoggingIn} size="sm">
        {isLoggingIn ? 'Signing In...' : 'Sign In'}
      </Button>
    );
  }

  const principalText = identity.getPrincipal().toString();
  const shortPrincipal = `${principalText.slice(0, 5)}...${principalText.slice(-3)}`;
  const displayName = userProfile?.displayName?.trim() || shortPrincipal;

  const roleLabels: Record<UserRole, string> = {
    [UserRole.guest]: 'Guest',
    [UserRole.user]: 'User',
    [UserRole.admin]: 'Admin',
  };

  const roleColors: Record<UserRole, string> = {
    [UserRole.guest]: 'bg-gray-100 text-gray-800',
    [UserRole.user]: 'bg-blue-100 text-blue-800',
    [UserRole.admin]: 'bg-red-100 text-red-800',
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          {profileLoading ? shortPrincipal : displayName}
          {userRole && userRole !== UserRole.guest && (
            <Badge variant="secondary" className={`text-xs ${roleColors[userRole]}`}>
              {roleLabels[userRole]}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Signed In</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleViewProfile} className="gap-2">
          <User className="h-4 w-4" />
          View My Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleEditProfile} className="gap-2">
          <Edit className="h-4 w-4" />
          Edit Profile
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleClaimAdmin} className="gap-2">
          <Shield className="h-4 w-4" />
          Claim Admin
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="gap-2 text-destructive focus:text-destructive">
          <LogOut className="h-4 w-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

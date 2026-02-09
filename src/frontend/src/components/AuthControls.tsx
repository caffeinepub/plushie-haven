import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useActor } from '../hooks/useActor';
import { useGetCallerUserProfile } from '../hooks/useProfileQueries';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOut, Shield } from 'lucide-react';
import { toast } from 'sonner';

export default function AuthControls() {
  const { identity, login, clear, isLoggingIn, isInitializing } = useInternetIdentity();
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { data: userProfile, isLoading: profileLoading } = useGetCallerUserProfile();

  const isAuthenticated = identity && !identity.getPrincipal().isAnonymous();

  const handleClaimAdmin = async () => {
    if (!actor) {
      toast.error('Still connecting to the server. Please try again in a moment.');
      return;
    }

    try {
      // Type assertion to access claimAdmin method that should exist on the backend
      // but isn't yet reflected in the generated type definitions
      const actorWithClaimAdmin = actor as any;
      
      if (typeof actorWithClaimAdmin.claimAdmin !== 'function') {
        toast.error('Admin claim functionality is not yet available. Please contact support.');
        return;
      }
      
      await actorWithClaimAdmin.claimAdmin();
      
      // Invalidate and refetch admin status query to refresh UI
      await queryClient.invalidateQueries({ queryKey: ['isAdmin'] });
      
      toast.success('You are now an admin.');
    } catch (error: any) {
      const message = error?.message || 'An error occurred';
      
      if (message.includes('Admin has already been claimed') || 
          message.includes('already claimed') || 
          message.includes('Admin already exists')) {
        toast.error('Admin access has already been claimed on this canister.');
      } else if (message.includes('Actor not initialized') || 
                 message.includes('Actor not available') || 
                 message.includes('Still connecting')) {
        toast.error('Still connecting to the server. Please try again in a moment.');
      } else {
        toast.error(message);
      }
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

  // Determine display name: use profile displayName if available, otherwise fall back to short principal
  const principalText = identity.getPrincipal().toString();
  const shortPrincipal = `${principalText.slice(0, 5)}...${principalText.slice(-3)}`;
  
  const displayName = userProfile?.displayName?.trim() || shortPrincipal;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          {profileLoading ? shortPrincipal : displayName}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Signed In</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleClaimAdmin} className="gap-2">
          <Shield className="h-4 w-4" />
          Claim Admin
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={clear} className="gap-2 text-destructive focus:text-destructive">
          <LogOut className="h-4 w-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

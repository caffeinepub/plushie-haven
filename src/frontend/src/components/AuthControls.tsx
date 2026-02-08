import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useActor } from '../hooks/useActor';
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
import { User, LogOut, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { normalizeActorError } from '../utils/actorError';
import { UserRole } from '../backend';

export default function AuthControls() {
  const { identity, login, clear, isLoggingIn, isInitializing } = useInternetIdentity();
  const { actor } = useActor();
  const queryClient = useQueryClient();

  const isAuthenticated = identity && !identity.getPrincipal().isAnonymous();

  const handleClaimAdmin = async () => {
    if (!actor) {
      toast.error('System not ready. Please try again.');
      return;
    }

    try {
      // The backend's assignCallerUserRole with 'admin' role will handle the one-time claim logic
      await actor.assignCallerUserRole(identity!.getPrincipal(), UserRole.admin);
      
      // Invalidate admin status query to refresh
      queryClient.invalidateQueries({ queryKey: ['isAdmin'] });
      
      toast.success('Admin privileges claimed successfully!');
    } catch (error) {
      toast.error(normalizeActorError(error));
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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <User className="h-4 w-4" />
          <span className="hidden sm:inline">{shortPrincipal}</span>
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

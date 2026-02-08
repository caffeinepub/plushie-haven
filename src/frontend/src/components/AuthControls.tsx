import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, LogOut } from 'lucide-react';

export default function AuthControls() {
  const { identity, login, clear, isLoggingIn, isInitializing } = useInternetIdentity();

  const isAuthenticated = identity && !identity.getPrincipal().isAnonymous();

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
        <DropdownMenuItem onClick={clear} className="gap-2 text-destructive focus:text-destructive">
          <LogOut className="h-4 w-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

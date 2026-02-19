import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { UserRole } from '../../backend';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ShieldAlert, Home, LogIn } from 'lucide-react';

interface AccessDeniedScreenProps {
  requiredRole: UserRole;
  currentRole?: UserRole;
}

/**
 * Access denied screen component displaying an error message and navigation options.
 */
export default function AccessDeniedScreen({ requiredRole, currentRole }: AccessDeniedScreenProps) {
  const navigate = useNavigate();
  const { identity, login } = useInternetIdentity();
  const isAuthenticated = identity && !identity.getPrincipal().isAnonymous();

  const roleLabels: Record<UserRole, string> = {
    [UserRole.guest]: 'Guest',
    [UserRole.user]: 'User',
    [UserRole.admin]: 'Admin',
  };

  const getMessage = () => {
    if (!isAuthenticated) {
      return 'You must be signed in to access this page.';
    }
    return `This page requires ${roleLabels[requiredRole]} access. Your current role is ${currentRole ? roleLabels[currentRole] : 'unknown'}.`;
  };

  return (
    <div className="container mx-auto flex min-h-[60vh] max-w-2xl items-center justify-center px-4">
      <div className="w-full space-y-6 text-center">
        <div className="flex justify-center">
          <div className="rounded-full bg-destructive/10 p-6">
            <ShieldAlert className="h-16 w-16 text-destructive" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Access Denied</h1>
          <p className="text-lg text-muted-foreground">{getMessage()}</p>
        </div>

        <Alert className="border-destructive/50 text-left">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Insufficient Permissions</AlertTitle>
          <AlertDescription>
            You do not have the required permissions to view this page. If you believe this is an error, please contact an administrator.
          </AlertDescription>
        </Alert>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          {!isAuthenticated ? (
            <Button onClick={login} size="lg" className="gap-2">
              <LogIn className="h-4 w-4" />
              Sign In
            </Button>
          ) : null}
          <Button onClick={() => navigate({ to: '/' })} variant="outline" size="lg" className="gap-2">
            <Home className="h-4 w-4" />
            Return to Home
          </Button>
        </div>
      </div>
    </div>
  );
}

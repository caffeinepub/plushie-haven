import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Users, Search, Shield, User as UserIcon, AlertCircle } from 'lucide-react';
import LoadingState from '../components/LoadingState';

export default function AdminUserManagementPage() {
  const { identity } = useInternetIdentity();
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="container mx-auto max-w-6xl space-y-6 px-4 py-8">
      <div className="flex items-center gap-3">
        <div className="rounded-full bg-primary/10 p-3">
          <Users className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">Manage users and assign roles</p>
        </div>
      </div>

      <Alert className="border-yellow-500/50 bg-yellow-50">
        <AlertCircle className="h-4 w-4 text-yellow-600" />
        <AlertDescription className="text-yellow-800">
          <strong>Backend Implementation Required:</strong> The backend does not yet support user listing, role assignment, or user deletion. These features need to be implemented in the Motoko backend before this page can function.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>Search and manage user accounts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by principal or username..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="text-center py-12 text-muted-foreground">
            <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>User management features are coming soon.</p>
            <p className="text-sm mt-2">Backend implementation is required to enable this functionality.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

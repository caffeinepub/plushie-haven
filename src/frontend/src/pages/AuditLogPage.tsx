import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, Search, AlertCircle } from 'lucide-react';

export default function AuditLogPage() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="container mx-auto max-w-6xl space-y-6 px-4 py-8">
      <div className="flex items-center gap-3">
        <div className="rounded-full bg-primary/10 p-3">
          <FileText className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
          <p className="text-muted-foreground">View administrative and moderation action history</p>
        </div>
      </div>

      <Alert className="border-yellow-500/50 bg-yellow-50">
        <AlertCircle className="h-4 w-4 text-yellow-600" />
        <AlertDescription className="text-yellow-800">
          <strong>Backend Implementation Required:</strong> Audit logging requires backend support for tracking and storing administrative actions. This feature will be available once the backend is updated.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Action History</CardTitle>
          <CardDescription>Search and filter audit log entries</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="text-center py-12 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Audit log features are coming soon.</p>
            <p className="text-sm mt-2">Backend implementation is required to enable this functionality.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

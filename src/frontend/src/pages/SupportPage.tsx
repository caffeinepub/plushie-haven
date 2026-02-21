import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useIsAdmin } from '../hooks/useUserRole';
import {
  useGetSupporters,
  useGetSupporterRequests,
  useSubmitSupporterRequest,
  useApproveSupporter,
  useRevokeSupporter,
} from '../hooks/useSupporterQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Heart, ExternalLink, Shield, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { normalizeActorError } from '../utils/actorError';
import LoadingState from '../components/LoadingState';
import { Principal } from '@dfinity/principal';

export default function SupportPage() {
  const { identity } = useInternetIdentity();
  const { isAdmin } = useIsAdmin();
  const isAuthenticated = identity && !identity.getPrincipal().isAnonymous();

  const { data: supportersMap, isLoading: supportersLoading } = useGetSupporters();
  const { data: supporterRequests, isLoading: requestsLoading } = useGetSupporterRequests();
  const submitRequestMutation = useSubmitSupporterRequest();
  const approveMutation = useApproveSupporter();
  const revokeMutation = useRevokeSupporter();

  const [displayName, setDisplayName] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error('Please sign in to submit a supporter request');
      return;
    }

    if (!displayName.trim() || !message.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await submitRequestMutation.mutateAsync({
        displayName: displayName.trim(),
        message: message.trim(),
        numberOfCoffees: null,
        validUntil: null,
      });

      setDisplayName('');
      setMessage('');
      toast.success('Supporter request submitted successfully!');
    } catch (error) {
      toast.error(normalizeActorError(error));
    }
  };

  const handleApprove = async (principal: Principal) => {
    try {
      await approveMutation.mutateAsync({ supporter: principal, validUntil: null });
      toast.success('Supporter approved!');
    } catch (error) {
      toast.error(normalizeActorError(error));
    }
  };

  const handleRevoke = async (principalString: string) => {
    try {
      const principal = Principal.fromText(principalString);
      await revokeMutation.mutateAsync(principal);
      toast.success('Supporter status revoked');
    } catch (error) {
      toast.error(normalizeActorError(error));
    }
  };

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1_000_000);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="container mx-auto max-w-4xl space-y-8 px-4 py-8">
      <div>
        <h1 className="mb-2 text-4xl font-bold tracking-tight">Support Plushie Haven</h1>
        <p className="text-muted-foreground">
          Help us maintain and grow this cozy community for plushie enthusiasts.
        </p>
      </div>

      {/* External Support Links */}
      <Card className="border-2 shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            Support Us
          </CardTitle>
          <CardDescription>Choose your preferred platform to support our community</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <a
            href="https://ko-fi.com/painparadise"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between rounded-lg border-2 border-primary/20 p-4 transition-all hover:border-primary/40 hover:shadow-soft"
          >
            <div>
              <h3 className="font-semibold">Ko-fi</h3>
              <p className="text-sm text-muted-foreground">Buy us a coffee on Ko-fi</p>
            </div>
            <ExternalLink className="h-5 w-5 text-primary" />
          </a>

          <a
            href="https://www.patreon.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between rounded-lg border-2 border-primary/20 p-4 transition-all hover:border-primary/40 hover:shadow-soft"
          >
            <div>
              <h3 className="font-semibold">Patreon</h3>
              <p className="text-sm text-muted-foreground">Become a patron and get exclusive perks</p>
            </div>
            <ExternalLink className="h-5 w-5 text-primary" />
          </a>
        </CardContent>
      </Card>

      {/* Supporter Request Form */}
      <Card className="border-2 shadow-soft">
        <CardHeader>
          <CardTitle>Become a Supporter</CardTitle>
          <CardDescription>
            Submit a request to become an official supporter and unlock special features
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isAuthenticated ? (
            <Alert>
              <AlertDescription>Please sign in to submit a supporter request.</AlertDescription>
            </Alert>
          ) : (
            <form onSubmit={handleSubmitRequest} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="display-name">
                  Display Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="display-name"
                  placeholder="How should we recognize you?"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                  maxLength={100}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">
                  Message <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="message"
                  placeholder="Tell us why you'd like to become a supporter..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  maxLength={500}
                  rows={4}
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={submitRequestMutation.isPending}
              >
                {submitRequestMutation.isPending ? 'Submitting...' : 'Submit Request'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Admin Panel */}
      {isAdmin && (
        <Card className="border-2 border-primary/30 shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Admin: Supporter Management
            </CardTitle>
            <CardDescription>Review and manage supporter requests and current supporters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Pending Requests */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Pending Requests</h3>
              {requestsLoading ? (
                <LoadingState message="Loading requests..." />
              ) : !supporterRequests || supporterRequests.length === 0 ? (
                <p className="text-sm text-muted-foreground">No pending requests</p>
              ) : (
                <div className="space-y-3">
                  {supporterRequests.map(([principal, request]) => (
                    <div
                      key={principal.toString()}
                      className="flex items-start justify-between rounded-lg border p-4"
                    >
                      <div className="flex-1 space-y-1">
                        <p className="font-medium">{request.displayName}</p>
                        <p className="text-sm text-muted-foreground">{request.message}</p>
                        <p className="text-xs text-muted-foreground">
                          Submitted: {formatDate(request.submittedAt)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleApprove(principal)}
                          disabled={approveMutation.isPending}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Current Supporters */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Current Supporters</h3>
              {supportersLoading ? (
                <LoadingState message="Loading supporters..." />
              ) : !supportersMap || supportersMap.size === 0 ? (
                <p className="text-sm text-muted-foreground">No supporters yet</p>
              ) : (
                <div className="space-y-3">
                  {Array.from(supportersMap.entries()).map(([principalString, profile]) => (
                    <div
                      key={principalString}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div className="space-y-1">
                        <p className="font-medium">{profile.displayName}</p>
                        <p className="text-xs text-muted-foreground">
                          Added: {formatDate(profile.addedAt)}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleRevoke(principalString)}
                        disabled={revokeMutation.isPending}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Revoke
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

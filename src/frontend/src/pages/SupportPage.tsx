import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import {
  useSubmitSupporterRequest,
  useGetSupporterRequests,
  useApproveSupporter,
  useRevokeSupporter,
  useGetSupporters,
} from '../hooks/useSupporterQueries';
import { useIsCallerAdmin } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader2, Heart, Coffee, ExternalLink, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { normalizeActorError } from '../utils/actorError';
import LoadingState from '../components/LoadingState';

export default function SupportPage() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = identity && !identity.getPrincipal().isAnonymous();

  const { data: isAdmin } = useIsCallerAdmin();
  const submitRequestMutation = useSubmitSupporterRequest();
  const { data: supporterRequests, isLoading: requestsLoading } = useGetSupporterRequests();
  const { data: supportersMap, isLoading: supportersLoading } = useGetSupporters();
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

    if (!displayName.trim()) {
      toast.error('Display name is required');
      return;
    }

    if (!message.trim()) {
      toast.error('Message is required');
      return;
    }

    try {
      await submitRequestMutation.mutateAsync({
        displayName: displayName.trim(),
        message: message.trim(),
      });

      setDisplayName('');
      setMessage('');
      toast.success('Supporter request submitted successfully!');
    } catch (error) {
      toast.error(normalizeActorError(error));
    }
  };

  const handleApprove = async (supporter: string) => {
    try {
      // Convert string back to Principal
      const principal = { toString: () => supporter } as any;
      await approveMutation.mutateAsync({ supporter: principal });
      toast.success('Supporter approved successfully!');
    } catch (error) {
      toast.error(normalizeActorError(error));
    }
  };

  const handleRevoke = async (supporter: string) => {
    try {
      const principal = { toString: () => supporter } as any;
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
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="container mx-auto max-w-4xl space-y-8 px-4 py-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold tracking-tight">Support Plushie Haven</h1>
        <p className="text-lg text-muted-foreground">
          Help us keep this cozy community thriving
        </p>
      </div>

      {/* External Monetization Links */}
      <Card className="border-2 shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-pink-500" />
            Ways to Support Us
          </CardTitle>
          <CardDescription>
            Your support helps us maintain and improve Plushie Haven for everyone
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <a
              href="https://ko-fi.com/painparadise"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-pink-500/5 p-4 transition-all hover:border-primary/40 hover:shadow-soft"
            >
              <Coffee className="h-6 w-6 text-primary" />
              <div className="flex-1">
                <div className="font-semibold">Buy us a coffee</div>
                <div className="text-sm text-muted-foreground">Ko-fi</div>
              </div>
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </a>

            <a
              href="https://patreon.com/plushiehaven"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-pink-500/5 p-4 transition-all hover:border-primary/40 hover:shadow-soft"
            >
              <Heart className="h-6 w-6 text-pink-500" />
              <div className="flex-1">
                <div className="font-semibold">Become a patron</div>
                <div className="text-sm text-muted-foreground">Patreon</div>
              </div>
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </a>
          </div>

          <Alert className="border-primary/30 bg-primary/5">
            <AlertDescription>
              After supporting us, submit a request below to get your Supporter badge and unlock exclusive perks!
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Supporter Request Form */}
      <Card className="border-2 shadow-soft">
        <CardHeader>
          <CardTitle>Request Supporter Status</CardTitle>
          <CardDescription>
            Let us know you've supported us to receive your Supporter badge
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
                  placeholder="Your name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                  maxLength={50}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">
                  Message <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="message"
                  placeholder="Tell us how you supported us (e.g., Ko-fi username, Patreon email, etc.)"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  maxLength={500}
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">
                  Include details that help us verify your support (username, email, transaction ID, etc.)
                </p>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={submitRequestMutation.isPending}
              >
                {submitRequestMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Request'
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Admin Moderation Panel */}
      {isAdmin && (
        <>
          <Separator className="my-8" />

          <div className="space-y-6">
            <div>
              <h2 className="mb-2 text-2xl font-bold">Admin: Supporter Moderation</h2>
              <p className="text-muted-foreground">Review and manage supporter requests</p>
            </div>

            {/* Pending Requests */}
            <Card className="border-2 shadow-soft">
              <CardHeader>
                <CardTitle>Pending Requests</CardTitle>
                <CardDescription>Review and approve supporter requests</CardDescription>
              </CardHeader>
              <CardContent>
                {requestsLoading ? (
                  <LoadingState message="Loading requests..." />
                ) : !supporterRequests || supporterRequests.length === 0 ? (
                  <p className="py-4 text-center text-muted-foreground">No pending requests</p>
                ) : (
                  <div className="space-y-4">
                    {supporterRequests.map(([principal, request]) => (
                      <div
                        key={principal.toString()}
                        className="rounded-lg border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-pink-500/5 p-4"
                      >
                        <div className="mb-3 flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="font-semibold">{request.displayName}</div>
                            <div className="text-xs text-muted-foreground">
                              {principal.toString().slice(0, 20)}...
                            </div>
                            <div className="mt-1 text-xs text-muted-foreground">
                              Submitted {formatDate(request.submittedAt)}
                            </div>
                          </div>
                        </div>
                        <div className="mb-3 rounded-lg bg-white/50 p-3 text-sm">
                          {request.message}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleApprove(principal.toString())}
                            disabled={approveMutation.isPending}
                            className="flex-1"
                          >
                            {approveMutation.isPending ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                            )}
                            Approve
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Current Supporters */}
            <Card className="border-2 shadow-soft">
              <CardHeader>
                <CardTitle>Current Supporters</CardTitle>
                <CardDescription>Manage active supporters</CardDescription>
              </CardHeader>
              <CardContent>
                {supportersLoading ? (
                  <LoadingState message="Loading supporters..." />
                ) : !supportersMap || supportersMap.size === 0 ? (
                  <p className="py-4 text-center text-muted-foreground">No supporters yet</p>
                ) : (
                  <div className="space-y-3">
                    {Array.from(supportersMap.entries()).map(([principal, profile]) => (
                      <div
                        key={principal}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{profile.displayName}</span>
                            <Badge variant="default" className="text-xs">
                              Supporter
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Added {formatDate(profile.addedAt)}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRevoke(principal)}
                          disabled={revokeMutation.isPending}
                        >
                          {revokeMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <XCircle className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

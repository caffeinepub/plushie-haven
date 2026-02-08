import { useState, useEffect, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const AGE_GATE_KEY = 'plushie-haven-age-confirmed';

interface AgeGateProps {
  children: ReactNode;
}

export default function AgeGate({ children }: AgeGateProps) {
  const [confirmed, setConfirmed] = useState<boolean | null>(null);
  const [declined, setDeclined] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(AGE_GATE_KEY);
    setConfirmed(stored === 'true');
  }, []);

  const handleConfirm = () => {
    localStorage.setItem(AGE_GATE_KEY, 'true');
    setConfirmed(true);
  };

  const handleDecline = () => {
    setDeclined(true);
  };

  if (confirmed === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!confirmed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md border-2 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Welcome to Plushie Haven</CardTitle>
            <CardDescription className="text-base">
              This website is intended for adults (18+) who enjoy plushie collecting and lifestyle content.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            {declined ? (
              <p className="text-destructive font-medium">
                You must be 18 or older to access this site. Thank you for your understanding.
              </p>
            ) : (
              <p className="text-muted-foreground">
                By entering, you confirm that you are at least 18 years of age.
              </p>
            )}
          </CardContent>
          {!declined && (
            <CardFooter className="flex gap-3">
              <Button variant="outline" onClick={handleDecline} className="flex-1">
                I'm Under 18
              </Button>
              <Button onClick={handleConfirm} className="flex-1">
                I'm 18 or Older
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}

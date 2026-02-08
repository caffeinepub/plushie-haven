import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Mail, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);

  const contactEmail = 'hello@plushiehaven.com';

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(contactEmail);
    setCopied(true);
    toast.success('Email copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent('Contact from Plushie Haven');
    const body = encodeURIComponent(`Name: ${name}\n\nMessage:\n${message}`);
    window.location.href = `mailto:${contactEmail}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="container py-12">
      <div className="mx-auto max-w-2xl">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold tracking-tight">Contact Us</h1>
          <p className="text-lg text-muted-foreground">
            Have questions, suggestions, or feedback? We'd love to hear from you!
          </p>
        </div>

        <div className="space-y-6">
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Send Us a Message</CardTitle>
              <CardDescription>Fill out the form below and we'll get back to you soon.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Tell us what's on your mind..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    rows={6}
                  />
                </div>

                <Button type="submit" className="w-full">
                  <Mail className="mr-2 h-4 w-4" />
                  Send Email
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader>
              <CardTitle>Email Us Directly</CardTitle>
              <CardDescription>Prefer to use your own email client? Copy our address below.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Input value={contactEmail} readOnly className="flex-1" />
                <Button variant="outline" size="icon" onClick={handleCopyEmail}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

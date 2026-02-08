import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Users, Shield, Sparkles } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="container py-12">
      <div className="mx-auto max-w-4xl">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold tracking-tight">About Plushie Haven</h1>
          <p className="text-lg text-muted-foreground">
            A welcoming community for adult plushie enthusiasts to connect, share, and celebrate their passion.
          </p>
        </div>

        <div className="mb-12 space-y-6">
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-6 w-6 text-primary" />
                Our Mission
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                Plushie Haven was created to provide a safe, judgment-free space for adults who find joy, comfort, and
                companionship in plushies. We believe that plushie collecting and appreciation is a valid and
                meaningful hobby for people of all ages.
              </p>
              <p>
                Whether you're a longtime collector, someone who travels with a comfort plushie, or simply curious
                about the lifestyle, you're welcome here. We celebrate the diverse ways people incorporate plushies
                into their lives.
              </p>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-6 w-6 text-primary" />
                  Community Values
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Respect and kindness toward all members</li>
                  <li>• Celebrating diverse collecting styles</li>
                  <li>• Supporting mental health and self-care</li>
                  <li>• Sharing knowledge and experiences</li>
                  <li>• Creating a judgment-free environment</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-6 w-6 text-primary" />
                  What We Offer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Expert care and maintenance guides</li>
                  <li>• Display and organization tips</li>
                  <li>• Community discussion board</li>
                  <li>• Event listings and meetups</li>
                  <li>• Gallery of member collections</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-primary" />
                Community Guidelines
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                To maintain a positive and welcoming environment, we ask all members to follow these guidelines:
              </p>
              <ul className="space-y-2">
                <li>
                  <strong>Be Respectful:</strong> Treat others with kindness and respect. No harassment, bullying, or
                  discriminatory behavior.
                </li>
                <li>
                  <strong>Keep It Appropriate:</strong> While this is an adult community, all content should remain
                  non-explicit and suitable for a general audience.
                </li>
                <li>
                  <strong>Stay On Topic:</strong> Keep discussions related to plushies, collecting, care, and the
                  lifestyle.
                </li>
                <li>
                  <strong>Respect Privacy:</strong> Don't share personal information about others without permission.
                </li>
                <li>
                  <strong>No Spam or Self-Promotion:</strong> Commercial posts require prior approval from moderators.
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

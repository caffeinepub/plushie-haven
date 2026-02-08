import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Users, Calendar, BookOpen } from 'lucide-react';
import { Link } from '@tanstack/react-router';

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b bg-gradient-to-b from-background to-muted/30">
        <div className="container py-16 md:py-24">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
            <div className="flex flex-col justify-center space-y-6">
              <div className="space-y-4">
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                  Welcome to <span className="text-primary">Plushie Haven</span>
                </h1>
                <p className="text-lg text-muted-foreground md:text-xl">
                  A cozy community for adult plushie enthusiasts. Discover care tips, connect with fellow collectors,
                  and celebrate the joy of plushie companionship.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link to="/articles">
                  <Button size="lg">Explore Articles</Button>
                </Link>
                <Link to="/community">
                  <Button size="lg" variant="outline">
                    Join Community
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative aspect-video overflow-hidden rounded-2xl border-2 shadow-xl lg:aspect-auto lg:h-full">
              <img
                src="/assets/generated/plushie-haven-hero.dim_1600x900.png"
                alt="Plushie Haven - A cozy collection of beloved plushies"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container py-16 md:py-24">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">What We Offer</h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Everything you need to enhance your plushie lifestyle and connect with like-minded enthusiasts.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-2 transition-shadow hover:shadow-lg">
            <CardHeader>
              <BookOpen className="mb-2 h-10 w-10 text-primary" />
              <CardTitle>Expert Guides</CardTitle>
              <CardDescription>
                In-depth articles on care, display, collecting, and plushie lifestyle tips.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/articles">
                <Button variant="ghost" className="w-full">
                  Read Articles
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-2 transition-shadow hover:shadow-lg">
            <CardHeader>
              <Users className="mb-2 h-10 w-10 text-primary" />
              <CardTitle>Community Board</CardTitle>
              <CardDescription>
                Share stories, ask questions, and connect with fellow plushie lovers.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/community">
                <Button variant="ghost" className="w-full">
                  Join Discussion
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-2 transition-shadow hover:shadow-lg">
            <CardHeader>
              <Heart className="mb-2 h-10 w-10 text-primary" />
              <CardTitle>Gallery</CardTitle>
              <CardDescription>
                Browse beautiful collections and get inspiration for your own displays.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/gallery">
                <Button variant="ghost" className="w-full">
                  View Gallery
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-2 transition-shadow hover:shadow-lg">
            <CardHeader>
              <Calendar className="mb-2 h-10 w-10 text-primary" />
              <CardTitle>Events</CardTitle>
              <CardDescription>
                Discover meetups, conventions, and plushie-related events near you.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/events">
                <Button variant="ghost" className="w-full">
                  See Events
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t bg-muted/30 py-16 md:py-24">
        <div className="container text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">Ready to Join Our Community?</h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
            Sign in to share your stories, create posts, and become part of the Plushie Haven family.
          </p>
          <Link to="/community">
            <Button size="lg">Get Started</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

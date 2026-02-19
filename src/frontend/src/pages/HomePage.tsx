import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, BookOpen } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { useState } from 'react';

export default function HomePage() {
  const [heroImageError, setHeroImageError] = useState(false);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b bg-gradient-to-b from-background to-muted/30">
        <div className="container py-16 md:py-24">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
            <div className="flex flex-col justify-center space-y-6">
              <div className="flex items-center gap-4 mb-2">
                <div className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-primary/30 bg-background shadow-lg ring-4 ring-primary/10 flex-shrink-0">
                  <img
                    src="/assets/generated/plushie-haven-teddy-bow-mark.dim_512x512.png"
                    alt="Plushie Haven teddy bear with bow logo"
                    className="h-full w-full object-cover"
                  />
                </div>
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                  <span className="text-primary">Plushie Haven</span>
                </h1>
              </div>
              <div className="space-y-4">
                <p className="text-lg text-muted-foreground md:text-xl">
                  A cozy community for adult plushie enthusiasts. Discover care tips, connect with fellow collectors,
                  and celebrate the joy of plushie companionship.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link to="/articles">
                  <Button size="lg">Explore Articles</Button>
                </Link>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-2xl border-2 shadow-2xl">
              <div className="aspect-video lg:aspect-auto lg:h-[500px]">
                {!heroImageError ? (
                  <img
                    src="/assets/generated/plushie-haven-hero.dim_1600x900.png"
                    alt="A cozy collection of beloved plushies"
                    className="h-full w-full object-cover"
                    onError={() => setHeroImageError(true)}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10">
                    <div className="flex flex-col items-center gap-4 p-8 text-center">
                      <div className="relative h-32 w-32 overflow-hidden rounded-full border-4 border-primary/30 bg-background shadow-2xl ring-8 ring-primary/10">
                        <img
                          src="/assets/generated/plushie-haven-logo.dim_512x512.png"
                          alt="Plushie Haven logo"
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <p className="text-lg font-medium text-muted-foreground">
                        Welcome to Plushie Haven
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent pointer-events-none"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Plushie Moments Section */}
      <section className="container py-16 md:py-24">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">Plushie Moments</h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Capturing the warmth and joy of plushie companionship in everyday life.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <Card className="overflow-hidden border-2 transition-shadow hover:shadow-lg">
            <div className="aspect-[3/2] overflow-hidden">
              <img
                src="/assets/generated/plushie-haven-home-moments-1.dim_1200x800.png"
                alt="Cozy plushie collection arranged in a warm home setting"
                className="h-full w-full object-cover transition-transform hover:scale-105"
              />
            </div>
            <CardContent className="pt-4">
              <p className="text-center text-sm text-muted-foreground">
                Creating a cozy corner for your beloved companions
              </p>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-2 transition-shadow hover:shadow-lg">
            <div className="aspect-[3/2] overflow-hidden">
              <img
                src="/assets/generated/plushie-haven-home-moments-2.dim_1200x800.png"
                alt="Plushies displayed with care in a comfortable living space"
                className="h-full w-full object-cover transition-transform hover:scale-105"
              />
            </div>
            <CardContent className="pt-4">
              <p className="text-center text-sm text-muted-foreground">
                Thoughtful displays that bring joy to your space
              </p>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-2 transition-shadow hover:shadow-lg">
            <div className="aspect-[3/2] overflow-hidden">
              <img
                src="/assets/generated/plushie-haven-home-moments-3.dim_1200x800.png"
                alt="Cherished plushies in a welcoming home environment"
                className="h-full w-full object-cover transition-transform hover:scale-105"
              />
            </div>
            <CardContent className="pt-4">
              <p className="text-center text-sm text-muted-foreground">
                Celebrating the comfort and companionship they provide
              </p>
            </CardContent>
          </Card>
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

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
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
    </div>
  );
}

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Users, Calendar, BookOpen, Download, AlertCircle } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { useState } from 'react';
import { useStaticAssetAvailability } from '@/hooks/useStaticAssetAvailability';
import { checkStaticAssetAvailability } from '@/utils/staticAssetCheck';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function HomePage() {
  const [heroImageError, setHeroImageError] = useState(false);
  const [downloadError, setDownloadError] = useState(false);
  const { data: isPdfAvailable, isLoading: isPdfCheckLoading } = useStaticAssetAvailability('/assets/coloring-book.pdf');

  const handleDownloadClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Reset any previous error
    setDownloadError(false);
    
    // Verify the PDF is still reachable before allowing navigation
    try {
      const isAvailable = await checkStaticAssetAvailability('/assets/coloring-book.pdf');
      if (!isAvailable) {
        e.preventDefault();
        setDownloadError(true);
      }
    } catch (error) {
      // Catch any unhandled errors to prevent unhandled promise rejections
      e.preventDefault();
      setDownloadError(true);
    }
  };

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
                <Link to="/community">
                  <Button size="lg" variant="outline">
                    Join Community
                  </Button>
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

      {/* Coloring Book Download Section */}
      <section className="container py-16 md:py-24">
        <Card className="border-2 bg-gradient-to-br from-primary/5 via-background to-secondary/5 shadow-xl">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 ring-4 ring-primary/20">
              <Download className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-3xl md:text-4xl">Free Plushie Coloring Book</CardTitle>
            <CardDescription className="text-base md:text-lg mt-2">
              Download our exclusive coloring book featuring adorable plushie designs. Perfect for relaxation and creative expression!
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4 pt-2">
            <p className="text-center text-sm text-muted-foreground max-w-xl">
              Enjoy hours of creative fun with our carefully curated collection of plushie illustrations. Print and color at your leisure.
            </p>
            
            {isPdfCheckLoading ? (
              <Button size="lg" className="gap-2" disabled>
                <Download className="h-5 w-5 animate-pulse" />
                Checking availability...
              </Button>
            ) : isPdfAvailable ? (
              <div className="flex flex-col items-center gap-3 w-full max-w-xl">
                <Button size="lg" className="gap-2" asChild>
                  <a
                    href="/assets/coloring-book.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleDownloadClick}
                  >
                    <Download className="h-5 w-5" />
                    Download Coloring Book (PDF)
                  </a>
                </Button>
                {downloadError && (
                  <Alert variant="destructive" className="w-full">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      The download could not be reached right now. Please try again later or check your internet connection.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 w-full max-w-xl">
                <Button size="lg" className="gap-2" disabled>
                  <Download className="h-5 w-5" />
                  Download Coloring Book (PDF)
                </Button>
                <Alert variant="destructive" className="w-full">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    The coloring book download is temporarily unavailable. Please try again later.
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </CardContent>
        </Card>
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

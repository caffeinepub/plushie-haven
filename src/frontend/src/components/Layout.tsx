import { Outlet } from '@tanstack/react-router';
import Nav from './Nav';
import AuthControls from './AuthControls';
import { Heart } from 'lucide-react';

export default function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b border-primary/30 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/90 shadow-gentle">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <a href="/" className="flex items-center gap-3">
              <div className="relative h-10 w-10 overflow-hidden rounded-full border-2 border-primary/30 bg-white shadow-soft ring-2 ring-primary/20">
                <img
                  src="/assets/generated/plushie-haven-teddy-bow-mark.dim_512x512.png"
                  alt="Plushie Haven - Cute Teddy Bear"
                  className="h-full w-full object-cover"
                />
              </div>
              <span className="text-xl font-bold tracking-tight text-primary-foreground">Plushie Haven</span>
            </a>
            <Nav />
          </div>
          <AuthControls />
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-primary/20 bg-secondary/20 py-8">
        <div className="container">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>© 2026. Built with</span>
              <Heart className="h-4 w-4 fill-accent text-accent" />
              <span>using</span>
              <a
                href="https://caffeine.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary hover:text-accent hover:underline"
              >
                caffeine.ai
              </a>
            </div>
            <div className="flex gap-6 text-sm">
              <a href="/about" className="text-muted-foreground hover:text-accent transition-colors">
                About
              </a>
              <a href="/contact" className="text-muted-foreground hover:text-accent transition-colors">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

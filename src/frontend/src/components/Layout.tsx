import { Outlet } from '@tanstack/react-router';
import Nav from './Nav';
import AuthControls from './AuthControls';
import { Heart } from 'lucide-react';

export default function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <a href="/" className="flex items-center gap-3">
              <img
                src="/assets/generated/plushie-haven-logo.dim_512x512.png"
                alt="Plushie Haven Logo"
                className="h-10 w-10 rounded-lg"
              />
              <span className="text-xl font-bold tracking-tight">Plushie Haven</span>
            </a>
            <Nav />
          </div>
          <AuthControls />
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t bg-muted/30 py-8">
        <div className="container">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>© 2026. Built with</span>
              <Heart className="h-4 w-4 fill-rose-500 text-rose-500" />
              <span>using</span>
              <a
                href="https://caffeine.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-foreground hover:underline"
              >
                caffeine.ai
              </a>
            </div>
            <div className="flex gap-6 text-sm">
              <a href="/about" className="text-muted-foreground hover:text-foreground">
                About
              </a>
              <a href="/contact" className="text-muted-foreground hover:text-foreground">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

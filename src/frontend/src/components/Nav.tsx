import { Link, useRouterState } from '@tanstack/react-router';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { useState } from 'react';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/articles', label: 'Articles' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/community', label: 'Community' },
  { href: '/events', label: 'Events' },
];

export default function Nav() {
  const [open, setOpen] = useState(false);
  const router = useRouterState();
  const currentPath = router.location.pathname;

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex md:gap-1">
        {navLinks.map((link) => {
          const isActive = currentPath === link.href || (link.href !== '/' && currentPath.startsWith(link.href));
          return (
            <Link key={link.href} to={link.href}>
              <Button
                variant={isActive ? 'secondary' : 'ghost'}
                size="sm"
                className="font-medium"
              >
                {link.label}
              </Button>
            </Link>
          );
        })}
      </nav>

      {/* Mobile Navigation */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild className="md:hidden">
          <Button variant="ghost" size="icon">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64">
          <nav className="flex flex-col gap-2 pt-6">
            {navLinks.map((link) => {
              const isActive = currentPath === link.href || (link.href !== '/' && currentPath.startsWith(link.href));
              return (
                <Link key={link.href} to={link.href} onClick={() => setOpen(false)}>
                  <Button
                    variant={isActive ? 'secondary' : 'ghost'}
                    className="w-full justify-start font-medium"
                  >
                    {link.label}
                  </Button>
                </Link>
              );
            })}
          </nav>
        </SheetContent>
      </Sheet>
    </>
  );
}

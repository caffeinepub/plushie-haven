import { Link, useRouterState } from '@tanstack/react-router';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Menu, Shield, Users, BarChart3, Settings, FileText } from 'lucide-react';
import { useState } from 'react';
import { useIsAdmin } from '../hooks/useUserRole';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/articles', label: 'Articles' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/community', label: 'Community' },
  { href: '/events', label: 'Events' },
  { href: '/brands', label: 'Brands' },
  { href: '/pacifier-brands', label: 'Pacifier Brands' },
  { href: '/profiles', label: 'Profiles' },
  { href: '/assistant', label: 'Assistant' },
  { href: '/support', label: 'Support' },
];

const adminLinks = [
  { href: '/admin/users', label: 'User Management', icon: Users },
  { href: '/admin/moderation', label: 'Content Moderation', icon: Shield },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/admin/settings', label: 'System Settings', icon: Settings },
  { href: '/admin/audit-logs', label: 'Audit Logs', icon: FileText },
];

export default function Nav() {
  const [open, setOpen] = useState(false);
  const router = useRouterState();
  const currentPath = router.location.pathname;
  const { isAdmin } = useIsAdmin();

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
                className="font-medium rounded-full shadow-xs hover:shadow-soft transition-all"
              >
                {link.label}
              </Button>
            </Link>
          );
        })}
        
        {/* Admin dropdown for desktop */}
        {isAdmin && (
          <div className="relative group">
            <Button
              variant="ghost"
              size="sm"
              className="font-medium rounded-full shadow-xs hover:shadow-soft transition-all gap-1"
            >
              <Shield className="h-4 w-4" />
              Admin
            </Button>
            <div className="absolute right-0 top-full mt-1 hidden group-hover:block z-50">
              <div className="bg-white border-2 border-primary/20 rounded-xl shadow-soft p-2 min-w-[200px]">
                {adminLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = currentPath === link.href;
                  return (
                    <Link key={link.href} to={link.href}>
                      <Button
                        variant={isActive ? 'secondary' : 'ghost'}
                        size="sm"
                        className="w-full justify-start gap-2 font-medium"
                      >
                        <Icon className="h-4 w-4" />
                        {link.label}
                      </Button>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Mobile Navigation */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild className="md:hidden">
          <Button variant="ghost" size="icon" className="rounded-full">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 bg-white border-primary/30">
          <nav className="flex flex-col gap-2 pt-6">
            {navLinks.map((link) => {
              const isActive = currentPath === link.href || (link.href !== '/' && currentPath.startsWith(link.href));
              return (
                <Link key={link.href} to={link.href} onClick={() => setOpen(false)}>
                  <Button
                    variant={isActive ? 'secondary' : 'ghost'}
                    className="w-full justify-start font-medium rounded-full shadow-xs hover:shadow-soft transition-all"
                  >
                    {link.label}
                  </Button>
                </Link>
              );
            })}
            
            {/* Admin section for mobile */}
            {isAdmin && (
              <>
                <Separator className="my-2" />
                <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">
                  Admin
                </div>
                {adminLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = currentPath === link.href;
                  return (
                    <Link key={link.href} to={link.href} onClick={() => setOpen(false)}>
                      <Button
                        variant={isActive ? 'secondary' : 'ghost'}
                        className="w-full justify-start gap-2 font-medium rounded-full shadow-xs hover:shadow-soft transition-all"
                      >
                        <Icon className="h-4 w-4" />
                        {link.label}
                      </Button>
                    </Link>
                  );
                })}
              </>
            )}
          </nav>
        </SheetContent>
      </Sheet>
    </>
  );
}

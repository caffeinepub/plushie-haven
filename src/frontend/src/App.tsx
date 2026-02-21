import { RouterProvider, createRouter, createRoute, createRootRoute } from '@tanstack/react-router';
import { ThemeProvider } from 'next-themes';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { toast } from 'sonner';
import Layout from './components/Layout';
import AgeGate from './components/AgeGate';
import SessionTimeoutWarning from './components/SessionTimeoutWarning';
import HomePage from './pages/HomePage';
import ArticlesPage from './pages/ArticlesPage';
import ArticleDetailPage from './pages/ArticleDetailPage';
import EventsPage from './pages/EventsPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import PlushieBrandsPage from './pages/PlushieBrandsPage';
import AdultPacifierBrandsPage from './pages/AdultPacifierBrandsPage';
import SupportPage from './pages/SupportPage';
import ProfilesDirectoryPage from './pages/ProfilesDirectoryPage';
import ProfilePage from './pages/ProfilePage';
import PlushieAssistantPage from './pages/PlushieAssistantPage';
import AdminUserManagementPage from './pages/AdminUserManagementPage';
import AnalyticsDashboardPage from './pages/AnalyticsDashboardPage';
import SystemSettingsPage from './pages/SystemSettingsPage';
import AuditLogPage from './pages/AuditLogPage';
import RoleGuard from './components/auth/RoleGuard';
import { UserRole } from './backend';
import { Toaster } from '@/components/ui/sonner';
import { useSessionTimeout } from './hooks/useSessionTimeout';
import { useInternetIdentity } from './hooks/useInternetIdentity';

const rootRoute = createRootRoute({
  component: Layout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
});

const articlesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/articles',
  component: ArticlesPage,
});

const articleDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/articles/$slug',
  component: ArticleDetailPage,
});

const eventsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/events',
  component: EventsPage,
});

const brandsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/brands',
  component: PlushieBrandsPage,
});

const pacifierBrandsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/pacifier-brands',
  component: AdultPacifierBrandsPage,
});

const supportRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/support',
  component: SupportPage,
});

const profilesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profiles',
  component: ProfilesDirectoryPage,
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profiles/$principal',
  component: ProfilePage,
  validateSearch: (search: Record<string, unknown>): { edit?: boolean } => {
    return {
      edit: search.edit === true || search.edit === 'true',
    };
  },
});

const assistantRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/assistant',
  component: PlushieAssistantPage,
});

const aboutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/about',
  component: AboutPage,
});

const contactRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/contact',
  component: ContactPage,
});

// Admin routes with role guards
const adminUserManagementRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/users',
  component: () => (
    <RoleGuard requiredRole={UserRole.admin}>
      <AdminUserManagementPage />
    </RoleGuard>
  ),
});

const analyticsDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/analytics',
  component: () => (
    <RoleGuard requiredRole={UserRole.admin}>
      <AnalyticsDashboardPage />
    </RoleGuard>
  ),
});

const systemSettingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/settings',
  component: () => (
    <RoleGuard requiredRole={UserRole.admin}>
      <SystemSettingsPage />
    </RoleGuard>
  ),
});

const auditLogRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/audit-logs',
  component: () => (
    <RoleGuard requiredRole={UserRole.admin}>
      <AuditLogPage />
    </RoleGuard>
  ),
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  articlesRoute,
  articleDetailRoute,
  eventsRoute,
  brandsRoute,
  pacifierBrandsRoute,
  supportRoute,
  profilesRoute,
  profileRoute,
  assistantRoute,
  aboutRoute,
  contactRoute,
  adminUserManagementRoute,
  analyticsDashboardRoute,
  systemSettingsRoute,
  auditLogRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

function AppContent() {
  const queryClient = useQueryClient();
  const { identity } = useInternetIdentity();
  const { showWarning } = useSessionTimeout();

  // Handle session expiration
  useEffect(() => {
    const checkSession = () => {
      const lastActivity = sessionStorage.getItem('lastActivity');
      if (lastActivity) {
        const elapsed = Date.now() - parseInt(lastActivity, 10);
        const timeout = 30 * 60 * 1000; // 30 minutes
        
        if (elapsed > timeout && identity && !identity.getPrincipal().isAnonymous()) {
          // Session expired
          queryClient.clear();
          toast.error('Your session has expired. Please log in again.');
        }
      }
    };

    checkSession();
  }, [identity, queryClient]);

  return (
    <>
      <RouterProvider router={router} />
      <SessionTimeoutWarning />
      <Toaster />
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <AgeGate>
        <AppContent />
      </AgeGate>
    </ThemeProvider>
  );
}

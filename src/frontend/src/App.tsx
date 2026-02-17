import { RouterProvider, createRouter, createRoute, createRootRoute } from '@tanstack/react-router';
import { ThemeProvider } from 'next-themes';
import Layout from './components/Layout';
import AgeGate from './components/AgeGate';
import HomePage from './pages/HomePage';
import ArticlesPage from './pages/ArticlesPage';
import ArticleDetailPage from './pages/ArticleDetailPage';
import GalleryPage from './pages/GalleryPage';
import CommunityBoardPage from './pages/CommunityBoardPage';
import EventsPage from './pages/EventsPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import PlushieBrandsPage from './pages/PlushieBrandsPage';
import AdultPacifierBrandsPage from './pages/AdultPacifierBrandsPage';
import SupportPage from './pages/SupportPage';
import ProfilesDirectoryPage from './pages/ProfilesDirectoryPage';
import ProfilePage from './pages/ProfilePage';
import PlushieAssistantPage from './pages/PlushieAssistantPage';
import { Toaster } from '@/components/ui/sonner';

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

const galleryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/gallery',
  component: GalleryPage,
});

const communityRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/community',
  component: CommunityBoardPage,
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

const routeTree = rootRoute.addChildren([
  indexRoute,
  articlesRoute,
  articleDetailRoute,
  galleryRoute,
  communityRoute,
  eventsRoute,
  brandsRoute,
  pacifierBrandsRoute,
  supportRoute,
  profilesRoute,
  profileRoute,
  assistantRoute,
  aboutRoute,
  contactRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <AgeGate>
        <RouterProvider router={router} />
        <Toaster />
      </AgeGate>
    </ThemeProvider>
  );
}

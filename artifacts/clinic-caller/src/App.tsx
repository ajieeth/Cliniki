import { type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from "@workspace/clinic-caller-design-system/components/ui/toaster";
import { TooltipProvider } from "@workspace/clinic-caller-design-system/components/ui/tooltip";
import NotFound from '@/pages/not-found';
import {
  Route,
  Switch,
  useLocation,
  Router as WouterRouter,
} from 'wouter';

import { AppLayout } from '@/components/layout/app-layout';
import Dashboard from '@/pages/dashboard';
import CalendarPage from '@/pages/calendar';
import AppointmentsPage from '@/pages/appointments';
import CallCenterPage from '@/pages/call-center';
import EnquiriesPage from '@/pages/enquiries';
import SettingsPage from '@/pages/settings';

const queryClient = new QueryClient();

function Router() {
  return (
    <RoutedErrorBoundary>
      <AppLayout>
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/calendar" component={CalendarPage} />
          <Route path="/appointments" component={AppointmentsPage} />
          <Route path="/call-center" component={CallCenterPage} />
          <Route path="/enquiries" component={EnquiriesPage} />
          <Route path="/settings" component={SettingsPage} />
          <Route component={NotFound} />
        </Switch>
      </AppLayout>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem={false}
        storageKey="clinic-caller-theme"
        disableTransitionOnChange
      >
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;

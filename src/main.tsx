
import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createRouter, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import { SiteHeader } from './components/biosense/SiteHeader';
import './styles.css';

// Routes (I'll write these files next)
import { LandingPage } from './routes/index';
import { DashboardPage } from './routes/dashboard';
import { SimulationPage } from './routes/simulation';

const rootRoute = createRootRoute({
  component: () => (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <Outlet />
    </div>
  ),
});

const indexRoute = createRoute({ getParentRoute: () => rootRoute, path: '/', component: LandingPage });
const dashboardRoute = createRoute({ getParentRoute: () => rootRoute, path: '/dashboard', component: DashboardPage });
const simulationRoute = createRoute({ getParentRoute: () => rootRoute, path: '/simulation', component: SimulationPage });

const routeTree = rootRoute.addChildren([indexRoute, dashboardRoute, simulationRoute]);
const router = createRouter({ routeTree });

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
import {
  createRootRouteWithContext,
  createRoute,
  createRouter,
  Outlet,
} from '@tanstack/react-router';
import { QueryClient } from '@tanstack/react-query';
import { NotFound } from '@components/alerts/NotFound';
import { Dashboard } from '@screens/dashboard/Dashboard';
import { ErrorPage } from '@components/alerts/ErrorPage';
import { Icons } from '@components/Icons';
import { Schedule } from '@screens/schedule/Schedule';

const DashboardRoute = createRoute({
  getParentRoute: () => AuthIndexRoute,
  path: '/',
  loader: () => {
    // https://tanstack.com/router/v1/docs/guide/deferred-data-loading#deferred-data-loading-with-defer-and-await
    // TODO load stats

    // TODO load recent releases

    return {};
  },
  component: Dashboard,
});

const ScheduleRoute = createRoute({
  getParentRoute: () => AuthIndexRoute,
  path: '/schedule',
  component: Schedule,
});

const AuthRoute = createRoute({
  getParentRoute: () => RootRoute,
  id: 'auth',
  component: () => <Outlet />,
});

const AuthIndexRoute = createRoute({
  getParentRoute: () => AuthRoute,
  id: 'auth-index',
  component: () => (
    <div>
      <Outlet />
    </div>
  ),
});

export const RootComponent = () => {
  // const settings = SettingsContext.useValue();
  return (
    <div className="flex flex-col min-h-screen">
      <Outlet />
      {/* {settings.debug ? (
        <>
          <TanStackRouterDevtools />
          <ReactQueryDevtools initialIsOpen={false} />
        </>
      ) : null} */}
    </div>
  );
};

export const RootRoute = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  component: RootComponent,
  notFoundComponent: NotFound,
});

const authIndexTree = AuthIndexRoute.addChildren([
  DashboardRoute,
  ScheduleRoute,
]);
const authTree = AuthRoute.addChildren([authIndexTree]);
const routeTree = RootRoute.addChildren([authTree]);

export const Router = createRouter({
  routeTree,
  defaultPendingComponent: () => (
    <div className="flex grow items-center justify-center col-span-9">
      {/* <RingResizeSpinner className="text-blue-500 size-24" /> */}
      <Icons />
    </div>
  ),
  defaultErrorComponent: () => <ErrorPage />,
  context: {
    queryClient: new QueryClient(),
  },
});

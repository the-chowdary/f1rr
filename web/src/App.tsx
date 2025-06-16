import { RouterProvider } from '@tanstack/react-router';
import { Router } from '@app/routes';

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof Router;
  }
}

export function App() {
  return <RouterProvider router={Router} />;
}

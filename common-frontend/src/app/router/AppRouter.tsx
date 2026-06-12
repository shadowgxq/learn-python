import { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import { HomePage } from '../../pages/home/HomePage';

const SupportDeskPage = lazy(() => import('../../pages/support-desk/SupportDeskPage'));
const TodoPage = lazy(() => import('../../pages/todo/TodoPage'));
const DashboardPage = lazy(() => import('../../pages/dashboard/DashboardPage'));

const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/todo',
    element: (
      <Suspense fallback={null}>
        <TodoPage />
      </Suspense>
    ),
  },
  {
    path: '/support-desk-demo',
    element: (
      <Suspense fallback={null}>
        <SupportDeskPage />
      </Suspense>
    ),
  },
  {
    path: '/dashboard',
    element: (
      <Suspense fallback={null}>
        <DashboardPage />
      </Suspense>
    ),
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} future={{ v7_startTransition: true }} />;
}

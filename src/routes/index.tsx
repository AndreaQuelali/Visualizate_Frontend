import { createBrowserRouter } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        path: '',
        element: <div>Home</div>,
      },
    ],
  },
]);

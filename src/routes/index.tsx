import { createBrowserRouter, Navigate } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import AuthLayout from '../layouts/AuthLayout';
import ProtectedRoute from '../components/ProtectedRoute';
import LoginForm from '../features/auth/components/LoginForm';
import RegisterForm from '../features/auth/components/RegisterForm';
import CheckEmailDetail from '../features/auth/components/CheckEmailDetail';
import ResetPasswordForm from '../features/auth/components/ResetPasswordForm';
import NewPasswordForm from '../features/auth/components/NewPasswordForm';
import VerifyEmailDetail from '../features/auth/components/VerifyEmailDetail';
import ProfileForm from '../features/auth/components/ProfileForm';
import DashboardPage from '../features/dashboard/DashboardPage';

export const router = createBrowserRouter([
  // Rutas de Autenticación
  {
    path: '/',
    element: <AuthLayout />,
    children: [
      { path: 'login', element: <LoginForm /> },
      { path: 'register', element: <RegisterForm /> },
      { path: 'check-email', element: <CheckEmailDetail /> },
      { path: 'reset-password', element: <ResetPasswordForm /> },
      { path: 'new-password', element: <NewPasswordForm /> },
      { path: 'verify-email', element: <VerifyEmailDetail /> },
    ],
  },
  // Rutas Privadas
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <DashboardPage /> },
      {
        path: '',
        element: <AppLayout />,
        children: [{ path: 'profile', element: <ProfileForm /> }],
      },
    ],
  },
  // Redirección wildcard
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);

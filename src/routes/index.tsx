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
import LandingPage from '../features/landing/LandingPage';
import WorkspaceListPage from '../features/workspace/pages/WorkspaceListPage';
import WorkspaceSettingsPage from '../features/workspace/pages/WorkspaceSettingsPage';
import AcceptInvitationPage from '../features/workspace/pages/AcceptInvitationPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
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
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: 'dashboard', element: <DashboardPage /> },
          { path: 'profile', element: <ProfileForm /> },
          { path: 'workspaces', element: <WorkspaceListPage /> },
          {
            path: 'workspaces/accept-invitation',
            element: <AcceptInvitationPage />,
          },
          {
            path: 'workspaces/:id/settings',
            element: <WorkspaceSettingsPage />,
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);

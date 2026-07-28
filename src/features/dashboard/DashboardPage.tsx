import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export default function DashboardPage() {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center gap-6 bg-white dark:bg-background p-6 text-center">
      <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
        SOY DASHBOARD
      </h1>

      <button
        id="btn-logout-dashboard"
        type="button"
        onClick={handleLogout}
        className="inline-flex items-center gap-2 rounded-xl bg-[#5c54e5] px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-[#4b44d4] active:scale-95 transition-all"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1"
          />
        </svg>
        Cerrar sesión
      </button>
    </div>
  );
}

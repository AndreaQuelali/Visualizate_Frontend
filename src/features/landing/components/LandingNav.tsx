import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { navLinks } from '../data/landingContent';
import ThemeToggle from './ThemeToggle';

export default function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  return (
    <nav
      className={`fixed top-0 z-50 h-20 w-full border-b border-outline-variant/60 backdrop-blur-xl transition-all duration-200 ${
        scrolled ? 'bg-card/95 shadow-md' : 'bg-card/80 dark:bg-background/80'
      }`}
    >
      <div className="mx-auto flex h-full max-w-container-max items-center justify-between px-gutter">
        <div className="flex items-center gap-8 md:gap-10">
          <a href="#" className="text-headline-md font-bold text-foreground">
            Visualizate
          </a>
          <div className="hidden items-center gap-6 md:flex md:gap-8">
            {navLinks.map((link, i) => (
              <a
                key={link.href}
                href={link.href}
                className={
                  i === 0
                    ? 'border-b-2 border-primary pb-1 text-body-md font-semibold text-primary'
                    : 'text-body-md font-medium text-muted-foreground transition-colors hover:text-primary'
                }
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <ThemeToggle />
          <Link
            to="/login"
            className="hidden text-body-md font-medium text-muted-foreground transition-colors hover:text-primary md:block"
          >
            Iniciar sesión
          </Link>
          <Link
            to="/register"
            className="rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-md transition-opacity hover:opacity-90 sm:px-6 sm:rounded-full"
          >
            Comenzar gratis
          </Link>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border text-foreground md:hidden"
            aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
            onClick={() => setMobileOpen((o) => !o)}
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-border bg-card px-gutter py-6 md:hidden">
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-body-md font-medium text-foreground"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <Link
              to="/login"
              className="text-body-md font-medium text-primary"
              onClick={() => setMobileOpen(false)}
            >
              Iniciar sesión
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

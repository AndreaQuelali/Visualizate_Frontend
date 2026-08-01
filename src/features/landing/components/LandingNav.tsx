import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { navLinks } from '../data/landingContent';
import ThemeToggle from './ThemeToggle';

export default function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [active, setActive] = useState('#');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  return (
    <nav
      className={`fixed top-0 z-50 h-16 w-full border-b backdrop-blur-xl transition-all duration-200 md:h-20 ${
        scrolled
          ? 'border-border bg-background/90 shadow-sm'
          : 'border-transparent bg-background/70'
      }`}
    >
      <div className="mx-auto flex h-full max-w-container-max items-center justify-between px-gutter">
        <div className="flex items-center gap-8 md:gap-10">
          <a
            href="#"
            className="font-display text-xl font-bold tracking-tight text-foreground"
          >
            Visualizate
          </a>
          <div className="hidden items-center gap-6 md:flex">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setActive(link.href)}
                className={`font-mono text-label-sm uppercase tracking-wider transition-colors ${
                  active === link.href
                    ? 'border-b border-primary pb-0.5 text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <Link
            to="/login"
            className="hidden font-mono text-label-sm uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground md:block"
          >
            Iniciar sesión
          </Link>
          <Link
            to="/register"
            className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 sm:px-5"
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
        <div className="border-t border-border bg-background px-gutter py-6 md:hidden">
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="font-mono text-label-sm uppercase tracking-wider text-foreground"
                onClick={() => {
                  setActive(link.href);
                  setMobileOpen(false);
                }}
              >
                {link.label}
              </a>
            ))}
            <Link
              to="/login"
              className="font-mono text-label-sm uppercase tracking-wider text-primary"
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

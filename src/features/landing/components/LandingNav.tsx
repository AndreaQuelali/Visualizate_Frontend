import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
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
          <Button
            render={<Link to="/login" />}
            nativeButton={false}
            variant="link"
            className="hidden font-mono text-label-sm uppercase tracking-wider text-muted-foreground hover:text-foreground md:inline-flex"
          >
            Iniciar sesión
          </Button>
          <Button
            render={<Link to="/register" />}
            nativeButton={false}
            className="rounded-full px-4 sm:px-5"
          >
            Comenzar gratis
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="rounded-xl md:hidden"
            aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
            onClick={() => setMobileOpen((o) => !o)}
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
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
            <Button
              render={<Link to="/login" />}
              nativeButton={false}
              variant="link"
              className="font-mono text-label-sm uppercase tracking-wider"
              onClick={() => setMobileOpen(false)}
            >
              Iniciar sesión
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}

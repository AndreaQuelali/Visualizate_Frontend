import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useThemeStore, resolveTheme } from '../../../store/themeStore';

export default function ThemeToggle() {
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const resolved = resolveTheme(theme);
  const isDark = resolved === 'dark';

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      className="rounded-xl text-muted-foreground hover:border-primary/40 hover:text-primary"
      onClick={toggleTheme}
      aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
    >
      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
  );
}

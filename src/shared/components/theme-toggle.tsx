import { Moon, Sun } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { useTheme } from './theme-context';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const next = theme === 'dark' ? 'light' : 'dark';

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={`Switch to ${next} theme`}
      onClick={toggleTheme}
    >
      {theme === 'dark' ? <Sun /> : <Moon />}
    </Button>
  );
}

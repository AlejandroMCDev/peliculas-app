import { NavLink, useMatch } from 'react-router';
import { MOVIES_PATH } from '@/features/movies';
import { cn } from '@/shared/lib/utils';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '@/shared/ui/navigation-menu';

const LINKS = [
  { to: '/', label: 'Inicio', end: true },
  { to: MOVIES_PATH, label: 'Películas', end: false },
] as const;

export function MainNav() {
  return (
    <NavigationMenu viewport={false} aria-label="Principal">
      <NavigationMenuList className="gap-1">
        {LINKS.map((link) => (
          <MainNavItem key={link.to} {...link} />
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
}

function MainNavItem({ to, label, end }: { to: string; label: string; end: boolean }) {
  const isActive = useMatch({ path: to, end }) !== null;
  return (
    <NavigationMenuItem>
      <NavigationMenuLink asChild active={isActive}>
        <NavLink
          to={to}
          end={end}
          className={cn(
            'px-3 py-1.5 font-medium text-muted-foreground hover:text-foreground',
            'data-active:bg-transparent data-active:text-primary data-active:hover:bg-muted',
          )}
        >
          {label}
        </NavLink>
      </NavigationMenuLink>
    </NavigationMenuItem>
  );
}

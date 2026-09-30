import { MotionConfig } from 'motion/react';
import { Outlet } from 'react-router';
import { ThemeToggle } from '@/shared/components/theme-toggle';

export function RootLayout() {
  return (
    // reducedMotion="user": animations are skipped when the OS asks for less motion
    <MotionConfig reducedMotion="user">
      <header className="mx-auto flex max-w-xl items-center justify-between px-4 pt-4">
        <span className="font-display text-lg">caso-01</span>
        <ThemeToggle />
      </header>
      <main>
        <Outlet />
      </main>
    </MotionConfig>
  );
}

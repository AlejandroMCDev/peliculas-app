import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import { MainNav } from '@/app/main-nav';

function renderAt(path: string) {
  render(
    <MemoryRouter initialEntries={[path]}>
      <MainNav />
    </MemoryRouter>,
  );
}

describe('MainNav', () => {
  it('links to Inicio and Películas', () => {
    renderAt('/');

    expect(screen.getByRole('link', { name: 'Inicio' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: 'Películas' })).toHaveAttribute('href', '/peliculas');
  });

  it('marks Inicio as the current page only on the home', () => {
    renderAt('/');

    expect(screen.getByRole('link', { name: 'Inicio' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Películas' })).not.toHaveAttribute('aria-current');
  });

  it('keeps Películas current on a movie detail', () => {
    renderAt('/peliculas/550');

    expect(screen.getByRole('link', { name: 'Películas' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Inicio' })).not.toHaveAttribute('aria-current');
  });
});

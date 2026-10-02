import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import { MovieCard } from '@/features/movies/presentation/components/movie-card';
import { aMovie } from '@/test/features/movies/in-memory-movie-repository';

function renderCard(movie = aMovie()) {
  const onPrefetch = vi.fn();
  render(
    <MemoryRouter>
      <MovieCard movie={movie} scope="browse" onPrefetch={onPrefetch} />
    </MemoryRouter>,
  );
  return { onPrefetch };
}

describe('MovieCard', () => {
  it('shows title, year and rating, and links to the detail', () => {
    renderCard(aMovie({ id: 348, title: 'Alien', year: 1979, rating: 8.1 }));

    const link = screen.getByRole('link', { name: /Alien/ });
    expect(link).toHaveAttribute('href', '/peliculas/348');
    expect(screen.getByText('1979')).toBeInTheDocument();
    expect(screen.getByLabelText(/8[.,]1/)).toBeInTheDocument();
  });

  it('shows a placeholder poster and "Sin fecha" when TMDB has neither', () => {
    renderCard(aMovie({ title: 'Inédita', year: null, poster: null }));

    expect(screen.getByRole('img', { name: 'Póster de Inédita' })).toBeInTheDocument();
    expect(screen.getByText('Sin fecha')).toBeInTheDocument();
  });

  it('starts loading the detail on hover', async () => {
    const { onPrefetch } = renderCard(aMovie({ id: 7 }));

    await userEvent.hover(screen.getByRole('link'));

    expect(onPrefetch).toHaveBeenCalledWith(7);
  });
});

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { DEFAULT_FILTERS, type MovieFilters } from '@/features/movies/domain/movie-filters';
import { ActiveFilters } from '@/features/movies/presentation/components/active-filters';

const genres = [
  { id: 27, name: 'Terror' },
  { id: 878, name: 'Ciencia ficción' },
];
const peopleNames = new Map([[10205, 'Sigourney Weaver']]);

function renderFilters(filters: MovieFilters) {
  const onChange = vi.fn();
  const onReset = vi.fn();
  const view = render(
    <ActiveFilters
      filters={filters}
      genres={genres}
      peopleNames={peopleNames}
      onChange={onChange}
      onReset={onReset}
    />,
  );
  return { ...view, onChange, onReset };
}

describe('ActiveFilters', () => {
  it('renders nothing when no filter is active', () => {
    const { container } = renderFilters(DEFAULT_FILTERS);

    expect(container).toBeEmptyDOMElement();
  });

  it('shows a chip per filter with readable names', () => {
    renderFilters({ ...DEFAULT_FILTERS, genres: [27, 878], cast: [10205], minRating: 7 });

    const chips = screen.getByRole('list', { name: 'Filtros activos' });
    expect(chips).toHaveTextContent('Terror');
    expect(chips).toHaveTextContent('Ciencia ficción');
    expect(chips).toHaveTextContent('Sigourney Weaver');
    expect(chips).toHaveTextContent('★ 7+');
  });

  it('removes only the clicked genre', async () => {
    const { onChange } = renderFilters({ ...DEFAULT_FILTERS, genres: [27, 878] });

    await userEvent.click(screen.getByRole('button', { name: 'Quitar filtro Terror' }));

    expect(onChange).toHaveBeenCalledWith({ genres: [878] });
  });

  it('shows only the search chip in search mode', () => {
    renderFilters({ ...DEFAULT_FILTERS, query: 'Alien', genres: [27] });

    expect(screen.getAllByRole('listitem')).toHaveLength(1);
    expect(screen.getByRole('list', { name: 'Filtros activos' })).toHaveTextContent('Alien');
  });

  it('clears everything with "Limpiar todo"', async () => {
    const { onReset } = renderFilters({ ...DEFAULT_FILTERS, director: 578 });

    await userEvent.click(screen.getByRole('button', { name: 'Limpiar todo' }));

    expect(onReset).toHaveBeenCalledOnce();
  });
});

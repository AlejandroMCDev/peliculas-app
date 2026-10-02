import { X } from 'lucide-react';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import type { Genre } from '../../domain/movie';
import { isSearchMode, type MovieFilters } from '../../domain/movie-filters';
import { formatRuntimeRange, formatYearRange } from '../format';

type ActiveFiltersProps = {
  filters: MovieFilters;
  genres: Genre[];
  peopleNames: Map<number, string>;
  onChange: (patch: Partial<MovieFilters>) => void;
  onReset: () => void;
};

type Chip = { key: string; label: string; remove: Partial<MovieFilters> };

export function ActiveFilters({
  filters,
  genres,
  peopleNames,
  onChange,
  onReset,
}: ActiveFiltersProps) {
  const chips = buildChips(filters, genres, peopleNames);
  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <ul className="contents" aria-label="Filtros activos">
        {chips.map((chip) => (
          <li key={chip.key}>
            <Badge variant="outline" className="h-7 gap-1 pr-1 text-sm">
              {chip.label}
              <button
                type="button"
                onClick={() => onChange(chip.remove)}
                aria-label={`Quitar filtro ${chip.label}`}
                className="rounded-full p-0.5 hover:bg-foreground/10 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                <X className="size-3.5" />
              </button>
            </Badge>
          </li>
        ))}
      </ul>
      <Button variant="ghost" size="sm" onClick={onReset}>
        Limpiar todo
      </Button>
    </div>
  );
}

function buildChips(
  filters: MovieFilters,
  genres: Genre[],
  peopleNames: Map<number, string>,
): Chip[] {
  if (isSearchMode(filters)) {
    return [{ key: 'query', label: `“${filters.query}”`, remove: { query: '' } }];
  }

  const chips: Chip[] = [];
  const name = (id: number) => peopleNames.get(id) ?? '…';

  for (const id of filters.genres) {
    const genre = genres.find((item) => item.id === id);
    chips.push({
      key: `genre-${id}`,
      label: genre?.name ?? 'Género',
      remove: { genres: filters.genres.filter((genreId) => genreId !== id) },
    });
  }
  for (const id of filters.cast) {
    chips.push({
      key: `cast-${id}`,
      label: name(id),
      remove: { cast: filters.cast.filter((castId) => castId !== id) },
    });
  }
  if (filters.director !== null) {
    chips.push({
      key: 'director',
      label: `Dir. ${name(filters.director)}`,
      remove: { director: null },
    });
  }
  const years = formatYearRange(filters.yearFrom, filters.yearTo);
  if (years) chips.push({ key: 'years', label: years, remove: { yearFrom: null, yearTo: null } });
  if (filters.minRating > 0) {
    chips.push({ key: 'rating', label: `★ ${filters.minRating}+`, remove: { minRating: 0 } });
  }
  const runtime = formatRuntimeRange(filters.runtimeMin, filters.runtimeMax);
  if (runtime)
    chips.push({ key: 'runtime', label: runtime, remove: { runtimeMin: null, runtimeMax: null } });

  return chips;
}

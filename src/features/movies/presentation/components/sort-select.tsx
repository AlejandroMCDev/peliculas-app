import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { MOVIE_SORTS, type MovieSort } from '../../domain/movie-filters';

const LABELS: Record<MovieSort, string> = {
  popularity: 'Más populares',
  rating: 'Mejor valoradas',
  release: 'Más recientes',
  votes: 'Más votadas',
};

type SortSelectProps = {
  value: MovieSort;
  onChange: (sort: MovieSort) => void;
  disabled?: boolean;
};

export function SortSelect({ value, onChange, disabled }: SortSelectProps) {
  return (
    <Select
      value={value}
      disabled={disabled}
      onValueChange={(next) => {
        const sort = MOVIE_SORTS.find((option) => option === next);
        if (sort) onChange(sort);
      }}
    >
      <SelectTrigger aria-label="Ordenar por" className="h-10 w-full sm:w-48">
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="end">
        {MOVIE_SORTS.map((sort) => (
          <SelectItem key={sort} value={sort}>
            {LABELS[sort]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

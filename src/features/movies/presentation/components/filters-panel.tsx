import { X } from 'lucide-react';
import { useId, useState, type ReactNode } from 'react';
import { Badge } from '@/shared/ui/badge';
import { Label } from '@/shared/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Skeleton } from '@/shared/ui/skeleton';
import { Slider } from '@/shared/ui/slider';
import { ToggleGroup, ToggleGroupItem } from '@/shared/ui/toggle-group';
import type { Genre } from '../../domain/movie';
import { RATING_MAX, RUNTIME_MAX, YEAR_MIN, type MovieFilters } from '../../domain/movie-filters';
import { formatRuntimeRange } from '../format';
import { PersonPicker } from './person-picker';

type FiltersPanelProps = {
  filters: MovieFilters;
  /** undefined while loading; empty when they could not be loaded. */
  genres: Genre[] | undefined;
  peopleNames: Map<number, string>;
  /** Title search is active: TMDB cannot combine it with these filters. */
  disabled: boolean;
  onChange: (patch: Partial<MovieFilters>) => void;
};

const ANY = 'any';
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from(
  { length: CURRENT_YEAR + 1 - YEAR_MIN + 1 },
  (_, i) => CURRENT_YEAR + 1 - i,
);

export function FiltersPanel({
  filters,
  genres,
  peopleNames,
  disabled,
  onChange,
}: FiltersPanelProps) {
  const nameOf = (id: number) => peopleNames.get(id) ?? 'Cargando…';

  return (
    <fieldset disabled={disabled} className="space-y-7 disabled:opacity-50">
      <legend className="sr-only">Filtros de películas</legend>

      <FilterSection title="Géneros">
        {genres?.length === 0 ? (
          <p className="text-sm text-muted-foreground">No se pudieron cargar los géneros.</p>
        ) : genres ? (
          <ToggleGroup
            type="multiple"
            variant="outline"
            size="sm"
            spacing={1.5}
            value={filters.genres.map(String)}
            onValueChange={(values) => onChange({ genres: values.map(Number) })}
            className="w-full flex-wrap justify-start"
            aria-label="Géneros"
          >
            {genres.map((genre) => (
              <ToggleGroupItem
                key={genre.id}
                value={String(genre.id)}
                className="data-[state=on]:border-primary data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
              >
                {genre.name}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        ) : (
          <div className="flex flex-wrap gap-1.5" aria-label="Cargando géneros">
            {Array.from({ length: 12 }, (_, index) => (
              <Skeleton key={index} className="h-7 w-20" />
            ))}
          </div>
        )}
      </FilterSection>

      <FilterSection title="Actores">
        <PersonPicker
          label="Añadir actor o actriz"
          placeholder="Añadir actor o actriz"
          excludeIds={filters.cast}
          disabled={disabled}
          onSelect={(person) => onChange({ cast: [...filters.cast, person.id] })}
        />
        <SelectedPeople
          ids={filters.cast}
          nameOf={nameOf}
          onRemove={(id) => onChange({ cast: filters.cast.filter((castId) => castId !== id) })}
        />
      </FilterSection>

      <FilterSection
        title="Director"
        hint="Incluye otras funciones en el equipo (guion, producción)."
      >
        <PersonPicker
          label="Elegir director"
          placeholder={filters.director ? 'Cambiar director' : 'Elegir director'}
          excludeIds={filters.director ? [filters.director] : []}
          disabled={disabled}
          onSelect={(person) => onChange({ director: person.id })}
        />
        <SelectedPeople
          ids={filters.director ? [filters.director] : []}
          nameOf={nameOf}
          onRemove={() => onChange({ director: null })}
        />
      </FilterSection>

      <FilterSection title="Años">
        <div className="grid grid-cols-2 gap-2">
          <YearSelect
            label="Desde"
            value={filters.yearFrom}
            onChange={(yearFrom) => onChange({ yearFrom })}
          />
          <YearSelect
            label="Hasta"
            value={filters.yearTo}
            onChange={(yearTo) => onChange({ yearTo })}
          />
        </div>
      </FilterSection>

      <RatingFilter value={filters.minRating} onChange={(minRating) => onChange({ minRating })} />

      <RuntimeFilter
        min={filters.runtimeMin}
        max={filters.runtimeMax}
        onChange={(runtimeMin, runtimeMax) => onChange({ runtimeMin, runtimeMax })}
      />
    </fieldset>
  );
}

function FilterSection({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-2.5">
      <h3 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
        {title}
      </h3>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </section>
  );
}

type SelectedPeopleProps = {
  ids: number[];
  nameOf: (id: number) => string;
  onRemove: (id: number) => void;
};

function SelectedPeople({ ids, nameOf, onRemove }: SelectedPeopleProps) {
  if (ids.length === 0) return null;
  return (
    <ul className="flex flex-wrap gap-1.5">
      {ids.map((id) => (
        <li key={id}>
          <Badge variant="secondary" className="h-7 gap-1 pr-1 text-sm">
            {nameOf(id)}
            <button
              type="button"
              onClick={() => onRemove(id)}
              aria-label={`Quitar ${nameOf(id)}`}
              className="rounded-full p-0.5 hover:bg-foreground/10 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              <X className="size-3.5" />
            </button>
          </Badge>
        </li>
      ))}
    </ul>
  );
}

type YearSelectProps = {
  label: string;
  value: number | null;
  onChange: (year: number | null) => void;
};

function YearSelect({ label, value, onChange }: YearSelectProps) {
  const id = useId();
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs font-normal text-muted-foreground">
        {label}
      </Label>
      <Select
        value={value === null ? ANY : String(value)}
        onValueChange={(next) => onChange(next === ANY ? null : Number(next))}
      >
        <SelectTrigger id={id} className="w-full tabular-nums">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="max-h-72">
          <SelectItem value={ANY}>Todos</SelectItem>
          {YEARS.map((year) => (
            <SelectItem key={year} value={String(year)}>
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

// Sliders keep a local draft while dragging and only write the URL when the user lets go
// (onValueCommit): one request per decision, not one per pixel.

function RatingFilter({ value, onChange }: { value: number; onChange: (rating: number) => void }) {
  const [draft, setDraft] = useState<number | null>(null);
  const shown = draft ?? value;

  return (
    <FilterSection title="Calificación mínima">
      <div className="flex items-center justify-between text-sm">
        <span id="rating-label">{shown > 0 ? `★ ${shown.toFixed(1)} o más` : 'Cualquiera'}</span>
      </div>
      <Slider
        aria-labelledby="rating-label"
        min={0}
        max={RATING_MAX}
        step={0.5}
        value={[shown]}
        onValueChange={([next]) => setDraft(next ?? 0)}
        onValueCommit={([next]) => {
          setDraft(null);
          onChange(next ?? 0);
        }}
      />
    </FilterSection>
  );
}

type RuntimeFilterProps = {
  min: number | null;
  max: number | null;
  onChange: (min: number | null, max: number | null) => void;
};

function RuntimeFilter({ min, max, onChange }: RuntimeFilterProps) {
  const [draft, setDraft] = useState<number[] | null>(null);
  const shown = draft ?? [min ?? 0, max ?? RUNTIME_MAX];
  const [low = 0, high = RUNTIME_MAX] = shown;
  // The slider ends mean "no limit".
  const toFilter = (lo: number, hi: number) =>
    [lo > 0 ? lo : null, hi < RUNTIME_MAX ? hi : null] as const;
  const label = formatRuntimeRange(...toFilter(low, high)) ?? 'Cualquier duración';

  return (
    <FilterSection title="Duración">
      <p id="runtime-label" className="text-sm">
        {label}
      </p>
      <Slider
        aria-labelledby="runtime-label"
        min={0}
        max={RUNTIME_MAX}
        step={10}
        minStepsBetweenThumbs={1}
        value={shown}
        onValueChange={setDraft}
        onValueCommit={([lo = 0, hi = RUNTIME_MAX]) => {
          setDraft(null);
          onChange(...toFilter(lo, hi));
        }}
      />
    </FilterSection>
  );
}

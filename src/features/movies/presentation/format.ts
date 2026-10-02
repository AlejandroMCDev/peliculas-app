export function formatRating(rating: number): string {
  return rating.toFixed(1);
}

export function formatVotes(count: number): string {
  return `${new Intl.NumberFormat('es-MX', { notation: 'compact' }).format(count)} votos`;
}

export function formatRuntime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `${rest} min`;
  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`;
}

export function formatMoney(amount: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(amount);
}

const DEPARTMENTS: Record<string, string> = {
  Acting: 'Actuación',
  Directing: 'Dirección',
  Writing: 'Guion',
  Production: 'Producción',
  Camera: 'Fotografía',
  Editing: 'Montaje',
  Sound: 'Sonido',
};

export function formatDepartment(department: string | null): string | null {
  return department ? (DEPARTMENTS[department] ?? department) : null;
}

export function formatYearRange(from: number | null, to: number | null): string | null {
  if (from !== null && to !== null) return from === to ? `${from}` : `${from}–${to}`;
  if (from !== null) return `Desde ${from}`;
  if (to !== null) return `Hasta ${to}`;
  return null;
}

export function formatRuntimeRange(min: number | null, max: number | null): string | null {
  if (min !== null && max !== null) return `${min}–${max} min`;
  if (min !== null) return `Más de ${min} min`;
  if (max !== null) return `Menos de ${max} min`;
  return null;
}

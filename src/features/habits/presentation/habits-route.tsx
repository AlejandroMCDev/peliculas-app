// Connects the screen to React Router
import { useFetcher, useLoaderData, useSearchParams } from 'react-router';
import type { habitsAction, habitsLoader } from './habits-route-data';
import { HabitsScreen } from './habits-screen';

export function HabitsRoute() {
  const { habits, filter, today } = useLoaderData<typeof habitsLoader>();
  const fetcher = useFetcher<typeof habitsAction>();
  const [, setSearchParams] = useSearchParams();

  return (
    <HabitsScreen
      habits={habits}
      filter={filter}
      today={today}
      error={fetcher.data?.error}
      isSubmitting={fetcher.state !== 'idle'}
      onCreate={(input) => void fetcher.submit({ intent: 'create', ...input }, { method: 'post' })}
      onToggle={(id) => void fetcher.submit({ intent: 'toggle', id }, { method: 'post' })}
      onArchive={(id) => void fetcher.submit({ intent: 'archive', id }, { method: 'post' })}
      onFilterChange={(next) => setSearchParams(next === 'all' ? {} : { filter: next })}
    />
  );
}

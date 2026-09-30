import { zodResolver } from '@hookform/resolvers/zod';
import { Archive } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useForm } from 'react-hook-form';
import { Button } from '@/shared/ui/button';
import { Checkbox } from '@/shared/ui/checkbox';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { cn } from '@/shared/lib/utils';
import {
  currentStreak,
  filterHabits,
  isDoneInPeriod,
  lastDays,
  newHabitSchema,
  pendingCount,
  type Habit,
  type HabitFilter,
  type NewHabit,
} from '../domain/habit';

type HabitsScreenProps = {
  habits: Habit[];
  filter: HabitFilter;
  today: Date;
  error?: string;
  isSubmitting: boolean;
  onCreate: (input: NewHabit) => void;
  onToggle: (id: string) => void;
  onArchive: (id: string) => void;
  onFilterChange: (filter: HabitFilter) => void;
};

const FILTERS: { value: HabitFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
];

export function HabitsScreen({
  habits,
  filter,
  today,
  error,
  isSubmitting,
  onCreate,
  onToggle,
  onArchive,
  onFilterChange,
}: HabitsScreenProps) {
  const form = useForm<NewHabit>({
    resolver: zodResolver(newHabitSchema),
    defaultValues: { name: '', frequency: 'daily' },
  });
  const visible = filterHabits(habits, filter, today);
  const pending = pendingCount(habits, today);

  return (
    <section className="mx-auto max-w-xl space-y-8 px-4 py-10">
      <header className="space-y-1">
        <h1 className="font-display text-4xl tracking-tight">Habits</h1>
        <p className="text-muted-foreground">
          {pending === 0 ? 'Everything is done for now.' : `${pending} pending`}
        </p>
      </header>

      <form
        noValidate
        onSubmit={form.handleSubmit((values) => {
          onCreate(values);
          form.reset();
        })}
        className="space-y-3"
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
          <div className="flex-1 space-y-1">
            <Label htmlFor="habit-name" className="sr-only">
              New habit
            </Label>
            <Input
              id="habit-name"
              placeholder="What do you want to repeat?"
              aria-invalid={form.formState.errors.name ? true : undefined}
              aria-describedby={form.formState.errors.name ? 'habit-name-error' : undefined}
              {...form.register('name')}
            />
            {form.formState.errors.name && (
              <p id="habit-name-error" className="text-sm text-destructive">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>
          <Label htmlFor="habit-frequency" className="sr-only">
            Frequency
          </Label>
          <select
            id="habit-frequency"
            className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            {...form.register('frequency')}
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
          </select>
          <Button type="submit" disabled={isSubmitting}>
            Add
          </Button>
        </div>
      </form>

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      <div role="group" aria-label="Filter habits" className="flex gap-2">
        {FILTERS.map(({ value, label }) => (
          <Button
            key={value}
            type="button"
            size="sm"
            variant={filter === value ? 'default' : 'outline'}
            aria-pressed={filter === value}
            onClick={() => onFilterChange(value)}
          >
            {label}
          </Button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="text-muted-foreground">
          {filter === 'pending'
            ? 'Nothing pending. Nice work.'
            : 'No habits yet. Add your first one above.'}
        </p>
      ) : (
        <ul className="divide-y rounded-lg border bg-card">
          <AnimatePresence initial={false}>
            {visible.map((habit) => (
              <HabitRow
                key={habit.id}
                habit={habit}
                today={today}
                onToggle={onToggle}
                onArchive={onArchive}
              />
            ))}
          </AnimatePresence>
        </ul>
      )}
    </section>
  );
}

type HabitRowProps = {
  habit: Habit;
  today: Date;
  onToggle: (id: string) => void;
  onArchive: (id: string) => void;
};

function HabitRow({ habit, today, onToggle, onArchive }: HabitRowProps) {
  const done = isDoneInPeriod(habit, today);
  const streak = currentStreak(habit, today);
  const unit = habit.frequency === 'daily' ? 'day' : 'week';
  const completed = new Set(habit.completedDates);

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="flex items-center gap-3 p-4"
    >
      <Checkbox id={habit.id} checked={done} onCheckedChange={() => onToggle(habit.id)} />
      <div className="min-w-0 flex-1">
        <label
          htmlFor={habit.id}
          className={cn('block truncate font-medium', done && 'text-muted-foreground line-through')}
        >
          {habit.name}
        </label>
        <p className="text-sm text-muted-foreground">
          <span className="capitalize">{habit.frequency}</span> ·{' '}
          <span className="tabular-nums">
            {streak} {unit}
            {streak === 1 ? '' : 's'}
          </span>{' '}
          streak
        </p>
      </div>
      <div aria-hidden className="hidden gap-1 sm:flex">
        {lastDays(today, 7).map((dayKey) => (
          <span
            key={dayKey}
            className={cn('size-2 rounded-full', completed.has(dayKey) ? 'bg-primary' : 'bg-muted')}
          />
        ))}
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={`Archive ${habit.name}`}
        onClick={() => onArchive(habit.id)}
      >
        <Archive />
      </Button>
    </motion.li>
  );
}

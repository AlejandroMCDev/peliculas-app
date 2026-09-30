import { addDays, format, parseISO, startOfWeek, subDays, subWeeks } from 'date-fns';
import { z } from 'zod';

export const frequencySchema = z.enum(['daily', 'weekly']);
export type Frequency = z.infer<typeof frequencySchema>;

// A day is stored as a "yyyy-MM-dd" key: no time zones, easy to compare and to serialize.
const dayKeySchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const habitSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1, 'Name is required').max(60),
  frequency: frequencySchema,
  completedDates: z.array(dayKeySchema),
  archived: z.boolean(),
  createdAt: z.coerce.date(),
});
export type Habit = z.infer<typeof habitSchema>;

export const newHabitSchema = habitSchema.pick({ name: true, frequency: true });
export type NewHabit = z.infer<typeof newHabitSchema>;

export const habitFilterSchema = z.enum(['all', 'pending']);
export type HabitFilter = z.infer<typeof habitFilterSchema>;

// Business rules are pure functions: easy to read, trivial to test.
const WEEK_OPTIONS = { weekStartsOn: 1 } as const;

export function toDayKey(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

function weekKey(date: Date): string {
  return toDayKey(startOfWeek(date, WEEK_OPTIONS));
}

function isInSamePeriod(frequency: Frequency, dayKey: string, today: Date): boolean {
  return frequency === 'daily'
    ? dayKey === toDayKey(today)
    : weekKey(parseISO(dayKey)) === weekKey(today);
}

/** A daily habit is done on the day; a weekly habit is done once it was completed this week. */
export function isDoneInPeriod(habit: Habit, today: Date): boolean {
  return habit.completedDates.some((dayKey) => isInSamePeriod(habit.frequency, dayKey, today));
}

/** Marks the current period as done (adds today), or undoes it (removes that period's dates). */
export function toggleCompletion(habit: Habit, today: Date): Habit {
  const completedDates = isDoneInPeriod(habit, today)
    ? habit.completedDates.filter((dayKey) => !isInSamePeriod(habit.frequency, dayKey, today))
    : [...habit.completedDates, toDayKey(today)];
  return { ...habit, completedDates };
}

/** Consecutive periods completed. The current period does not break the streak while it is open. */
export function currentStreak(habit: Habit, today: Date): number {
  const step = habit.frequency === 'daily' ? subDays : subWeeks;
  const keyOf = habit.frequency === 'daily' ? toDayKey : weekKey;
  const done = new Set(habit.completedDates.map((dayKey) => keyOf(parseISO(dayKey))));

  let cursor = done.has(keyOf(today)) ? today : step(today, 1);
  let streak = 0;
  while (done.has(keyOf(cursor))) {
    streak += 1;
    cursor = step(cursor, 1);
  }
  return streak;
}

export function filterHabits(habits: readonly Habit[], filter: HabitFilter, today: Date): Habit[] {
  const active = habits.filter((habit) => !habit.archived);
  return filter === 'pending' ? active.filter((habit) => !isDoneInPeriod(habit, today)) : active;
}

export function pendingCount(habits: readonly Habit[], today: Date): number {
  return filterHabits(habits, 'pending', today).length;
}

/** The last `count` day keys ending today, oldest first (used for the week strip). */
export function lastDays(today: Date, count: number): string[] {
  return Array.from({ length: count }, (_, index) => toDayKey(addDays(today, index - count + 1)));
}

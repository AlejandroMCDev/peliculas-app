import type { Habit, NewHabit } from './habit';

// The port: what the application needs, not how it is done.
export interface HabitRepository {
  list(): Promise<Habit[]>;
  get(id: string): Promise<Habit>;
  create(input: NewHabit): Promise<Habit>;
  save(habit: Habit): Promise<Habit>;
}

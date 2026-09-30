import type { Habit } from '../domain/habit';
import type { HabitRepository } from '../domain/habit-repository';

export function listHabits(repository: HabitRepository): Promise<Habit[]> {
  return repository.list();
}

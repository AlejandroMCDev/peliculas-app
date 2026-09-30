import type { Habit } from '../domain/habit';
import type { HabitRepository } from '../domain/habit-repository';

export async function archiveHabit(repository: HabitRepository, id: string): Promise<Habit> {
  const habit = await repository.get(id);
  return repository.save({ ...habit, archived: true });
}

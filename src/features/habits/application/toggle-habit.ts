import { toggleCompletion, type Habit } from '../domain/habit';
import type { HabitRepository } from '../domain/habit-repository';

export async function toggleHabit(
  repository: HabitRepository,
  id: string,
  today: Date = new Date(),
): Promise<Habit> {
  const habit = await repository.get(id);
  return repository.save(toggleCompletion(habit, today));
}

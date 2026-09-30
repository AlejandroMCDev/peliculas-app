import { AppError } from '@/shared/lib/errors';
import type { Habit } from '../domain/habit';
import type { HabitRepository } from '../domain/habit-repository';

// Lets you build the whole UI before a backend exists, and powers the tests.
export function createInMemoryHabitRepository(seed: Habit[] = []): HabitRepository {
  let habits = [...seed];

  async function get(id: string): Promise<Habit> {
    const habit = habits.find((item) => item.id === id);
    if (!habit) throw new AppError('NOT_FOUND', `Habit ${id} not found`);
    return habit;
  }

  return {
    async list() {
      return [...habits].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    },
    get,
    async create(input) {
      const habit: Habit = {
        id: crypto.randomUUID(),
        name: input.name,
        frequency: input.frequency,
        completedDates: [],
        archived: false,
        createdAt: new Date(),
      };
      habits = [habit, ...habits];
      return habit;
    },
    async save(habit) {
      await get(habit.id);
      habits = habits.map((item) => (item.id === habit.id ? habit : item));
      return habit;
    },
  };
}

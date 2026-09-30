import { z } from 'zod';
import { AppError } from '@/shared/lib/errors';
import { newHabitSchema, type Habit } from '../domain/habit';
import type { HabitRepository } from '../domain/habit-repository';

export async function createHabit(repository: HabitRepository, input: unknown): Promise<Habit> {
  const parsed = newHabitSchema.safeParse(input);
  if (!parsed.success) throw new AppError('VALIDATION', z.prettifyError(parsed.error));
  return repository.create(parsed.data);
}

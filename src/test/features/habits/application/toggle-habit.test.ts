import { describe, expect, it } from 'vitest';
import { createInMemoryHabitRepository } from '@/features/habits/infrastructure/in-memory-habit-repository';
import { createHabit } from '@/features/habits/application/create-habit';
import { toggleHabit } from '@/features/habits/application/toggle-habit';

const today = new Date(2026, 8, 30);

describe('toggleHabit', () => {
  it('marks the habit done today and undoes it on the second call', async () => {
    const repository = createInMemoryHabitRepository();
    const { id } = await createHabit(repository, { name: 'Read', frequency: 'daily' });

    expect((await toggleHabit(repository, id, today)).completedDates).toEqual(['2026-09-30']);
    expect((await toggleHabit(repository, id, today)).completedDates).toEqual([]);
  });

  it('fails with NOT_FOUND for an unknown habit', async () => {
    const repository = createInMemoryHabitRepository();
    await expect(toggleHabit(repository, 'missing', today)).rejects.toMatchObject({
      code: 'NOT_FOUND',
    });
  });
});

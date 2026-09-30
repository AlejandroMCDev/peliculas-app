import { describe, expect, it } from 'vitest';
import { createInMemoryHabitRepository } from '@/features/habits/infrastructure/in-memory-habit-repository';
import { createHabit } from '@/features/habits/application/create-habit';

describe('createHabit', () => {
  it('adds an active habit with no completions', async () => {
    const repository = createInMemoryHabitRepository();
    const habit = await createHabit(repository, { name: 'Stretch', frequency: 'daily' });
    expect(habit).toMatchObject({ name: 'Stretch', archived: false, completedDates: [] });
    expect(await repository.list()).toHaveLength(1);
  });

  it('rejects a blank name', async () => {
    const repository = createInMemoryHabitRepository();
    await expect(
      createHabit(repository, { name: '   ', frequency: 'daily' }),
    ).rejects.toMatchObject({ code: 'VALIDATION' });
  });

  it('rejects an unknown frequency', async () => {
    const repository = createInMemoryHabitRepository();
    await expect(
      createHabit(repository, { name: 'Stretch', frequency: 'monthly' }),
    ).rejects.toMatchObject({ code: 'VALIDATION' });
  });
});

import { describe, expect, it } from 'vitest';
import { archiveHabit } from '@/features/habits/application/archive-habit';
import { createHabit } from '@/features/habits/application/create-habit';
import { createInMemoryHabitRepository } from '@/features/habits/infrastructure/in-memory-habit-repository';

describe('archiveHabit', () => {
  it('flags the habit as archived without deleting it', async () => {
    const repository = createInMemoryHabitRepository();
    const { id } = await createHabit(repository, { name: 'Read', frequency: 'daily' });

    await archiveHabit(repository, id);

    const [habit] = await repository.list();
    expect(habit).toMatchObject({ id, archived: true });
  });

  it('fails with NOT_FOUND for an unknown habit', async () => {
    const repository = createInMemoryHabitRepository();
    await expect(archiveHabit(repository, 'missing')).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });
});

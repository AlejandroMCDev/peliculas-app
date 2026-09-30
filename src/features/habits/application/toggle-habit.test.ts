import { describe, expect, it } from 'vitest';
import { createInMemoryHabitRepository } from '../infrastructure/in-memory-habit-repository';
import { createHabit } from './create-habit';
import { archiveHabit } from './archive-habit';
import { toggleHabit } from './toggle-habit';

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

describe('archiveHabit', () => {
  it('flags the habit as archived without deleting it', async () => {
    const repository = createInMemoryHabitRepository();
    const { id } = await createHabit(repository, { name: 'Read', frequency: 'daily' });

    await archiveHabit(repository, id);

    const [habit] = await repository.list();
    expect(habit).toMatchObject({ id, archived: true });
  });
});

import { subDays } from 'date-fns';
import { toDayKey, type Habit } from './domain/habit';
import type { HabitRepository } from './domain/habit-repository';
import { createInMemoryHabitRepository } from './infrastructure/in-memory-habit-repository';

// The only file that knows which implementation is used.
// To use a real API later: write an HTTP repository in infrastructure/ and return it here.
const now = new Date();
const daysAgo = (count: number) => toDayKey(subDays(now, count));

const seed: Habit[] = [
  {
    id: 'seed-1',
    name: 'Read for 20 minutes',
    frequency: 'daily',
    completedDates: [daysAgo(3), daysAgo(2), daysAgo(1)],
    archived: false,
    createdAt: subDays(now, 10),
  },
  {
    id: 'seed-2',
    name: 'Long run',
    frequency: 'weekly',
    completedDates: [daysAgo(8)],
    archived: false,
    createdAt: subDays(now, 9),
  },
  {
    id: 'seed-3',
    name: 'Write in my journal',
    frequency: 'daily',
    completedDates: [],
    archived: false,
    createdAt: subDays(now, 5),
  },
];

export const habitRepository: HabitRepository = createInMemoryHabitRepository(seed);

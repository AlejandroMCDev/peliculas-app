import { describe, expect, it } from 'vitest';
import { currentStreak, filterHabits, isDoneInPeriod, toggleCompletion, type Habit } from './habit';

// Wednesday 2026-09-30 (weeks start on Monday)
const today = new Date(2026, 8, 30);

function habit(overrides: Partial<Habit> = {}): Habit {
  return {
    id: 'h1',
    name: 'Read',
    frequency: 'daily',
    completedDates: [],
    archived: false,
    createdAt: new Date(2026, 0, 1),
    ...overrides,
  };
}

describe('isDoneInPeriod', () => {
  it('is done for a daily habit only when completed today', () => {
    expect(isDoneInPeriod(habit({ completedDates: ['2026-09-29'] }), today)).toBe(false);
    expect(isDoneInPeriod(habit({ completedDates: ['2026-09-30'] }), today)).toBe(true);
  });

  it('is done for a weekly habit when completed any day this week', () => {
    const weekly = habit({ frequency: 'weekly', completedDates: ['2026-09-28'] });
    expect(isDoneInPeriod(weekly, today)).toBe(true);
    expect(isDoneInPeriod({ ...weekly, completedDates: ['2026-09-27'] }, today)).toBe(false);
  });
});

describe('toggleCompletion', () => {
  it('adds today and removes it again', () => {
    const done = toggleCompletion(habit(), today);
    expect(done.completedDates).toEqual(['2026-09-30']);
    expect(toggleCompletion(done, today).completedDates).toEqual([]);
  });

  it('undoing a weekly habit removes every date of that week but keeps older weeks', () => {
    const weekly = habit({ frequency: 'weekly', completedDates: ['2026-09-21', '2026-09-28'] });
    expect(toggleCompletion(weekly, today).completedDates).toEqual(['2026-09-21']);
  });
});

describe('currentStreak', () => {
  it('counts consecutive days ending today', () => {
    const dates = ['2026-09-28', '2026-09-29', '2026-09-30'];
    expect(currentStreak(habit({ completedDates: dates }), today)).toBe(3);
  });

  it('keeps the streak alive while today is still open', () => {
    expect(currentStreak(habit({ completedDates: ['2026-09-28', '2026-09-29'] }), today)).toBe(2);
  });

  it('breaks after a missed day', () => {
    expect(currentStreak(habit({ completedDates: ['2026-09-27', '2026-09-28'] }), today)).toBe(0);
  });

  it('counts consecutive weeks for a weekly habit', () => {
    const weekly = habit({
      frequency: 'weekly',
      completedDates: ['2026-09-15', '2026-09-22', '2026-09-29'],
    });
    expect(currentStreak(weekly, today)).toBe(3);
  });
});

describe('filterHabits', () => {
  const pendingHabit = habit({ id: 'a' });
  const doneHabit = habit({ id: 'b', completedDates: ['2026-09-30'] });
  const archivedHabit = habit({ id: 'c', archived: true });
  const all = [pendingHabit, doneHabit, archivedHabit];

  it('hides archived habits', () => {
    expect(filterHabits(all, 'all', today).map((item) => item.id)).toEqual(['a', 'b']);
  });

  it('keeps only pending habits', () => {
    expect(filterHabits(all, 'pending', today).map((item) => item.id)).toEqual(['a']);
  });
});

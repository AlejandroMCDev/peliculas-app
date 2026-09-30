import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { Habit } from '../domain/habit';
import { HabitsScreen } from './habits-screen';

const today = new Date(2026, 8, 30);

const habits: Habit[] = [
  {
    id: 'h1',
    name: 'Read',
    frequency: 'daily',
    completedDates: ['2026-09-29', '2026-09-30'],
    archived: false,
    createdAt: new Date(2026, 0, 1),
  },
  {
    id: 'h2',
    name: 'Run',
    frequency: 'weekly',
    completedDates: [],
    archived: false,
    createdAt: new Date(2026, 0, 2),
  },
];

function setup(overrides: Partial<Parameters<typeof HabitsScreen>[0]> = {}) {
  const props = {
    habits,
    filter: 'all' as const,
    today,
    isSubmitting: false,
    onCreate: vi.fn(),
    onToggle: vi.fn(),
    onArchive: vi.fn(),
    onFilterChange: vi.fn(),
    ...overrides,
  };
  render(<HabitsScreen {...props} />);
  return props;
}

describe('HabitsScreen', () => {
  it('shows an empty state', () => {
    setup({ habits: [] });
    expect(screen.getByText(/no habits yet/i)).toBeInTheDocument();
  });

  it('shows the pending count and each streak', () => {
    setup();
    expect(screen.getByText('1 pending')).toBeInTheDocument();
    expect(screen.getByText(/2 days/)).toBeInTheDocument();
  });

  it('submits a valid new habit', async () => {
    const user = userEvent.setup();
    const { onCreate } = setup();

    await user.type(screen.getByRole('textbox', { name: 'New habit' }), 'Meditate');
    await user.selectOptions(screen.getByRole('combobox', { name: 'Frequency' }), 'weekly');
    await user.click(screen.getByRole('button', { name: 'Add' }));

    expect(onCreate).toHaveBeenCalledWith({ name: 'Meditate', frequency: 'weekly' });
  });

  it('shows a validation error and does not submit a blank name', async () => {
    const user = userEvent.setup();
    const { onCreate } = setup();

    await user.click(screen.getByRole('button', { name: 'Add' }));

    expect(await screen.findByText('Name is required')).toBeInTheDocument();
    expect(onCreate).not.toHaveBeenCalled();
  });

  it('toggles and archives a habit', async () => {
    const user = userEvent.setup();
    const { onToggle, onArchive } = setup();

    await user.click(screen.getByRole('checkbox', { name: 'Run' }));
    await user.click(screen.getByRole('button', { name: 'Archive Read' }));

    expect(onToggle).toHaveBeenCalledWith('h2');
    expect(onArchive).toHaveBeenCalledWith('h1');
  });

  it('lists only pending habits and reports filter changes', async () => {
    const user = userEvent.setup();
    const { onFilterChange } = setup({ filter: 'pending' });

    expect(screen.queryByRole('checkbox', { name: 'Read' })).not.toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Run' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'All' }));
    expect(onFilterChange).toHaveBeenCalledWith('all');
  });

  it('announces an action error', () => {
    setup({ error: 'Something failed' });
    expect(screen.getByRole('alert')).toHaveTextContent('Something failed');
  });
});

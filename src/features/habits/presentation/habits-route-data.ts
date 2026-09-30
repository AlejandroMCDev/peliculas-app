// React Router loader and action
import type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router';
import { isAppError } from '@/shared/lib/errors';
import { archiveHabit } from '../application/archive-habit';
import { createHabit } from '../application/create-habit';
import { listHabits } from '../application/list-habits';
import { toggleHabit } from '../application/toggle-habit';
import { habitFilterSchema } from '../domain/habit';
import { habitRepository } from '../habits.composition';

export async function habitsLoader({ request }: LoaderFunctionArgs) {
  const filter = habitFilterSchema
    .catch('all')
    .parse(new URL(request.url).searchParams.get('filter'));
  return { habits: await listHabits(habitRepository), filter, today: new Date() };
}

export async function habitsAction({ request }: ActionFunctionArgs) {
  const form = await request.formData();
  try {
    switch (form.get('intent')) {
      case 'create':
        await createHabit(habitRepository, {
          name: form.get('name'),
          frequency: form.get('frequency'),
        });
        break;
      case 'toggle':
        await toggleHabit(habitRepository, String(form.get('id')));
        break;
      case 'archive':
        await archiveHabit(habitRepository, String(form.get('id')));
        break;
    }
    return { error: undefined };
  } catch (error) {
    if (isAppError(error, 'VALIDATION')) return { error: error.message };
    throw error; // unexpected errors go to the route's error boundary
  }
}

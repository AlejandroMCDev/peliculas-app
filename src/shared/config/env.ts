import { z } from 'zod';

const parsed = z.object({ VITE_TMDB_TOKEN: z.string().trim().min(1) }).safeParse(import.meta.env);

export const env = { tmdbToken: parsed.success ? parsed.data.VITE_TMDB_TOKEN : undefined };

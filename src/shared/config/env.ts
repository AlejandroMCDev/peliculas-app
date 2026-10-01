import { z } from 'zod';

// Every environment variable goes through here; no other file reads import.meta.env.
// VITE_ variables end up in the browser bundle: they are PUBLIC. The TMDB read token is
// read-only and free, which is acceptable for a study project (a server proxy is the next step).
const parsed = z.object({ VITE_TMDB_TOKEN: z.string().trim().min(1) }).safeParse(import.meta.env);

// A missing token does not crash the app: requests fail with a CONFIG error the UI explains.
export const env = { tmdbToken: parsed.success ? parsed.data.VITE_TMDB_TOKEN : undefined };

import { z } from 'zod';

// TMDB's response shapes. Optional/nullable fields are common, so each one has a safe fallback:
// a single odd movie must not break a whole page of results.

const nullablePath = z.string().nullish().catch(null);

export const movieDtoSchema = z.object({
  id: z.number(),
  title: z.string(),
  release_date: z.string().nullish().catch(null),
  poster_path: nullablePath,
  vote_average: z.number().catch(0),
  vote_count: z.number().catch(0),
  backdrop_path: nullablePath,
  overview: z.string().nullish().catch(null),
});
export type MovieDto = z.infer<typeof movieDtoSchema>;

export const pageDtoSchema = <T extends z.ZodType>(item: T) =>
  z.object({
    page: z.number(),
    total_pages: z.number(),
    results: z.array(item),
  });

export const genreDtoSchema = z.object({ id: z.number(), name: z.string() });
export const genreListDtoSchema = z.object({ genres: z.array(genreDtoSchema) });

export const personDtoSchema = z.object({
  id: z.number(),
  name: z.string(),
  profile_path: nullablePath,
  known_for_department: z.string().nullish().catch(null),
});
export type PersonDto = z.infer<typeof personDtoSchema>;

const castDtoSchema = z.object({
  id: z.number(),
  name: z.string(),
  character: z.string().nullish().catch(null),
  profile_path: nullablePath,
  order: z.number().catch(999),
});

const crewDtoSchema = z.object({ id: z.number(), name: z.string(), job: z.string() });

const videoDtoSchema = z.object({
  key: z.string(),
  name: z.string(),
  site: z.string(),
  type: z.string(),
  iso_639_1: z.string().nullish().catch(null),
  official: z.boolean().catch(false),
});
export type VideoDto = z.infer<typeof videoDtoSchema>;

export const movieDetailDtoSchema = movieDtoSchema.extend({
  tagline: z.string().nullish().catch(null),
  runtime: z.number().nullish().catch(null),
  genres: z.array(genreDtoSchema).catch([]),
  budget: z.number().catch(0),
  revenue: z.number().catch(0),
  credits: z
    .object({ cast: z.array(castDtoSchema), crew: z.array(crewDtoSchema) })
    .catch({ cast: [], crew: [] }),
  videos: z.object({ results: z.array(videoDtoSchema) }).catch({ results: [] }),
  recommendations: z.object({ results: z.array(movieDtoSchema) }).catch({ results: [] }),
});
export type MovieDetailDto = z.infer<typeof movieDetailDtoSchema>;

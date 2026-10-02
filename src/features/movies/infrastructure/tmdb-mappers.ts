import type {
  ImageSet,
  Movie,
  MovieDetail,
  MovieWithBackdrop,
  Person,
  Trailer,
} from '../domain/movie';
import type { MovieDetailDto, MovieDto, PersonDto, VideoDto } from './tmdb-dtos';

const IMAGE_BASE = 'https://image.tmdb.org/t/p';

const IMAGE_SIZES = {
  poster: ['w185', 'w342', 'w500'],
  backdrop: ['w300', 'w780', 'w1280'],
  profile: ['w45', 'w185', 'h632'],
} as const;

export function toImageSet(
  path: string | null | undefined,
  kind: keyof typeof IMAGE_SIZES,
): ImageSet | null {
  if (!path) return null;
  const [small, medium, large] = IMAGE_SIZES[kind];
  return {
    small: `${IMAGE_BASE}/${small}${path}`,
    medium: `${IMAGE_BASE}/${medium}${path}`,
    large: `${IMAGE_BASE}/${large}${path}`,
  };
}

function toYear(releaseDate: string | null | undefined): number | null {
  const year = Number(releaseDate?.slice(0, 4));
  return Number.isInteger(year) && year > 0 ? year : null;
}

export function toMovie(dto: MovieDto): Movie {
  return {
    id: dto.id,
    title: dto.title,
    year: toYear(dto.release_date),
    rating: Math.round(dto.vote_average * 10) / 10,
    voteCount: dto.vote_count,
    poster: toImageSet(dto.poster_path, 'poster'),
  };
}

export function toMovieWithBackdrop(dto: MovieDto): MovieWithBackdrop {
  return {
    ...toMovie(dto),
    backdrop: toImageSet(dto.backdrop_path, 'backdrop'),
    overview: dto.overview?.trim() ?? '',
  };
}

export function toPerson(dto: PersonDto): Person {
  return {
    id: dto.id,
    name: dto.name,
    photo: toImageSet(dto.profile_path, 'profile'),
    department: dto.known_for_department ?? null,
  };
}

export function pickTrailer(videos: VideoDto[]): Trailer | null {
  const trailers = videos.filter((video) => video.site === 'YouTube' && video.type === 'Trailer');
  const score = (video: VideoDto) => (video.iso_639_1 === 'es' ? 2 : 0) + (video.official ? 1 : 0);
  const best = [...trailers].sort((a, b) => score(b) - score(a))[0];
  return best ? { youtubeKey: best.key, name: best.name } : null;
}

const CAST_LIMIT = 15;
const RECOMMENDATIONS_LIMIT = 12;

export function toMovieDetail(dto: MovieDetailDto): MovieDetail {
  return {
    ...toMovieWithBackdrop(dto),
    tagline: dto.tagline?.trim() || null,
    runtime: dto.runtime || null,
    genres: dto.genres,
    directors: dto.credits.crew
      .filter((member) => member.job === 'Director')
      .map(({ id, name }) => ({ id, name })),
    cast: [...dto.credits.cast]
      .sort((a, b) => a.order - b.order)
      .slice(0, CAST_LIMIT)
      .map((member) => ({
        id: member.id,
        name: member.name,
        character: member.character ?? '',
        photo: toImageSet(member.profile_path, 'profile'),
      })),
    trailer: pickTrailer(dto.videos.results),
    budget: dto.budget > 0 ? dto.budget : null,
    revenue: dto.revenue > 0 ? dto.revenue : null,
    recommendations: dto.recommendations.results.slice(0, RECOMMENDATIONS_LIMIT).map(toMovie),
  };
}

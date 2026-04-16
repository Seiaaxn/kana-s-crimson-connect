// ===== ANIME TYPES =====
export interface Anime {
  title: string;
  poster: string;
  episodes?: number;
  releaseDay?: string;
  latestReleaseDate?: string;
  lastReleaseDate?: string;
  score?: string;
  animeId: string;
  href: string;
  slug?: string;
  url?: string;
}

export interface Genre {
  title: string;
  genreId: string;
  href: string;
}

export interface AnimeDetail {
  title: string;
  poster: string;
  japanese?: string;
  score?: string;
  producers?: string;
  type?: string;
  status?: string;
  episodes?: number;
  duration?: string;
  aired?: string;
  studios?: string;
  batch?: string | null;
  synopsis?: { paragraphs: string[]; connections: string[] };
  genreList: Genre[];
  episodeList: Episode[];
  recommendedAnimeList?: Anime[];
}

export interface Episode {
  title: string;
  eps: number;
  date: string;
  episodeId: string;
  href: string;
}

export interface EpisodeDetail {
  title: string;
  animeId: string;
  releaseTime?: string;
  defaultStreamingUrl: string;
  hasPrevEpisode: boolean;
  prevEpisode?: { title: string; episodeId: string; href: string };
  hasNextEpisode: boolean;
  nextEpisode?: { title: string; episodeId: string; href: string };
  server: { qualities: ServerQuality[] };
  downloadUrl?: { qualities: DownloadQuality[] };
  info?: { credit?: string; encoder?: string; duration?: string; type?: string; genreList?: Genre[]; episodeList?: Episode[] };
}

export interface ServerQuality {
  title: string;
  serverList: Server[];
}

export interface Server {
  title: string;
  serverId: string;
  href: string;
}

export interface DownloadQuality {
  title: string;
  size: string;
  urls: { title: string; url: string }[];
}

export interface ScheduleDay {
  day: string;
  anime_list: { title: string; slug: string; url: string; poster: string }[];
}

export interface HomeData {
  ongoing: { href: string; animeList: Anime[] };
  completed: { href: string; animeList: Anime[] };
}

export interface ApiResponse<T> {
  status: string;
  data: T;
  pagination?: { currentPage: number; totalPages: number; hasPrevPage: boolean; hasNextPage: boolean } | null;
}

// ===== COMIC TYPES =====
export interface Comic {
  title: string;
  link: string;
  image: string;
  chapter?: string;
  time_ago?: string;
  slug?: string;
}

export interface ComicDetail {
  slug: string;
  title: string;
  title_indonesian?: string;
  image: string;
  synopsis: string;
  synopsis_full?: string;
  metadata: {
    type?: string;
    author?: string;
    status?: string;
    concept?: string;
    age_rating?: string;
    reading_direction?: string;
  };
  genres: { name: string; slug: string; link: string }[];
  chapters: ComicChapter[];
}

export interface ComicChapter {
  title: string;
  slug: string;
  date?: string;
  link?: string;
}

export interface ComicChapterDetail {
  manga_title: string;
  chapter_title: string;
  navigation: {
    previousChapter: string | null;
    nextChapter: string | null;
    chapterList: string;
  };
  images: string[];
}

export interface ComicGenre {
  value: string;
  name: string;
}

// ===== DONGHUA TYPES =====
export interface DonghuaItem {
  title: string;
  slug: string;
  poster: string;
  episode?: string;
  type?: string;
  status?: string;
  sub?: string;
  release_time?: string | null;
  url?: string;
  synopsis?: string;
}

export interface DonghuaDetail {
  title: string;
  poster: string;
  rating?: string;
  synopsis: string;
  info: {
    status?: string;
    network?: string;
    studio?: string;
    released?: string;
    country?: string;
    type?: string;
    episodes?: string;
    fansub?: string;
  };
  genres: { name: string; slug?: string; url?: string }[];
  batch_link?: string | null;
  episodes: DonghuaEpisode[];
}

export interface DonghuaEpisode {
  episode: string;
  title: string;
  slug: string;
  date: string;
  url?: string;
}

export interface DonghuaEpisodeDetail {
  title: string;
  release_date?: string;
  navigation: { prev_slug: string | null; next_slug: string | null; all_slug: string };
  streams: { server: string; url: string }[];
  downloads: any[];
  anime_info: {
    title: string;
    slug: string | null;
    thumbnail: string;
    rating?: string;
    status?: string;
    synopsis?: string;
    genres?: { name: string; url?: string }[];
  };
  related_episodes?: any[];
}

export interface DonghuaSchedule {
  [day: string]: DonghuaItem[];
}

// ===== LOCAL DATA TYPES =====
export interface WatchHistory {
  id: string;
  type: 'anime' | 'donghua' | 'comic';
  contentId: string;
  title: string;
  poster: string;
  episodeId?: string;
  episodeTitle?: string;
  chapterSlug?: string;
  chapterTitle?: string;
  watchedAt: number;
  progress?: number;
}

export interface FavoriteItem {
  id: string;
  type: 'anime' | 'donghua' | 'comic';
  contentId: string;
  title: string;
  poster: string;
  addedAt: number;
}

export interface CommentItem {
  id: string;
  username: string;
  avatar?: string;
  message: string;
  createdAt: number;
  contentId: string;
  contentType: 'anime' | 'donghua' | 'comic';
}

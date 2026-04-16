import type {
  ApiResponse, HomeData, AnimeDetail, EpisodeDetail, Genre, ScheduleDay, Anime,
  Comic, ComicDetail, ComicChapterDetail, ComicGenre,
  DonghuaItem, DonghuaDetail, DonghuaEpisodeDetail, DonghuaSchedule,
} from './types';

const ANIME_BASE = 'https://www.sankavollerei.com/anime';
const COMIC_BASE = 'https://www.sankavollerei.com/comic';
const DONGHUA_BASE = 'https://www.sankavollerei.com/anime/donghub';

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
  if (!res.ok) throw new Error(`API Error: ${res.status}`);
  return res.json();
}

// ===== ANIME API =====
export async function getHome(): Promise<HomeData> {
  try {
    const response = await fetchJson<ApiResponse<HomeData>>(`${ANIME_BASE}/home`);
    return response.data;
  } catch {
    return { ongoing: { href: '/ongoing', animeList: [] }, completed: { href: '/completed', animeList: [] } };
  }
}

export async function getAnimeDetail(animeId: string): Promise<AnimeDetail> {
  const response = await fetchJson<ApiResponse<AnimeDetail>>(`${ANIME_BASE}/anime/${animeId}`);
  return response.data;
}

export async function getEpisode(episodeId: string): Promise<EpisodeDetail> {
  const response = await fetchJson<ApiResponse<EpisodeDetail>>(`${ANIME_BASE}/episode/${episodeId}`);
  return response.data;
}

export async function getServerUrl(serverId: string): Promise<string> {
  const response = await fetchJson<ApiResponse<{ url: string }>>(`${ANIME_BASE}/server/${serverId}`);
  return response.data.url;
}

export async function getGenres(): Promise<Genre[]> {
  try {
    const response = await fetchJson<ApiResponse<{ genreList: Genre[] }>>(`${ANIME_BASE}/genre`);
    return response.data.genreList;
  } catch {
    return [];
  }
}

export async function getGenreAnime(genreId: string, page = 1) {
  try {
    const data = await fetchJson<any>(`${ANIME_BASE}/genre/${genreId}?page=${page}`);
    return { animeList: data.data?.animeList || [], pagination: data.pagination };
  } catch {
    return { animeList: [], pagination: null };
  }
}

export async function getSchedule(): Promise<ScheduleDay[]> {
  try {
    const response = await fetchJson<ApiResponse<ScheduleDay[]>>(`${ANIME_BASE}/schedule`);
    return response.data;
  } catch {
    return [];
  }
}

export async function getOngoingAnime(page = 1) {
  try {
    const data = await fetchJson<any>(`${ANIME_BASE}/ongoing-anime?page=${page}`);
    return { animeList: data.data?.animeList || [], pagination: data.pagination };
  } catch {
    return { animeList: [], pagination: null };
  }
}

export async function getCompletedAnime(page = 1) {
  try {
    const data = await fetchJson<any>(`${ANIME_BASE}/complete-anime?page=${page}`);
    return { animeList: data.data?.animeList || [], pagination: data.pagination };
  } catch {
    return { animeList: [], pagination: null };
  }
}

export async function searchAnime(query: string): Promise<Anime[]> {
  try {
    const response = await fetchJson<ApiResponse<{ animeList: Anime[] }>>(`${ANIME_BASE}/search/${encodeURIComponent(query)}`);
    return response.data?.animeList || [];
  } catch {
    return [];
  }
}

// ===== COMIC API =====
export async function getComicHomepage() {
  try {
    const data = await fetchJson<{ popular: Comic[]; latest: Comic[] }>(`${COMIC_BASE}/homepage`);
    return { popular: data.popular || [], latest: data.latest || [] };
  } catch {
    return { popular: [], latest: [] };
  }
}

export async function getComicLatest() {
  try {
    const data = await fetchJson<{ comics: Comic[] }>(`${COMIC_BASE}/terbaru`);
    return data.comics || [];
  } catch {
    return [];
  }
}

export async function getComicPopular() {
  try {
    const data = await fetchJson<{ comics: Comic[] }>(`${COMIC_BASE}/populer`);
    return data.comics || [];
  } catch {
    return [];
  }
}

export async function getComicTrending() {
  try {
    const data = await fetchJson<{ trending?: Comic[]; comics?: Comic[] }>(`${COMIC_BASE}/trending`);
    return data.trending || data.comics || [];
  } catch {
    return [];
  }
}

export async function getComicAll() {
  try {
    const data = await fetchJson<{ comics: Comic[] }>(`${COMIC_BASE}/unlimited`);
    return data.comics || [];
  } catch {
    return [];
  }
}

export async function getComicDetail(slug: string): Promise<ComicDetail | null> {
  try {
    const data = await fetchJson<any>(`${COMIC_BASE}/comic/${slug}`);
    return data;
  } catch {
    return null;
  }
}

export async function getComicChapter(slug: string): Promise<ComicChapterDetail | null> {
  try {
    return await fetchJson<ComicChapterDetail>(`${COMIC_BASE}/chapter/${slug}`);
  } catch {
    return null;
  }
}

export async function searchComic(query: string) {
  try {
    const data = await fetchJson<{ comics: Comic[] }>(`${COMIC_BASE}/search?q=${encodeURIComponent(query)}`);
    return data.comics || [];
  } catch {
    return [];
  }
}

export async function getComicGenres(): Promise<ComicGenre[]> {
  try {
    const data = await fetchJson<Record<string, any>>(`${COMIC_BASE}/genres`);
    const genres: ComicGenre[] = [];
    for (const key of Object.keys(data)) {
      if (key !== 'creator' && data[key]?.value) {
        genres.push({ value: data[key].value, name: data[key].name });
      }
    }
    return genres;
  } catch {
    return [];
  }
}

export async function getComicByGenre(genre: string) {
  try {
    const data = await fetchJson<{ comics: Comic[] }>(`${COMIC_BASE}/genre/${genre}`);
    return data.comics || [];
  } catch {
    return [];
  }
}

export async function getComicByType(type: string): Promise<Comic[]> {
  try {
    const data = await fetchJson<Record<string, any>>(`${COMIC_BASE}/type/${type}`);
    // Response is an object with numeric keys, not { comics: [] }
    const comics: Comic[] = [];
    for (const key of Object.keys(data)) {
      if (!isNaN(Number(key)) && data[key]?.title) {
        const item = data[key];
        // Filter out APK ads
        if (item.title.toLowerCase().includes('apk') || item.link === '/plus/') continue;
        comics.push({
          title: item.title,
          link: item.link,
          image: item.image,
          chapter: item.chapter,
          slug: item.slug,
        });
      }
    }
    return comics;
  } catch {
    return [];
  }
}

// ===== DONGHUA API =====
export async function getDonghuaHome(page = 1) {
  try {
    const data = await fetchJson<{ data: { slider: DonghuaItem[]; popular: DonghuaItem[]; latest: DonghuaItem[] } }>(`${DONGHUA_BASE}/home?page=${page}`);
    return data.data || { slider: [], popular: [], latest: [] };
  } catch {
    return { slider: [], popular: [], latest: [] };
  }
}

export async function getDonghuaLatest() {
  try {
    const data = await fetchJson<{ data: DonghuaItem[] }>(`${DONGHUA_BASE}/latest`);
    return data.data || [];
  } catch {
    return [];
  }
}

export async function getDonghuaPopular() {
  try {
    const data = await fetchJson<{ data: DonghuaItem[] }>(`${DONGHUA_BASE}/popular`);
    return data.data || [];
  } catch {
    return [];
  }
}

export async function getDonghuaDetail(slug: string): Promise<DonghuaDetail | null> {
  try {
    const data = await fetchJson<{ data: DonghuaDetail }>(`${DONGHUA_BASE}/detail/${slug}`);
    return data.data;
  } catch {
    return null;
  }
}

export async function getDonghuaEpisode(slug: string): Promise<DonghuaEpisodeDetail | null> {
  try {
    const data = await fetchJson<{ data: DonghuaEpisodeDetail }>(`${DONGHUA_BASE}/episode/${slug}`);
    return data.data;
  } catch {
    return null;
  }
}

export async function searchDonghua(query: string) {
  try {
    const data = await fetchJson<{ data: DonghuaItem[] }>(`${DONGHUA_BASE}/search/${encodeURIComponent(query)}`);
    return data.data || [];
  } catch {
    return [];
  }
}

export async function getDonghuaSchedule(): Promise<DonghuaSchedule> {
  try {
    const data = await fetchJson<{ data: DonghuaSchedule }>(`${DONGHUA_BASE}/schedule`);
    return data.data || {};
  } catch {
    return {};
  }
}

export async function getDonghuaGenre(genre: string) {
  try {
    const data = await fetchJson<{ data: DonghuaItem[] }>(`${DONGHUA_BASE}/genre/${genre}`);
    return data.data || [];
  } catch {
    return [];
  }
}

export async function getDonghuaList(sub = '', order = '') {
  try {
    const data = await fetchJson<{ data: DonghuaItem[] }>(`${DONGHUA_BASE}/list?sub=${sub}&order=${order}`);
    return data.data || [];
  } catch {
    return [];
  }
}

export async function getDonghuaMovie() {
  try {
    const data = await fetchJson<{ data: DonghuaItem[] }>(`${DONGHUA_BASE}/movie`);
    return data.data || [];
  } catch {
    return [];
  }
}

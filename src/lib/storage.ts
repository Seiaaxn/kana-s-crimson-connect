import type { WatchHistory, FavoriteItem, CommentItem } from './types';

const HISTORY_KEY = 'shinkanime_history';
const FAVORITES_KEY = 'shinkanime_favorites';
const COMMENTS_KEY = 'shinkanime_comments';
const USER_KEY = 'shinkanime_user';

// ===== USER =====
export interface LocalUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export function getUser(): LocalUser | null {
  try {
    const data = localStorage.getItem(USER_KEY);
    return data ? JSON.parse(data) : null;
  } catch { return null; }
}

export function setUser(user: LocalUser) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearUser() {
  localStorage.removeItem(USER_KEY);
}

// ===== HISTORY =====
export function getHistory(): WatchHistory[] {
  try {
    const data = localStorage.getItem(HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch { return []; }
}

export function addHistory(item: Omit<WatchHistory, 'id' | 'watchedAt'>) {
  const history = getHistory();
  const existing = history.findIndex(h => h.contentId === item.contentId && h.episodeId === item.episodeId && h.chapterSlug === item.chapterSlug);
  const entry: WatchHistory = { ...item, id: crypto.randomUUID(), watchedAt: Date.now() };
  if (existing >= 0) {
    history[existing] = { ...history[existing], ...entry, id: history[existing].id };
  } else {
    history.unshift(entry);
  }
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 200)));
}

export function clearHistory() {
  localStorage.removeItem(HISTORY_KEY);
}

// ===== FAVORITES =====
export function getFavorites(): FavoriteItem[] {
  try {
    const data = localStorage.getItem(FAVORITES_KEY);
    return data ? JSON.parse(data) : [];
  } catch { return []; }
}

export function addFavorite(item: Omit<FavoriteItem, 'id' | 'addedAt'>) {
  const favorites = getFavorites();
  if (favorites.some(f => f.contentId === item.contentId && f.type === item.type)) return;
  favorites.unshift({ ...item, id: crypto.randomUUID(), addedAt: Date.now() });
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
}

export function removeFavorite(contentId: string, type: string) {
  const favorites = getFavorites().filter(f => !(f.contentId === contentId && f.type === type));
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
}

export function isFavorited(contentId: string, type: string): boolean {
  return getFavorites().some(f => f.contentId === contentId && f.type === type);
}

// ===== COMMENTS =====
export function getComments(contentId: string): CommentItem[] {
  try {
    const data = localStorage.getItem(COMMENTS_KEY);
    const all: CommentItem[] = data ? JSON.parse(data) : [];
    return all.filter(c => c.contentId === contentId).sort((a, b) => b.createdAt - a.createdAt);
  } catch { return []; }
}

export function addComment(comment: Omit<CommentItem, 'id' | 'createdAt'>) {
  try {
    const data = localStorage.getItem(COMMENTS_KEY);
    const all: CommentItem[] = data ? JSON.parse(data) : [];
    all.unshift({ ...comment, id: crypto.randomUUID(), createdAt: Date.now() });
    localStorage.setItem(COMMENTS_KEY, JSON.stringify(all.slice(0, 1000)));
  } catch {}
}

export function deleteComment(commentId: string) {
  try {
    const data = localStorage.getItem(COMMENTS_KEY);
    const all: CommentItem[] = data ? JSON.parse(data) : [];
    localStorage.setItem(COMMENTS_KEY, JSON.stringify(all.filter(c => c.id !== commentId)));
  } catch {}
}

// ===== NOTIFICATIONS =====
export function isNotificationsEnabled(): boolean {
  return localStorage.getItem('shinkanime_notif') === 'true';
}

export function setNotificationsEnabled(enabled: boolean) {
  localStorage.setItem('shinkanime_notif', String(enabled));
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false;
  const permission = await Notification.requestPermission();
  if (permission === 'granted') {
    setNotificationsEnabled(true);
    new Notification('SHINKANIMEID', {
      body: 'Notifikasi berhasil diaktifkan!',
      icon: '/placeholder.svg',
    });
    return true;
  }
  return false;
}

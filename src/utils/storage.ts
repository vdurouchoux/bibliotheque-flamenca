import { PracticeBookmark, VideoItem, Level, VideoLandmark } from '../types';

const STORAGE_CUSTOM_VIDEOS_KEY = 'flamenco_custom_videos_v1';
const STORAGE_DELETED_VIDEOS_KEY = 'flamenco_deleted_videos_v1';
const STORAGE_REPLACED_VIDEOS_KEY = 'flamenco_replaced_videos_v1';
const STORAGE_BOOKMARKS_KEY = 'flamenco_bookmarks_v1';
const STORAGE_NOTES_KEY = 'flamenco_video_notes_v1';
const STORAGE_CHOREO_KEY = 'flamenco_choreo_checklist_v1';
const STORAGE_LANDMARKS_KEY = 'flamenco_video_landmarks_v1';

export interface CustomVideoStore {
  [paloKey: string]: {
    [section: string]: VideoItem[];
  };
}

export function getCustomVideos(): CustomVideoStore {
  try {
    const raw = localStorage.getItem(STORAGE_CUSTOM_VIDEOS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveCustomVideo(
  paloKey: string,
  section: string,
  video: { title: string; url: string; level: Level; description?: string }
): VideoItem {
  const store = getCustomVideos();
  if (!store[paloKey]) store[paloKey] = {};
  if (!store[paloKey][section]) store[paloKey][section] = [];

  const newItem: VideoItem = {
    id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    title: video.title.trim(),
    url: video.url.trim(),
    level: video.level,
    description: video.description?.trim(),
    isCustom: true
  };

  store[paloKey][section].push(newItem);
  try {
    localStorage.setItem(STORAGE_CUSTOM_VIDEOS_KEY, JSON.stringify(store));
  } catch (e) {
    console.error('Failed to save custom video', e);
  }
  return newItem;
}

export function getChoreographyChecklist(paloId: string): number[] {
  try {
    const raw = localStorage.getItem(STORAGE_CHOREO_KEY);
    const store = raw ? JSON.parse(raw) : {};
    return store[paloId] || [];
  } catch {
    return [];
  }
}

export function toggleChoreographyStep(paloId: string, stepNumber: number): number[] {
  try {
    const raw = localStorage.getItem(STORAGE_CHOREO_KEY);
    const store: Record<string, number[]> = raw ? JSON.parse(raw) : {};
    const current = store[paloId] || [];
    let updated: number[];
    if (current.includes(stepNumber)) {
      updated = current.filter(s => s !== stepNumber);
    } else {
      updated = [...current, stepNumber];
    }
    store[paloId] = updated;
    localStorage.setItem(STORAGE_CHOREO_KEY, JSON.stringify(store));
    return updated;
  } catch {
    return [];
  }
}

export function deleteCustomVideo(paloKey: string, section: string, id: string) {
  const store = getCustomVideos();
  if (store[paloKey] && store[paloKey][section]) {
    store[paloKey][section] = store[paloKey][section].filter(item => item.id !== id);
    try {
      localStorage.setItem(STORAGE_CUSTOM_VIDEOS_KEY, JSON.stringify(store));
    } catch (e) {
      console.error('Failed to delete custom video', e);
    }
  }
}

export function getDeletedVideoIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_DELETED_VIDEOS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function isVideoDeleted(videoId: string): boolean {
  return getDeletedVideoIds().includes(videoId);
}

export function deleteAnyVideo(paloKey: string, section: string, videoId: string) {
  deleteCustomVideo(paloKey, section, videoId);
  const list = getDeletedVideoIds();
  if (!list.includes(videoId)) {
    list.push(videoId);
    try {
      localStorage.setItem(STORAGE_DELETED_VIDEOS_KEY, JSON.stringify(list));
    } catch (e) {
      console.error('Failed to save deleted video id', e);
    }
  }
}

export function getReplacedVideos(): Record<string, VideoItem> {
  try {
    const raw = localStorage.getItem(STORAGE_REPLACED_VIDEOS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function replaceAnyVideo(
  paloKey: string,
  section: string,
  oldVideo: VideoItem,
  newData: { title: string; url: string; level: Level; description?: string }
): VideoItem {
  const updatedItem: VideoItem = {
    id: oldVideo.id,
    title: newData.title.trim(),
    url: newData.url.trim(),
    level: newData.level,
    description: newData.description?.trim(),
    isCustom: true
  };

  const customStore = getCustomVideos();
  if (customStore[paloKey] && customStore[paloKey][section]) {
    const idx = customStore[paloKey][section].findIndex(v => v.id === oldVideo.id);
    if (idx !== -1) {
      customStore[paloKey][section][idx] = updatedItem;
      try {
        localStorage.setItem(STORAGE_CUSTOM_VIDEOS_KEY, JSON.stringify(customStore));
      } catch (e) {
        console.error('Failed to update custom video', e);
      }
      return updatedItem;
    }
  }

  const replacedStore = getReplacedVideos();
  replacedStore[oldVideo.id] = updatedItem;
  try {
    localStorage.setItem(STORAGE_REPLACED_VIDEOS_KEY, JSON.stringify(replacedStore));
  } catch (e) {
    console.error('Failed to save replaced video', e);
  }
  return updatedItem;
}

export function resetAllDeletedVideos() {
  localStorage.removeItem(STORAGE_DELETED_VIDEOS_KEY);
  localStorage.removeItem(STORAGE_REPLACED_VIDEOS_KEY);
}

export function getBookmarks(): Record<string, PracticeBookmark> {
  try {
    const raw = localStorage.getItem(STORAGE_BOOKMARKS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function toggleBookmark(bookmark: Omit<PracticeBookmark, 'savedAt'>): boolean {
  const bookmarks = getBookmarks();
  const exists = !!bookmarks[bookmark.videoId];

  if (exists) {
    delete bookmarks[bookmark.videoId];
  } else {
    bookmarks[bookmark.videoId] = {
      ...bookmark,
      savedAt: Date.now()
    };
  }

  try {
    localStorage.setItem(STORAGE_BOOKMARKS_KEY, JSON.stringify(bookmarks));
  } catch (e) {
    console.error('Failed to save bookmark', e);
  }

  return !exists;
}

export function updateBookmarkStatus(videoId: string, status: PracticeBookmark['status']) {
  const bookmarks = getBookmarks();
  if (bookmarks[videoId]) {
    bookmarks[videoId].status = status;
    try {
      localStorage.setItem(STORAGE_BOOKMARKS_KEY, JSON.stringify(bookmarks));
    } catch (e) {
      console.error('Failed to update bookmark status', e);
    }
  }
}

export function getVideoNotes(videoId: string): string {
  try {
    const raw = localStorage.getItem(STORAGE_NOTES_KEY);
    const store = raw ? JSON.parse(raw) : {};
    return store[videoId] || '';
  } catch {
    return '';
  }
}

export function saveVideoNotes(videoId: string, notes: string) {
  try {
    const raw = localStorage.getItem(STORAGE_NOTES_KEY);
    const store = raw ? JSON.parse(raw) : {};
    store[videoId] = notes;
    localStorage.setItem(STORAGE_NOTES_KEY, JSON.stringify(store));
  } catch (e) {
    console.error('Failed to save video notes', e);
  }
}

export function extractYouTubeInfo(url: string, defaultStart?: number): { videoId: string | null; startSeconds: number } {
  if (!url) return { videoId: null, startSeconds: defaultStart || 0 };

  let videoId: string | null = null;
  let startSeconds = defaultStart || 0;

  // Extract start time parameter (&t= or ?t= or start=)
  const tMatch = url.match(/[?&](?:t|start)=([0-9hms]+)/i);
  if (tMatch) {
    const rawT = tMatch[1].toLowerCase();
    if (/^\d+$/.test(rawT)) {
      startSeconds = parseInt(rawT, 10);
    } else {
      let secs = 0;
      const hoursMatch = rawT.match(/(\d+)h/);
      const minsMatch = rawT.match(/(\d+)m/);
      const secsMatch = rawT.match(/(\d+)s/);
      if (hoursMatch) secs += parseInt(hoursMatch[1], 10) * 3600;
      if (minsMatch) secs += parseInt(minsMatch[1], 10) * 60;
      if (secsMatch) secs += parseInt(secsMatch[1], 10);
      if (secs > 0) startSeconds = secs;
    }
  }

  if (url.includes('watch?v=')) {
    const parts = url.split('watch?v=')[1];
    videoId = parts.split('&')[0];
  } else if (url.includes('youtu.be/')) {
    const parts = url.split('youtu.be/')[1];
    videoId = parts.split('?')[0].split('&')[0];
  } else if (url.includes('embed/')) {
    const parts = url.split('embed/')[1];
    videoId = parts.split('?')[0].split('&')[0];
  }

  return { videoId, startSeconds };
}

export function extractYouTubeId(url: string): string | null {
  return extractYouTubeInfo(url).videoId;
}

export function getVideoCustomLandmarks(videoId: string): VideoLandmark[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_LANDMARKS_KEY);
    if (!raw) return null;
    const store: Record<string, VideoLandmark[]> = JSON.parse(raw);
    return store[videoId] || null;
  } catch {
    return null;
  }
}

export function saveVideoCustomLandmarks(videoId: string, landmarks: VideoLandmark[]) {
  try {
    const raw = localStorage.getItem(STORAGE_LANDMARKS_KEY);
    const store: Record<string, VideoLandmark[]> = raw ? JSON.parse(raw) : {};
    store[videoId] = landmarks;
    localStorage.setItem(STORAGE_LANDMARKS_KEY, JSON.stringify(store));
  } catch (e) {
    console.error('Failed to save custom video landmarks', e);
  }
}

export function resetVideoCustomLandmarks(videoId: string) {
  try {
    const raw = localStorage.getItem(STORAGE_LANDMARKS_KEY);
    if (!raw) return;
    const store: Record<string, VideoLandmark[]> = JSON.parse(raw);
    delete store[videoId];
    localStorage.setItem(STORAGE_LANDMARKS_KEY, JSON.stringify(store));
  } catch (e) {
    console.error('Failed to reset custom video landmarks', e);
  }
}

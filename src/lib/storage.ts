import { Lecture, UserSettings } from '@/types/lecture';
import { DEMO_LECTURES } from '@/data/demoLectures';

const LECTURES_STORAGE_KEY = 'lecturelens_lectures_v1';
const SETTINGS_STORAGE_KEY = 'lecturelens_settings_v1';

export const DEFAULT_SETTINGS: UserSettings = {
  geminiApiKey: '',
  geminiModel: 'gemini-2.5-flash',
  theme: 'dark',
  notesDetailLevel: 'standard',
  targetAudience: 'university',
};

export function getStoredLectures(): Lecture[] {
  if (typeof window === 'undefined') return DEMO_LECTURES;
  try {
    const raw = localStorage.getItem(LECTURES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LECTURES_STORAGE_KEY, JSON.stringify(DEMO_LECTURES));
      return DEMO_LECTURES;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(LECTURES_STORAGE_KEY, JSON.stringify(DEMO_LECTURES));
      return DEMO_LECTURES;
    }
    return parsed;
  } catch (err) {
    console.error('Failed to load lectures from localStorage', err);
    return DEMO_LECTURES;
  }
}

export function saveLecture(newLecture: Lecture): Lecture[] {
  if (typeof window === 'undefined') return [newLecture, ...DEMO_LECTURES];
  try {
    const existing = getStoredLectures();
    const updated = [newLecture, ...existing.filter((l) => l.id !== newLecture.id)];
    localStorage.setItem(LECTURES_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('lecturelens_storage_updated'));
    return updated;
  } catch (err) {
    console.error('Failed to save lecture', err);
    return [];
  }
}

export function updateLecture(updatedLecture: Lecture): Lecture[] {
  if (typeof window === 'undefined') return [];
  try {
    const existing = getStoredLectures();
    const updated = existing.map((l) => (l.id === updatedLecture.id ? updatedLecture : l));
    localStorage.setItem(LECTURES_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('lecturelens_storage_updated'));
    return updated;
  } catch (err) {
    console.error('Failed to update lecture', err);
    return [];
  }
}

export function deleteLecture(lectureId: string): Lecture[] {
  if (typeof window === 'undefined') return [];
  try {
    const existing = getStoredLectures();
    const updated = existing.filter((l) => l.id !== lectureId);
    localStorage.setItem(LECTURES_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('lecturelens_storage_updated'));
    return updated;
  } catch (err) {
    console.error('Failed to delete lecture', err);
    return [];
  }
}

export function resetToDemoData(): Lecture[] {
  if (typeof window === 'undefined') return DEMO_LECTURES;
  try {
    localStorage.setItem(LECTURES_STORAGE_KEY, JSON.stringify(DEMO_LECTURES));
    window.dispatchEvent(new Event('lecturelens_storage_updated'));
    return DEMO_LECTURES;
  } catch (err) {
    console.error('Failed to reset demo data', err);
    return DEMO_LECTURES;
  }
}

export function getStoredSettings(): UserSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (err) {
    console.error('Failed to load settings', err);
    return DEFAULT_SETTINGS;
  }
}

export function saveStoredSettings(settings: Partial<UserSettings>): UserSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const current = getStoredSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('lecturelens_settings_updated'));
    return updated;
  } catch (err) {
    console.error('Failed to save settings', err);
    return DEFAULT_SETTINGS;
  }
}

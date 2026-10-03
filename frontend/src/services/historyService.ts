import type { PredictionRecord } from '../types';

const STORAGE_KEY = 'agripredict_history';
const MAX_RECORDS = 100;

export function getHistory(): PredictionRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as PredictionRecord[];
  } catch {
    return [];
  }
}

export function addRecord(record: PredictionRecord): void {
  const history = getHistory();
  const updated = [record, ...history].slice(0, MAX_RECORDS);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function clearHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

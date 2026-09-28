import type { GpsPoint } from '../types/gpsPoint';

export type StoredRoute = {
  name: string;
  stops: GpsPoint[];
  importedAt: string;
};

const storageKey = 'matej.route';

const isStoredRoute = (value: unknown): value is StoredRoute => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const route = value as Partial<StoredRoute>;
  return (
    typeof route.name === 'string' &&
    typeof route.importedAt === 'string' &&
    Array.isArray(route.stops) &&
    route.stops.every(
      (stop) =>
        typeof stop.id === 'string' &&
        typeof stop.latitude === 'number' &&
        typeof stop.longitude === 'number',
    )
  );
};

export const saveRoute = (route: StoredRoute): boolean => {
  try {
    localStorage.setItem(storageKey, JSON.stringify(route));
    return true;
  } catch {
    return false;
  }
};

export const loadRoute = (): StoredRoute | null => {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) {
      return null;
    }
    const parsed: unknown = JSON.parse(raw);
    return isStoredRoute(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

export const clearRoute = () => {
  try {
    localStorage.removeItem(storageKey);
  } catch {
    // Úložiště nemusí být dostupné (např. anonymní režim), mazání pak nemá co dělat
  }
};
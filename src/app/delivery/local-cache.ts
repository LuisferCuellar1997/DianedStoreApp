type CacheEnvelope<T> = {
  version: string;
  fetchedAt: number; // solo informativo
  data: T;
};


export function readCache<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CacheEnvelope<T>;
    return parsed.data ?? null;
  } catch {
    localStorage.removeItem(key);
    return null;
  }
}

export function writeCache<T>(key: string, data: T, version: string) {
  const envelope: CacheEnvelope<T> = {
    version,
    fetchedAt: Date.now(),
    data,
  };
  localStorage.setItem(key, JSON.stringify(envelope));
}

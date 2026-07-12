export interface AboutStat {
  value: string;
  label: string;
}

export interface PromoCamera {
  name: string;
  type: string;
  image: string;
  price?: number;
  specs: string[];
  slug?: string;
}

/** Settings stores lists/objects as JSON-stringified values in a flat string map. */
export function parseJsonSetting<T>(raw: string | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function parseList(raw: string | undefined): string[] {
  return parseJsonSetting<string[]>(raw, []).filter(Boolean);
}

export function parseStats(raw: string | undefined): AboutStat[] {
  return parseJsonSetting<AboutStat[]>(raw, []);
}

export function parsePromoCameras(raw: string | undefined, fallback: PromoCamera[] = []): PromoCamera[] {
  return parseJsonSetting<PromoCamera[]>(raw, fallback);
}

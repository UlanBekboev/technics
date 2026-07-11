export const SITE_URL = "https://technics.kg";
export const SITE_NAME = "TECHNICS";

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

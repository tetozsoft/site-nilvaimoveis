export const SITE_URL = "https://nilvaimoveis.com";

export function getCanonicalBaseUrl(website?: string | null): string {
  const raw = website?.trim();
  if (!raw) return SITE_URL;

  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;

  try {
    const url = new URL(withProtocol);
    url.hash = "";
    url.search = "";
    return url.origin.replace(/^https:\/\/www\.nilvaimoveis\.com$/i, SITE_URL);
  } catch {
    return SITE_URL;
  }
}

export function canonicalUrl(path = "", baseUrl = SITE_URL): string {
  return new URL(path || "/", baseUrl).toString();
}

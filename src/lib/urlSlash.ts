/**
 * withTrailingSlash — site-wide canonical/hreflang URL normalizer.
 *
 * Sitemaps and middleware route-detection use trailing-slash URLs for
 * every content-detail and hub page. Canonical and hreflang tags must
 * match that convention or Google + AI engines see a self-referencing
 * contradiction and down-weight the page.
 *
 * - Adds a trailing slash to the path component if missing.
 * - Preserves any querystring (?...) and fragment (#...).
 * - Skips file-like URLs (final segment contains a '.', e.g. .xml/.json).
 * - No-op for empty/null/undefined input.
 */
export function withTrailingSlash(url: string | null | undefined): string {
  if (!url) return url ?? '';
  const [bareAndQuery, ...fragmentParts] = url.split('#');
  const [path, ...queryParts] = bareAndQuery.split('?');
  if (path.endsWith('/')) return url;
  const lastSegment = path.split('/').pop() || '';
  if (lastSegment.includes('.')) return url;
  const slashed = `${path}/`;
  const rebuilt = queryParts.length ? `${slashed}?${queryParts.join('?')}` : slashed;
  return fragmentParts.length ? `${rebuilt}#${fragmentParts.join('#')}` : rebuilt;
}
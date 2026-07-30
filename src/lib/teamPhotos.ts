/**
 * Repo-hosted overrides for team member photos.
 *
 * Why: some `team_members.photo_url` values in the database point at
 * Lovable-internal asset paths (`/__l5e/assets-v1/…`) that no longer
 * resolve anywhere — production serves the SPA shell for them and
 * lovable.app 404s — so cards silently fall back to initials.
 * Hosting the headshots in `public/team/` and overriding here keeps
 * photos working without needing write access to the database.
 *
 * To add a photo: drop the image in `public/team/` and map it below
 * by the member's exact `name`.
 */
const LOCAL_TEAM_PHOTOS: Record<string, string> = {
  'Steven Rosenberg': '/team/steven-rosenberg.jpg',
  'David Rosenberg': '/team/david-rosenberg.jpg',
};

/** Dead Lovable-internal asset prefix — never usable in production. */
const DEAD_PHOTO_PREFIX = '/__l5e/';

export function resolveTeamPhoto(name: string, photoUrl: string | null): string | null {
  const local = LOCAL_TEAM_PHOTOS[name];
  if (local) return local;
  if (photoUrl && photoUrl.startsWith(DEAD_PHOTO_PREFIX)) return null;
  return photoUrl;
}

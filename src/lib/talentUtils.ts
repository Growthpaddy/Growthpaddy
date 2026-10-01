/**
 * Talent utility helpers to sanitize profile pictures and format initials
 */

/**
 * Checks whether an image URL is a demo, mock, or placeholder asset.
 */
export function isDemoPicture(url?: string | null): boolean {
  if (!url || typeof url !== 'string') return true;
  const lower = url.trim().toLowerCase();
  if (!lower) return true;
  return (
    lower.includes('unsplash.com') ||
    lower.includes('avatar_ramon') ||
    lower.includes('avatar_adekunle') ||
    lower.includes('placeholder') ||
    lower.includes('demo') ||
    lower.includes('sample') ||
    lower.includes('mock') ||
    lower.includes('picsum.photos')
  );
}

/**
 * Returns the first letter of the candidate's name in uppercase.
 * For example:
 * "Ramon Oluwakemi Bisola" -> "R"
 * "Adekunle Sultan Balogun" -> "A"
 * "Patrick Ezeji" -> "P"
 * "Oluebube Nwokedi" -> "O"
 */
export function getFirstLetter(name?: string | null): string {
  if (!name) return 'T';
  const clean = name.trim();
  if (!clean) return 'T';
  return clean.charAt(0).toUpperCase();
}

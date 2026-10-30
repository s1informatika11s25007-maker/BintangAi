/**
 * SambungJaga AI — Utility Formatters
 * Formatting functions for timestamps, currencies, badges, and percentages.
 */

/**
 * Formats ISO date string into Indonesian localized time (HH:MM WIB)
 * @param {string|Date} isoString
 * @returns {string}
 */
export function formatTimeID(isoString) {
  if (!isoString) return '-';
  try {
    const date = new Date(isoString);
    return `${date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB`;
  } catch {
    return String(isoString);
  }
}

/**
 * Formats ISO date string into full Indonesian date
 * @param {string|Date} isoString
 * @returns {string}
 */
export function formatDateID(isoString) {
  if (!isoString) return '-';
  try {
    return new Date(isoString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  } catch {
    return String(isoString);
  }
}

/**
 * Truncates SHA-256 hash string for display
 * @param {string} hash
 * @param {number} length
 * @returns {string}
 */
export function formatTruncatedHash(hash, length = 12) {
  if (!hash) return '';
  return hash.length > length ? `${hash.substring(0, length)}...` : hash;
}

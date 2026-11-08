// Helper untuk validasi input form
export const validateEmail = (email) => {
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;s@"]+(\.[^<>()[\]\\.,;s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};

export const validatePassword = (password) => {
  return password.length >= 6;
};

/**
 * Sanitasi string untuk mencegah XSS sederhana
 * @param {string} str
 * @returns {string}
 */
export const sanitizeInput = (str) => {
  if (typeof str !== 'string') return str;
  return str
    .replace(/[&<>"']/g, (m) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[m]);
};

/**
 * Validasi apakah URL aman (mencegah javascript: dsb)
 */
export const isSafeUrl = (url) => {
  if (!url) return true;
  try {
    const parsed = new URL(url, window.location.origin);
    return ['http:', 'https:', 'data:', 'blob:'].includes(parsed.protocol);
  } catch (e) {
    return false;
  }
};

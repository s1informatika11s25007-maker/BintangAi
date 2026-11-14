// Helper untuk format tanggal, angka, dan teks
export const formatDate = (date) => {
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'long' }).format(new Date(date));
};

export const formatXP = (xp) => {
  return new Intl.NumberFormat('id-ID').format(xp) + ' XP';
};

export const getCleanFirstName = (fullName) => {
  if (!fullName) return '';
  // 1. Remove prefixes like Pak, Ibu, Bapak, Dokter, Dr., Prof.
  let cleaned = fullName.replace(/^(Pak|Ibu|Bapak|Dokter|Dr\.|Prof\.)\s+/i, '');
  // 2. Remove degree titles like , S.Pd, M.Pd, etc.
  cleaned = cleaned.split(',')[0].trim();
  // 3. Extract first name
  const parts = cleaned.split(' ').filter(Boolean);
  const firstName = parts[0] || fullName;
  // Capitalize properly
  return firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
};

/**
 * Strips raw markdown syntax (**, *, #, -, `, etc.) from AI response text
 */
export const cleanMarkdownText = (text) => {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/_(.*?)_/g, '$1')
    .replace(/^\s*\*\s+/gm, '• ')
    .replace(/\s\*\s/g, ' ')
    .replace(/^#+\s+/gm, '')
    .replace(/`([^`]+)`/g, '$1')
    .trim();
};

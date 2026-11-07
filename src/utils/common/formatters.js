// Helper untuk format tanggal, angka, dan teks
export const formatDate = (date) => {
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'long' }).format(new Date(date));
};

export const formatXP = (xp) => {
  return new Intl.NumberFormat('id-ID').format(xp) + ' XP';
};

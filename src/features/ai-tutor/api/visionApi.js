/**
 * Camera access remains a browser permission. This module intentionally does
 * not upload images or invoke an unlisted vision model.
 */
export const visionApi = async () => ({
  success: false,
  localOnly: true,
  error: 'Analisis gambar AI tidak diaktifkan. Kamera BintangAi hanya memakai API browser.',
});

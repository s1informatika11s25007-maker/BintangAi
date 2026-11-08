export async function hashGroupPassword(value) {
  const password = String(value || '');
  if (!password) return null;
  if (!globalThis.crypto?.subtle) throw new Error('Browser ini tidak mendukung pengamanan sandi kelompok.');
  const bytes = new TextEncoder().encode(password);
  const digest = await globalThis.crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

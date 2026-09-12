/**
 * Cryptographically Secure ID and Randomness Utilities
 * Replaces Math.random() with Web Crypto API (crypto.getRandomValues / crypto.randomUUID)
 * to eliminate predictable randomness vulnerabilities in order IDs, UUIDs, and tokens.
 */

export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    // Version 4
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    // Variant RFC 4122
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
  }
  // Ultimate fallback using high-precision timestamp
  const now = Date.now().toString(16).padStart(12, '0');
  const perf = (typeof performance !== 'undefined' ? performance.now() : 0).toString(16).replace('.', '').padStart(8, '0');
  return `00000000-0000-4000-8000-${(now + perf).slice(0, 12)}`;
}

export function generateSecureOrderNumber(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    const num = 100000 + (array[0] % 900000);
    return `GP-${num}`;
  }
  return `GP-${Date.now().toString().slice(-6)}`;
}

export function generateSecureToken(prefix = 'tok', length = 8): string {
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const bytes = new Uint8Array(Math.ceil(length / 2));
    crypto.getRandomValues(bytes);
    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('').slice(0, length);
    return `${prefix}_${Date.now()}_${hex}`;
  }
  return `${prefix}_${Date.now()}_${Date.now().toString(36).slice(-length)}`;
}

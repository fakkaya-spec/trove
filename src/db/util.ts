// UUID/zaman yardımcıları. expo-crypto cihazda; node test ortamında
// globalThis.crypto.randomUUID'e düşer (Node 19+).
export function newId(): string {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Crypto = require("expo-crypto") as typeof import("expo-crypto");
    return Crypto.randomUUID();
  } catch {
    return globalThis.crypto.randomUUID();
  }
}

export function nowIso(): string {
  return new Date().toISOString();
}

/** Ortak insert alanları */
export function stamps() {
  const now = nowIso();
  return { createdAt: now, updatedAt: now };
}

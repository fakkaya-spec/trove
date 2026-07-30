// Medya yol çözümü — native import İÇERMEZ (repo katmanı ve node testleri
// güvenle kullanabilir). DB'de göreli anahtar ("media/<id>.jpg") saklanır;
// gösterim anında cihazın güncel documentDirectory'sine çözülür (iOS'ta
// konteyner yolu güncellemede değiştiği için mutlak yol saklamak yasaktır).

function documentDirectory(): string {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const FS = require("expo-file-system/legacy") as typeof import("expo-file-system/legacy");
    return FS.documentDirectory ?? "";
  } catch {
    return ""; // node/test ortamı: göreli anahtar olduğu gibi kalır
  }
}

/** DB'de saklanan değeri gösterilebilir URI'ye çevirir.
 *  Eski kayıtlar (mutlak file:// URI) olduğu gibi döner. */
export function resolveMediaUri(stored: string): string {
  if (stored.startsWith("file://") || stored.startsWith("content://") || stored.startsWith("http")) {
    return stored;
  }
  return `${documentDirectory()}${stored}`;
}

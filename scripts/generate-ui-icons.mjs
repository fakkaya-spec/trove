// UI ikon üretimi: node scripts/generate-ui-icons.mjs
// Kaynak: assets/icons/ionicons-svg/*.svg — resmi Ionicons v8 SVG'leri (MIT,
// lisans aynı klasörde). @expo/vector-icons Expo SDK 57'de expo paketiyle
// gelmediği ve package.json'a yeni bağımlılık eklenmediği için glifler
// derleme zamanında PNG'ye çevrilir; çalışma zamanında <Icon> (src/components/Icon.tsx)
// bunları Image tintColor ile boyar.
// Çıktı: assets/icons/png/<ad>.png — 96×96, siyah + alfa (tint edilebilir).
import sharp from "sharp";
import { mkdirSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const SRC = "assets/icons/ionicons-svg";
const OUT = "assets/icons/png";
const SIZE = 96; // 24dp @4x — her yoğunlukta keskin, dosya başına ~1-2 KB

mkdirSync(OUT, { recursive: true });

const files = readdirSync(SRC).filter((f) => f.endsWith(".svg"));
for (const f of files) {
  // librsvg "currentColor"ı CSS bağlamı olmadan çözemez → siyaha sabitle.
  const svg = readFileSync(join(SRC, f), "utf8").replaceAll("currentColor", "#000000");
  const name = f.replace(/\.svg$/, "");
  await sharp(Buffer.from(svg), { density: 300 })
    .resize(SIZE, SIZE)
    .png()
    .toFile(join(OUT, `${name}.png`));
}
console.log(`OK: ${files.length} ikon → ${OUT}`);

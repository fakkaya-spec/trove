// TROVE marka varlığı üretimi: node scripts/generate-icons.mjs
// Sembol: C0 (KİLİTLİ) — 48×48 birim tuvalde dört ortalanmış yatay katman.
// Bar genişlik/yükseklikleri ve boşluklar marka spesifikasyonundan; kavis,
// gölge, degrade, deniz süslemesi YOK. Marka değişirse yalnız bu script
// ve src/components/brand/ güncellenir.
// Wordmark: "TROVE", DM Sans Medium (OFL — assets/brand/fonts/), büyük harf,
// 0.18em harf aralığı. Üretim için DM Sans'ın sistem fontconfig'ine kurulu
// olması gerekir (ttf assets/brand/fonts/ altında; ~/.fonts'a kopyala).
import sharp from "sharp";

const INK = "#111110";
const PAPER = "#F8F7F4";

// --- C0 sembol geometrisi (48 birim tuval) --------------------------------
const CANVAS = 48;
const BARS = [
  { w: 20, h: 2.5 },
  { w: 30, h: 4.5 },
  { w: 40, h: 7 },
  { w: 48, h: 10.5 },
];
const GAPS = [7.5, 6, 4];
const CONTENT_H = BARS.reduce((s, b) => s + b.h, 0) + GAPS.reduce((s, g) => s + g, 0); // 42

/** C0 sembolünü SVG rect'leri olarak üretir; (cx, cy) merkez, size = tuval kenarı. */
function mark({ cx, cy, size, fill }) {
  const u = size / CANVAS;
  let rects = "";
  let y = cy - (CONTENT_H * u) / 2;
  BARS.forEach((bar, i) => {
    if (i > 0) y += GAPS[i - 1] * u;
    rects += `<rect x="${cx - (bar.w * u) / 2}" y="${y}" width="${bar.w * u}" height="${bar.h * u}" fill="${fill}"/>`;
    y += bar.h * u;
  });
  return rects;
}

const svg = (inner, w = 1024, h = 1024) =>
  Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">${inner}</svg>`);

// --- Wordmark: TROVE, DM Sans Medium, 0.18em tracking ---------------------
const WM_SIZE = 260; // master font boyutu (px) — bileşen küçülterek kullanır
const wordmarkSvg = (fill) =>
  Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="2400" height="500">
      <text x="40" y="360" font-family="DM Sans" font-weight="500" font-size="${WM_SIZE}"
        letter-spacing="${0.18 * WM_SIZE}" fill="${fill}">TROVE</text>
    </svg>`
  );

async function run() {
  // Uygulama ikonu: Ink zemin, Paper sembol (merkezde, tuvalin %52'si).
  await sharp(
    svg(`<rect width="1024" height="1024" fill="${INK}"/>${mark({ cx: 512, cy: 512, size: 532, fill: PAPER })}`)
  )
    .png()
    .toFile("assets/icon.png");

  // Android adaptive: ön katman şeffaf zeminde Paper sembol (güvenli iç bölge ~%66).
  await sharp(svg(mark({ cx: 512, cy: 512, size: 420, fill: PAPER })))
    .png()
    .toFile("assets/android-icon-foreground.png");

  await sharp(svg(`<rect width="1024" height="1024" fill="${INK}"/>`))
    .png()
    .toFile("assets/android-icon-background.png");

  await sharp(svg(mark({ cx: 512, cy: 512, size: 420, fill: "#FFFFFF" })))
    .png()
    .toFile("assets/android-icon-monochrome.png");

  // Splash: şeffaf zeminde Paper sembol (app.json splash zemini Ink).
  await sharp(svg(mark({ cx: 512, cy: 512, size: 720, fill: PAPER })))
    .png()
    .toFile("assets/splash-icon.png");

  // Favicon: Ink zemin, Paper sembol.
  await sharp(
    svg(`<rect width="1024" height="1024" fill="${INK}"/>${mark({ cx: 512, cy: 512, size: 640, fill: PAPER })}`)
  )
    .resize(64, 64)
    .png()
    .toFile("assets/favicon.png");

  // Store feature graphic (1024×500): Ink zemin, sembol + boşluk.
  await sharp(
    svg(
      `<rect width="1024" height="500" fill="${INK}"/>${mark({ cx: 512, cy: 250, size: 300, fill: PAPER })}`,
      1024,
      500
    )
  )
    .png()
    .toFile("assets/store-feature-graphic.png");

  // Wordmark: siyah + alfa master (bileşen tintColor ile boyar), kırpılmış.
  await sharp(wordmarkSvg("#000000")).trim().png().toFile("assets/brand/wordmark.png");

  const meta = await sharp("assets/brand/wordmark.png").metadata();
  console.log(`OK — ikonlar + wordmark (${meta.width}×${meta.height})`);
}

run();

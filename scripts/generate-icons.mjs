// Uygulama ikonu/splash üretimi: node scripts/generate-icons.mjs
// Tasarım: gece laciverti zemin + pirinç dümen simidi, göbeğinde onay işareti.
// Marka adı değişirse yalnızca bu script yeniden çalıştırılır (assets üretilir).
import sharp from "sharp";
import { mkdirSync } from "node:fs";

const NAVY = "#0B1D33";
const NAVY_DEEP = "#071426";
const BRASS = "#C9A227";
const PAPER = "#F6EFDC";

// Dümen simidi + onay işareti (viewBox 1024, merkez 512)
function helm({ stroke = BRASS, check = PAPER, scale = 1, bg = null } = {}) {
  const s = (v) => 512 + (v - 512) * scale;
  const r = (v) => v * scale;
  // 8 kol: dıştaki tutamaklara uzanan çubuklar
  let spokes = "";
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    const x1 = 512 + Math.cos(a) * r(120);
    const y1 = 512 + Math.sin(a) * r(120);
    const x2 = 512 + Math.cos(a) * r(430);
    const y2 = 512 + Math.sin(a) * r(430);
    const hx = 512 + Math.cos(a) * r(468);
    const hy = 512 + Math.sin(a) * r(468);
    spokes += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${r(34)}" stroke-linecap="round"/>`;
    spokes += `<circle cx="${hx}" cy="${hy}" r="${r(34)}" fill="${stroke}"/>`;
  }
  return `
  ${bg ? `<rect width="1024" height="1024" fill="${bg}"/>` : ""}
  <circle cx="512" cy="512" r="${r(330)}" fill="none" stroke="${stroke}" stroke-width="${r(52)}"/>
  <circle cx="512" cy="512" r="${r(258)}" fill="none" stroke="${stroke}" stroke-width="${r(16)}" opacity="0.55"/>
  ${spokes}
  <circle cx="512" cy="512" r="${r(150)}" fill="${bg ?? NAVY}" stroke="${stroke}" stroke-width="${r(20)}"/>
  <path d="M ${s(432)} ${s(516)} L ${s(492)} ${s(576)} L ${s(600)} ${s(448)}"
        fill="none" stroke="${check}" stroke-width="${r(46)}" stroke-linecap="round" stroke-linejoin="round"/>`;
}

const svg = (inner) =>
  Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">${inner}</svg>`);

async function main() {
  mkdirSync("assets", { recursive: true });

  // Ana ikon (iOS + genel): dolu zemin
  await sharp(svg(helm({ bg: NAVY, scale: 0.86 })))
    .resize(1024, 1024)
    .png()
    .toFile("assets/icon.png");

  // Android adaptive: foreground şeffaf zeminde, güvenli alan için küçük (%62)
  await sharp(svg(helm({ scale: 0.62 })))
    .resize(1024, 1024)
    .png()
    .toFile("assets/android-icon-foreground.png");

  // Adaptive background: düz lacivert (hafif vinyet)
  await sharp(
    svg(
      `<rect width="1024" height="1024" fill="${NAVY}"/>
       <circle cx="512" cy="512" r="700" fill="${NAVY_DEEP}" opacity="0.35"/>`
    )
  )
    .resize(1024, 1024)
    .png()
    .toFile("assets/android-icon-background.png");

  // Adaptive monochrome: beyaz siluet
  await sharp(svg(helm({ stroke: "#FFFFFF", check: "#FFFFFF", scale: 0.62 })))
    .resize(1024, 1024)
    .png()
    .toFile("assets/android-icon-monochrome.png");

  // Splash ikonu: şeffaf zeminde dümen (splash arkaplanı app.json'da lacivert)
  await sharp(svg(helm({ scale: 0.8 })))
    .resize(512, 512)
    .png()
    .toFile("assets/splash-icon.png");

  // Favicon (web)
  await sharp(svg(helm({ bg: NAVY, scale: 0.9 })))
    .resize(64, 64)
    .png()
    .toFile("assets/favicon.png");

  // Play Store feature graphic (1024×500): dümen + geçici ad + konumlandırma.
  // Marka adı kesinleşince yalnızca buradaki iki metin satırı değişir.
  const fg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 500">
    <rect width="1024" height="500" fill="${NAVY}"/>
    <circle cx="512" cy="250" r="620" fill="${NAVY_DEEP}" opacity="0.35"/>
    <g transform="translate(-92,38) scale(0.55)">${helm({ scale: 0.62 })}</g>
    <text x="400" y="230" font-family="Georgia, 'DejaVu Serif', serif" font-size="88"
          font-weight="bold" fill="${PAPER}">BoatCheck</text>
    <text x="404" y="298" font-family="Georgia, 'DejaVu Serif', serif" font-size="33"
          font-style="italic" fill="${BRASS}">Inspect · Prepare · Provision</text>
  </svg>`;
  await sharp(Buffer.from(fg)).resize(1024, 500).png().toFile("assets/store-feature-graphic.png");

  console.log("icons generated");
}

main();

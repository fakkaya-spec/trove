// Sefer raporu motoru — SAF katman: tipli sefer verisi → view model → HTML.
// React'siz, DB'siz, ağsız (fontlar sistemden; hiçbir dış kaynak yok —
// rapor tamamen çevrimdışı üretilir). 90/10: bugünün raporu + temiz dikiş
// (model ayrı, render ayrı — gelecekte başka biçimler aynı modeli kullanır).
// DİL KURALI (KİLİTLİ): olgular; "legally certified / court-proof /
// insurer approved / tamper-proof" gibi desteklenmeyen iddialar ASLA yok.
import type { MeterComparisonRow } from "./handover";
import type { CheckDepth, ReviewCategory } from "./completion";

export interface ReportReviewItem {
  title: string;
  severity: string | null;
  originLabel: string;
  recordedAt: string;
}

export interface ReportPhoto {
  /** Render anında data-URI'ye çözülür (pdf katmanı); boşsa foto atlanır. */
  src: string;
  label: string | null;
  takenAt: string;
}

export interface ReportSignoff {
  roleLabel: string;
  name: string;
  signedAt: string;
}

export interface TripReportModel {
  reportId: string;
  generatedAt: string;
  tripName: string;
  destination: string | null;
  vesselName: string | null;
  vesselModel: string | null;
  dates: string | null;
  skipperName: string | null;
  crewNames: string[];
  adults: number;
  children: number;
  boatReturned: boolean;
  checkDepth: CheckDepth | null;
  itemsReviewed: number;
  itemsTotal: number;
  newAtCheckoutCount: number;
  openCount: number;
  review: Record<ReviewCategory, ReportReviewItem[]>;
  meters: MeterComparisonRow[];
  photos: ReportPhoto[];
  totalPhotoCount: number;
  signoffs: ReportSignoff[];
}

/** UI çerçevesinden bağımsız etiketler — i18n katmanı doldurur. */
export interface ReportLabels {
  productName: string;
  returnedLabel: string;
  newIssuesLabel: string;
  openLabel: string;
  yesWord: string;
  noneWord: string;
  essentialLabel: string;
  fullLabel: string;
  itemsReviewed: string; // "{done} / {total}" biçimli
  crewHeading: string;
  metersHeading: string;
  openItemsHeading: string;
  photosHeading: string;
  signoffsHeading: string;
  categoryLabels: Record<ReviewCategory, string>;
  meterNames: Record<string, string>;
  deltaLabel: string;
  checkInLabel: string;
  checkOutLabel: string;
  signedBy: string;
  recordedAt: string;
  factsDisclaimer: string;
  localOriginNote: string;
  reportIdLabel: string;
  generatedAtLabel: string;
  skipperLabel: string;
  adultsLabel: string;
  childrenLabel: string;
}

const esc = (s: string): string =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const CATEGORY_ORDER: ReviewCategory[] = [
  "new_at_checkout",
  "still_open",
  "present_at_checkin",
  "resolved_during_trip",
];

/**
 * İlk blok 8 saniyede dört soruyu yanıtlar: hangi sefer, tekne teslim
 * edildi mi, yeni sorun var mı, kanıt nerede. Boş bölümler TEMİZCE atlanır —
 * raporu uzun göstermek için verisiz alan üretilmez.
 */
export function buildReportHtml(model: TripReportModel, L: ReportLabels): string {
  const sections: string[] = [];

  // --- Kapak: kimlik + durum ------------------------------------------------
  const statusRows = [
    `<div class="fact"><span>${esc(L.returnedLabel)}</span><strong class="${model.boatReturned ? "ok" : "warn"}">${esc(model.boatReturned ? L.yesWord : L.noneWord)}</strong></div>`,
    `<div class="fact"><span>${esc(L.newIssuesLabel)}</span><strong class="${model.newAtCheckoutCount > 0 ? "warn" : "ok"}">${model.newAtCheckoutCount > 0 ? model.newAtCheckoutCount : esc(L.noneWord)}</strong></div>`,
    `<div class="fact"><span>${esc(L.openLabel)}</span><strong class="${model.openCount > 0 ? "warn" : "ok"}">${model.openCount > 0 ? model.openCount : esc(L.noneWord)}</strong></div>`,
  ];
  if (model.checkDepth) {
    const depth = model.checkDepth === "full" ? L.fullLabel : L.essentialLabel;
    const reviewed = L.itemsReviewed
      .replace("{done}", String(model.itemsReviewed))
      .replace("{total}", String(model.itemsTotal));
    statusRows.push(
      `<div class="fact"><span>${esc(depth)}</span><strong>${esc(reviewed)}</strong></div>`
    );
  }
  sections.push(`<div class="status">${statusRows.join("")}</div>`);

  // --- Mürettebat -----------------------------------------------------------
  const crewBits: string[] = [];
  if (model.skipperName) crewBits.push(`${esc(L.skipperLabel)}: ${esc(model.skipperName)}`);
  if (model.crewNames.length > 0) crewBits.push(esc(model.crewNames.join(", ")));
  crewBits.push(`${esc(L.adultsLabel)}: ${model.adults}`);
  if (model.children > 0) crewBits.push(`${esc(L.childrenLabel)}: ${model.children}`);
  sections.push(
    `<h2>${esc(L.crewHeading)}</h2><p class="body-text">${crewBits.join(" · ")}</p>`
  );

  // --- Sayaçlar (veri varsa) ------------------------------------------------
  const metersWithData = model.meters.filter((m) => m.checkIn !== null || m.checkOut !== null);
  if (metersWithData.length > 0) {
    const rows = metersWithData
      .map((m) => {
        const name = L.meterNames[m.kind] ?? m.kind;
        const ci = m.checkIn !== null ? `${m.checkIn} ${esc(m.unit)}` : "—";
        const co = m.checkOut !== null ? `${m.checkOut} ${esc(m.unit)}` : "—";
        const delta =
          m.delta !== null ? `${m.delta > 0 ? "+" : ""}${m.delta} ${esc(m.unit)}` : "—";
        return `<tr><td>${esc(name)}</td><td class="mono">${ci}</td><td class="mono">${co}</td><td class="mono">${delta}</td></tr>`;
      })
      .join("");
    sections.push(
      `<h2>${esc(L.metersHeading)}</h2><table class="meters"><tr><th></th><th>${esc(L.checkInLabel)}</th><th>${esc(L.checkOutLabel)}</th><th>${esc(L.deltaLabel)}</th></tr>${rows}</table>`
    );
  }

  // --- Gözlemler & sorunlar (kategori bazlı; boş kategoriler atlanır) -------
  const reviewBlocks = CATEGORY_ORDER.filter((cat) => model.review[cat].length > 0)
    .map((cat) => {
      const items = model.review[cat]
        .map(
          (i) =>
            `<div class="obs"><p class="obs-title">${esc(i.title)}${i.severity ? ` <span class="sev">[${esc(i.severity)}]</span>` : ""}</p><p class="obs-meta">${esc(i.originLabel)} · ${esc(i.recordedAt)}</p></div>`
        )
        .join("");
      return `<h3>${esc(L.categoryLabels[cat])} (${model.review[cat].length})</h3>${items}`;
    })
    .join("");
  if (reviewBlocks) sections.push(`<h2>${esc(L.openItemsHeading)}</h2>${reviewBlocks}`);

  // --- Foto kanıtı (varsa) --------------------------------------------------
  const photos = model.photos.filter((p) => p.src.length > 0);
  if (photos.length > 0) {
    const cells = photos
      .map(
        (p) =>
          `<div class="photo"><img src="${p.src}" alt="${esc(p.label ?? "")}"/><p class="photo-meta">${esc(p.label ?? "")}${p.label ? " · " : ""}<span class="mono">${esc(p.takenAt)}</span></p></div>`
      )
      .join("");
    const more =
      model.totalPhotoCount > photos.length
        ? `<p class="obs-meta">+${model.totalPhotoCount - photos.length}</p>`
        : "";
    sections.push(`<h2>${esc(L.photosHeading)} (${model.totalPhotoCount})</h2><div class="photos">${cells}</div>${more}`);
  }

  // --- Onaylar (varsa) ------------------------------------------------------
  if (model.signoffs.length > 0) {
    const rows = model.signoffs
      .map(
        (so) =>
          `<div class="sig"><strong>${esc(so.name)}</strong> · ${esc(so.roleLabel)}<br/><span class="obs-meta">${esc(L.recordedAt)}: <span class="mono">${esc(so.signedAt)}</span></span></div>`
      )
      .join("");
    sections.push(`<h2>${esc(L.signoffsHeading)}</h2>${rows}`);
  }

  const metaLine = [model.vesselName, model.vesselModel, model.dates]
    .filter(Boolean)
    .map((x) => esc(x as string))
    .join(" · ");

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<style>
  /* Yalnız sistem fontları — dış kaynak/ağ YOK (çevrimdışı rapor). */
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:-apple-system,'Helvetica Neue',Roboto,Arial,sans-serif;color:#0C0C14;padding:0}
  .mono{font-family:Menlo,'Courier New',monospace}
  .page{max-width:720px;margin:0 auto}
  .header{background:#090C18;color:#FFF;padding:28px 32px}
  .brand{font-size:13px;font-weight:800;letter-spacing:0.10em}
  .report-meta{font-size:9px;color:rgba(255,255,255,0.45);margin-top:4px}
  .trip-name{font-size:26px;font-weight:700;letter-spacing:-0.5px;margin-top:18px}
  .trip-sub{font-size:12px;color:rgba(255,255,255,0.45);margin-top:4px}
  .content{padding:24px 32px}
  .status{background:#F5F5F8;border-radius:10px;padding:6px 16px;margin-bottom:20px}
  .fact{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(0,0,0,0.05);font-size:12px}
  .fact:last-child{border-bottom:none}
  .fact span{color:#7A7A90}
  .ok{color:#00875A}.warn{color:#C96A00}
  h2{font-size:10px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;color:#7A7A90;margin:22px 0 8px}
  h3{font-size:11px;font-weight:600;color:#3C3C4E;margin:10px 0 6px}
  .body-text{font-size:12px;line-height:1.6}
  table.meters{width:100%;border-collapse:collapse;font-size:11px}
  table.meters th{text-align:left;font-size:9px;color:#7A7A90;padding:4px 8px;background:#F5F5F8}
  table.meters td{padding:6px 8px;border-bottom:1px solid rgba(0,0,0,0.05)}
  .obs{padding:7px 12px;background:#FFF7EA;border-left:2px solid #C96A00;border-radius:0 6px 6px 0;margin-bottom:6px}
  .obs-title{font-size:12px;font-weight:600}
  .sev{font-weight:400;color:#C96A00;font-size:10px}
  .obs-meta{font-size:10px;color:#7A7A90;margin-top:2px}
  .photos{display:flex;flex-wrap:wrap;gap:8px}
  .photo{width:31%}
  .photo img{width:100%;border-radius:6px}
  .photo-meta{font-size:8px;color:#7A7A90;margin-top:3px}
  .sig{font-size:12px;padding:10px 14px;background:#F5F5F8;border-radius:8px;margin-bottom:6px}
  .footer{padding:16px 32px 28px;border-top:1px solid rgba(0,0,0,0.08);margin-top:24px}
  .footer p{font-size:9px;color:#7A7A90;line-height:1.6}
</style>
</head>
<body>
<div class="page">
  <div class="header">
    <div class="brand">${esc(L.productName)}</div>
    <div class="report-meta mono">${esc(L.reportIdLabel)} ${esc(model.reportId)} · ${esc(L.generatedAtLabel)} ${esc(model.generatedAt)}</div>
    <div class="trip-name">${esc(model.destination ?? model.tripName)}</div>
    <div class="trip-sub">${metaLine}</div>
  </div>
  <div class="content">
    ${sections.join("\n")}
  </div>
  <div class="footer">
    <p>${esc(L.factsDisclaimer)}</p>
    <p>${esc(L.localOriginNote)}</p>
  </div>
</div>
</body>
</html>`;
}

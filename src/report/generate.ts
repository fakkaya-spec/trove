// Rapor üretim orkestrasyonu (RN tarafı): toplayıcı → foto çözümü → HTML →
// yerel PDF → kayıt. TAMAMEN ÇEVRİMDIŞI; hiçbir ağ isteği yok. Native
// modüller (expo-print/sharing/file-system) tembel yüklenir — node/web
// ortamında ReportUnavailableError fırlar, VERİ ASLA etkilenmez.
import { collectTripReport, saveReportRecord } from "../repositories/report";
import { buildReportHtml } from "../domain/report";
import { reportFileName } from "../domain/completion";
import { resolveMediaUri } from "../media/paths";
import type { Locale } from "../i18n/strings";

export class ReportUnavailableError extends Error {
  constructor() {
    super("Report generation is unavailable in this environment");
    this.name = "ReportUnavailableError";
  }
}

type FS = typeof import("expo-file-system/legacy");

function fs(): FS {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require("expo-file-system/legacy") as FS;
  } catch {
    throw new ReportUnavailableError();
  }
}

function printer(): typeof import("expo-print") {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require("expo-print") as typeof import("expo-print");
  } catch {
    throw new ReportUnavailableError();
  }
}

/** Foto → data-URI. Tek foto okunamazsa ATLANIR — rapor asla düşmez. */
async function photoDataUri(relPath: string): Promise<string> {
  try {
    const FileSystem = fs();
    const b64 = await FileSystem.readAsStringAsync(resolveMediaUri(relPath), {
      encoding: "base64" as never,
    });
    return `data:image/jpeg;base64,${b64}`;
  } catch {
    return "";
  }
}

export interface GeneratedReport {
  relPath: string;
  reportId: string;
}

/**
 * Raporu üretir ve kaydeder. Başarısızlıkta hiçbir sefer verisi değişmez;
 * yeniden üretim aynı rapor kaydını günceller, eski PDF üzerine yazılır
 * (kalıcı kanıt ikilileri çoğaltılmaz).
 */
export async function generateTripReport(
  tripId: string,
  locale: Locale
): Promise<GeneratedReport> {
  const { model, photoSources, labels, completingInspectionId } = collectTripReport(
    tripId,
    locale
  );

  const photos = [];
  for (const src of photoSources) {
    photos.push({ src: await photoDataUri(src.relPath), label: src.label, takenAt: src.takenAt });
  }
  const html = buildReportHtml({ ...model, photos }, labels);

  const Print = printer();
  const FileSystem = fs();
  const { uri } = await Print.printToFileAsync({ html });

  const fileName = reportFileName(model.vesselName, model.destination ?? model.tripName);
  const relPath = `reports/${fileName}`;
  const destDir = `${FileSystem.documentDirectory}reports/`;
  try {
    await FileSystem.makeDirectoryAsync(destDir, { intermediates: true });
  } catch {
    // klasör zaten olabilir
  }
  const dest = `${FileSystem.documentDirectory}${relPath}`;
  try {
    await FileSystem.deleteAsync(dest, { idempotent: true });
  } catch {
    // eski kopya yoksa sorun değil
  }
  await FileSystem.moveAsync({ from: uri, to: dest });

  if (completingInspectionId) saveReportRecord(completingInspectionId, relPath, html);
  return { relPath, reportId: model.reportId };
}

/**
 * Native paylaşım sayfası. İptal "başarısızlık" DEĞİLDİR ve sahte
 * "paylaşıldı" mesajı yoktur — sayfa kapanınca sessizce döner.
 */
export async function sharePdf(relPath: string): Promise<void> {
  let Sharing: typeof import("expo-sharing");
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    Sharing = require("expo-sharing") as typeof import("expo-sharing");
  } catch {
    throw new ReportUnavailableError();
  }
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(resolveMediaUri(relPath), { mimeType: "application/pdf" });
  }
}

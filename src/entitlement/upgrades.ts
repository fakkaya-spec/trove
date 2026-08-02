// Modül yükseltme sayfası yapılandırması — kaynak: design-reference
// App.full.tsx UPGRADE_CFG + premium-design-system.md §4-§6. Metinler
// PREMIUM_STRINGS'ten gelir; burada yalnız görsel eşleme durur.
import { T } from "../theme";
import type { LIconName } from "../components/LIcon";
import type { UpgradeModule } from "../i18n/premium";
import type { PaywallContext } from "./policy";

export interface UpgradeVisual {
  icon: LIconName;
  color: string;
  bgColor: string;
}

export const UPGRADE_VISUALS: Record<UpgradeModule, UpgradeVisual> = {
  provisions: { icon: "utensils", color: T.green, bgColor: T.greenL },
  inspection: { icon: "shield", color: T.blue, bgColor: T.blueL },
  log: { icon: "book-open", color: T.blue, bgColor: T.blueL },
  crew: { icon: "users", color: T.ink0, bgColor: T.surfaceEl },
  report: { icon: "file-text", color: T.vessel, bgColor: T.surfaceEl },
};

export const UPGRADE_MODULES: UpgradeModule[] = [
  "provisions",
  "inspection",
  "log",
  "crew",
  "report",
];

/** Kapı bağlamı → modül yükseltme sayfası eşlemesi. `settings` burada YOK:
 *  gönüllü keşif girişi tam ekran paywall'a gider (§5). */
export const CONTEXT_MODULE: Partial<Record<PaywallContext, UpgradeModule>> = {
  inspection_photo: "inspection",
  log_photo: "log",
  handover_pair: "inspection",
  gallery_import: "inspection",
  report_photo: "report",
};

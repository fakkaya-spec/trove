export interface ChecklistItem {
  id: string;
  text: string;
  /** Güvenlik açısından kritik madde — kırmızı işaretlenir */
  critical?: boolean;
  /** Teslim alırken fotoğraflanması önerilen madde */
  photo?: boolean;
  /** Kısa ipucu / neden önemli */
  tip?: string;
}

export interface Category {
  id: string;
  title: string;
  icon: string;
  items: ChecklistItem[];
}

/** Foto & depozito rehberi içeriği (dil başına bir tane) */
export interface GuideContent {
  lead: string;
  photoSpots: { title: string; why: string }[];
  rules: { title: string; body: string }[];
  footer: string;
}

/** kiralik: kiralanan teknenin teslim kontrolü — sahip: tekne sahibinin rutin kontrolleri */
export type VesselGroup = "kiralik" | "sahip";

export interface Vessel {
  id: string;
  name: string;
  subtitle: string;
  icon: string;
  /** Tahmini kontrol süresi */
  duration: string;
  group: VesselGroup;
  categories: Category[];
}

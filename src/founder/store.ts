// Founder Mode yerel durumu — AsyncStorage. Normal kullanıcıya görünmez;
// hiçbir ürün davranışını değiştirmez (yalnız kurucu hatırlatma altyapısı).
import AsyncStorage from "@react-native-async-storage/async-storage";

const ENABLED_KEY = "trove:founder:enabled";
const USERS_KEY = "trove:founder:activatedUsers";
const DISMISSED_KEY = "trove:founder:dismissedMilestones";

export interface FounderState {
  enabled: boolean;
  /** Elle girilen aktif kullanıcı sayısı (kaynak: mağaza konsolları). */
  activatedUsers: number;
  dismissedMilestoneIds: string[];
}

export async function loadFounderState(): Promise<FounderState> {
  try {
    const [[, enabled], [, users], [, dismissed]] = await AsyncStorage.multiGet([
      ENABLED_KEY,
      USERS_KEY,
      DISMISSED_KEY,
    ]);
    let dismissedIds: string[] = [];
    try {
      dismissedIds = dismissed ? (JSON.parse(dismissed) as string[]) : [];
    } catch {
      dismissedIds = [];
    }
    return {
      enabled: enabled === "1",
      activatedUsers: Number.parseInt(users ?? "0", 10) || 0,
      dismissedMilestoneIds: dismissedIds,
    };
  } catch {
    return { enabled: false, activatedUsers: 0, dismissedMilestoneIds: [] };
  }
}

export async function setFounderEnabled(enabled: boolean): Promise<void> {
  await AsyncStorage.setItem(ENABLED_KEY, enabled ? "1" : "0").catch(() => {});
}

export async function setActivatedUsers(count: number): Promise<void> {
  await AsyncStorage.setItem(USERS_KEY, String(Math.max(0, Math.floor(count)))).catch(() => {});
}

export async function dismissMilestone(state: FounderState, id: string): Promise<string[]> {
  const next = [...new Set([...state.dismissedMilestoneIds, id])];
  await AsyncStorage.setItem(DISMISSED_KEY, JSON.stringify(next)).catch(() => {});
  return next;
}

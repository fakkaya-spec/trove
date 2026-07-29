import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY_PREFIX = "marincheck:v1:";

export type CheckState = Record<string, boolean>;

export async function loadChecks(vesselId: string): Promise<CheckState> {
  try {
    const raw = await AsyncStorage.getItem(KEY_PREFIX + vesselId);
    return raw ? (JSON.parse(raw) as CheckState) : {};
  } catch {
    return {};
  }
}

export async function saveChecks(vesselId: string, state: CheckState): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY_PREFIX + vesselId, JSON.stringify(state));
  } catch {
    // sessizce geç: depolama hatası uygulamayı durdurmasın
  }
}

export async function clearChecks(vesselId: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(KEY_PREFIX + vesselId);
  } catch {
    // yok say
  }
}

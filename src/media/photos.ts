import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy";
import { newId } from "../db/util";

// Fotoğrafı kalıcı uygulama klasörüne kopyalar (picker cache'i OS tarafından
// silinebilir; kanıt niteliğindeki medya documentDirectory'de yaşamalı).
async function persist(uri: string): Promise<string> {
  const dir = `${FileSystem.documentDirectory}media/`;
  try {
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  } catch {
    // klasör zaten olabilir
  }
  const ext = uri.includes(".") ? uri.slice(uri.lastIndexOf(".")) : ".jpg";
  const dest = `${dir}${newId()}${ext}`;
  await FileSystem.copyAsync({ from: uri, to: dest });
  return dest;
}

/**
 * Kamera açar (izin yoksa/başarısızsa galeriye düşer). Kalıcı yerel URI döner;
 * kullanıcı vazgeçerse null. Boyut sınırı: quality 0.6 (depolama politikası —
 * "sınırsız medya" pazarlaması yapılmaz, bkz. PHASE0 §6).
 */
export async function capturePhoto(): Promise<string | null> {
  const options: ImagePicker.ImagePickerOptions = {
    mediaTypes: ["images"],
    quality: 0.6,
    exif: false,
  };
  try {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (perm.granted) {
      const res = await ImagePicker.launchCameraAsync(options);
      if (!res.canceled && res.assets[0]) return persist(res.assets[0].uri);
      if (res.canceled) return null;
    }
  } catch {
    // kamera yoksa (simülatör/web) galeriye düş
  }
  try {
    const res = await ImagePicker.launchImageLibraryAsync(options);
    if (!res.canceled && res.assets[0]) return persist(res.assets[0].uri);
  } catch {
    return null;
  }
  return null;
}

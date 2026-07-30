import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy";
import { newId } from "../db/util";

// KANIT FOTOĞRAFI KURALLARI
// - Picker cache'i OS tarafından silinebilir → foto documentDirectory/media/
//   altına kopyalanır.
// - DB'de MUTLAK yol saklanmaz: iOS'ta uygulama güncellemesinde konteyner
//   yolu (UUID) değişir ve mutlak yollar kırılır. DB'de yalnızca göreli
//   anahtar ("media/<id>.jpg") tutulur; gösterim anında çözülür.
// - quality 0.6 + EXIF kapalı: depolama politikası + konum sızıntısı yok.

const MEDIA_DIR = "media/";

export { resolveMediaUri } from "./paths";

async function persist(uri: string): Promise<string> {
  const dir = `${FileSystem.documentDirectory}${MEDIA_DIR}`;
  try {
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  } catch {
    // klasör zaten olabilir
  }
  const ext = uri.includes(".") ? uri.slice(uri.lastIndexOf(".")) : ".jpg";
  const relative = `${MEDIA_DIR}${newId()}${ext}`;
  await FileSystem.copyAsync({ from: uri, to: `${FileSystem.documentDirectory}${relative}` });
  return relative; // DB'ye yazılacak GÖRELİ anahtar
}

/**
 * Kamera açar (izin yoksa/başarısızsa galeriye düşer). DB'ye yazılacak
 * GÖRELİ medya anahtarı döner; kullanıcı vazgeçerse null.
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

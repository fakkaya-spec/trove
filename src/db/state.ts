// DB kullanılabilirlik bayrağı. expo-sqlite web'de yapılandırılmadıysa
// uygulama çökmez; yeni akış ekranları bilgi mesajı gösterir (legacy mod çalışır).
let ready = false;

export function markDbReady(value: boolean): void {
  ready = value;
}

export function isDbReady(): boolean {
  return ready;
}

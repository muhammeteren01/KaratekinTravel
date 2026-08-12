/**
 * localStorage erişimi bazı ortamlarda (gizli sekme, kısıtlı iframe, dolu kota)
 * exception fırlatır. Panel genelinde bu erişim `try { ... } catch {}` ile
 * sessizce yutuluyordu; bu yardımcılar aynı korumayı tek yerde ve hatayı
 * konsola yazarak sağlar.
 */

export function readJson(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (error) {
    console.warn(`"${key}" localStorage'dan okunamadı:`, error);
    return fallback;
  }
}

export function writeJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.warn(`"${key}" localStorage'a yazılamadı:`, error);
    return false;
  }
}

export function removeKey(key) {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.warn(`"${key}" localStorage'dan silinemedi:`, error);
    return false;
  }
}

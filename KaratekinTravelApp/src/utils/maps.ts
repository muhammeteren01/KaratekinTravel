import { Linking, Platform } from "react-native";

/**
 * Verilen yer adını haritada aramak için platforma uygun bağlantıyı üretir.
 *
 * iOS'ta Apple Haritalar, Android'de geo: şeması (kullanıcının varsayılan
 * harita uygulaması), diğer durumlarda (ve yerel şema açılamazsa) tarayıcıda
 * Google Haritalar kullanılıyor.
 */
export function buildMapsUrl(query: string): string {
  const q = encodeURIComponent(query.trim());
  return Platform.select({
    ios: `http://maps.apple.com/?q=${q}`,
    android: `geo:0,0?q=${q}`,
    default: buildWebMapsUrl(query),
  }) as string;
}

export function buildWebMapsUrl(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    query.trim(),
  )}`;
}

/**
 * Yeri harita uygulamasında açar. Yerel şema açılamazsa tarayıcıya düşer.
 * Açılacak bir yer adı yoksa hiçbir şey yapmadan false döner; çağıran taraf
 * butonu buna göre devre dışı bırakmalı.
 */
export async function openInMaps(query?: string | null): Promise<boolean> {
  const q = (query ?? "").trim();
  if (!q) return false;

  const nativeUrl = buildMapsUrl(q);
  try {
    if (await Linking.canOpenURL(nativeUrl)) {
      await Linking.openURL(nativeUrl);
      return true;
    }
  } catch {
    // yerel şema desteklenmiyor olabilir; aşağıdaki web adresine düşülüyor
  }

  try {
    await Linking.openURL(buildWebMapsUrl(q));
    return true;
  } catch {
    return false;
  }
}

/**
 * Tur kaydından haritada aranacak en anlamlı metni seçer.
 * Alanlar API'de boş string olabildiği için hepsi tek tek eleniyor.
 */
export function mapQueryFromTrip(trip?: {
  location?: string | null;
  city?: string | null;
  region?: string | null;
  title?: string | null;
} | null): string {
  if (!trip) return "";
  const parts = [trip.location, trip.city, trip.region]
    .map((v) => (v ?? "").trim())
    .filter(Boolean);
  if (parts.length) return [...new Set(parts)].join(", ");
  return (trip.title ?? "").trim();
}

/**
 * API yanıtlarını şemalara vermeden önce düzelten saf yardımcılar.
 *
 * Burada bilerek hiçbir native modül import edilmiyor (http.ts
 * expo-secure-store çekiyor); böylece bu davranış jest'te doğrudan
 * test edilebiliyor.
 */

/**
 * API "değer yok" durumunu null yerine string.Empty ile gösteriyor
 * (ör. CompanyService: Logo/Email/Website = string.Empty,
 * TripService: Location/City/Region/Image = string.Empty).
 *
 * Şemalarda bu alanlar .optional() ama boş string onlar için geçerli bir
 * değer değil: .email() ve .url() reddediyor, ImageRef .min(1) istiyor.
 * Sonuçta yanıtın tamamı parse edilemiyor ve çağıran taraf sessizce
 * örnek veriye düşüyordu.
 *
 * Boş/boşluk-only string'leri undefined'a çevirerek alanların gerçekten
 * "yok" sayılmasını, böylece .optional() ve .default() kurallarının
 * amaçlandığı gibi çalışmasını sağlıyor.
 */
export function emptyToUndefined<T>(value: T): T {
  if (typeof value === 'string') {
    return (value.trim() === '' ? undefined : value) as unknown as T;
  }
  if (Array.isArray(value)) {
    return value.map((v) => emptyToUndefined(v)) as unknown as T;
  }
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      const cleaned = emptyToUndefined(v);
      if (cleaned !== undefined) out[k] = cleaned;
    }
    return out as unknown as T;
  }
  return value;
}

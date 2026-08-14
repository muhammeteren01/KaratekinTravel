/**
 * API yanıtındaki null değerleri undefined'a çevirir.
 *
 * Neden gerekli: sunucu C# ve doldurulmamış nullable alanları JSON'a null
 * olarak yazıyor (pricing.discount, details, policy, itinerary[].hotelIndex
 * gibi). Zod'un .optional() yalnızca undefined kabul ediyor, null'ı
 * reddediyor. Bu yüzden alanları tek tek .nullish() yapmak gerekiyordu ve
 * her yeni iç içe alan aynı hatayı yeniden üretiyordu.
 *
 * Neden bu dönüşüm güvenli (boş string'i silmek güvenli DEĞİLDİ):
 * null, .nullish() olmayan hiçbir Zod şemasında geçerli bir değer değil.
 * Dolayısıyla null'ı undefined'a çevirmek, geçerli bir değeri asla geçersiz
 * hale getiremez. Yalnızca iki sonuç mümkün:
 *   - alan opsiyonelse doğrulama artık geçiyor,
 *   - alan zorunluysa hata "Expected X, received null" yerine "Required"
 *     oluyor; yine hata, sadece mesajı değişiyor.
 * Boş string ise z.string() için geçerli bir değerdi; onu silmek zorunlu
 * alanları yok ediyordu. Fark burada.
 *
 * Bilinçli olarak native modül import edilmiyor, böylece doğrudan test
 * edilebiliyor.
 */
export function nullToUndefined<T>(value: T): T {
  if (value === null) return undefined as unknown as T;
  if (Array.isArray(value)) {
    return value.map((v) => nullToUndefined(v)) as unknown as T;
  }
  // Date, Map gibi nesneleri bozmamak için yalnızca düz nesneler dolaşılıyor.
  if (value && typeof value === 'object' && Object.getPrototypeOf(value) === Object.prototype) {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      const cleaned = nullToUndefined(v);
      if (cleaned !== undefined) out[k] = cleaned;
    }
    return out as unknown as T;
  }
  return value;
}

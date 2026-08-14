import type { ZodTypeAny, infer as ZodInfer } from 'zod';

/**
 * Şema doğrulamasını, başarısız olduğunda okunabilir bir log bırakarak yapar.
 *
 * Neden gerekli: bu çağrıların sonucu React Query'ye gidiyor ve React Query
 * hatayı sorgu durumunda tutup konsola yazmıyor. Zod hatası da varsayılan
 * olarak tek satırlık bir yığın izi gibi görünüyor. Sonuçta ekranda yalnızca
 * "Veriler yüklenirken hata oluştu" beliriyor, Metro çıktısında ise hangi
 * alanın neden reddedildiğine dair hiçbir iz kalmıyordu.
 *
 * Hata yutulmuyor; loglandıktan sonra aynen yeniden fırlatılıyor.
 */
// Generic şemanın kendisi üzerinden kuruluyor: ZodType<T> yazmak T'yi giriş
// tipinden çıkarıyor ve ID gibi dönüşümleri (string | number -> string)
// yansıtmıyordu.
export function parseOrLog<S extends ZodTypeAny>(
  schema: S,
  value: unknown,
  label: string,
): ZodInfer<S> {
  const result = schema.safeParse(value);
  if (result.success) return result.data;

  const issues = result.error.issues
    .slice(0, 20)
    .map((i) => `  ${i.path.join('.') || '(kök)'}: ${i.message}`)
    .join('\n');
  const more =
    result.error.issues.length > 20
      ? `\n  ... ve ${result.error.issues.length - 20} sorun daha`
      : '';

  console.error(
    `[api] ${label} yanıtı şemaya uymadı (${result.error.issues.length} sorun):\n${issues}${more}`,
  );

  throw result.error;
}

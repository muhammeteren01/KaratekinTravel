/**
 * Tablolardaki "Tarihe Göre Sırala" düğmeleri için ortak yardımcılar.
 *
 * Bu düğmeler üç tabloda da hiçbir işleve bağlı değildi: tıklanınca hiçbir
 * şey olmuyordu, çünkü dosyalarda sıralama kodu yoktu.
 */

/**
 * Panelde tarihler hem ISO ("2026-05-01T...") hem Türkçe biçimde
 * ("01.05.2026 - 14:30" / "01.05.2026 14:30") tutuluyor. İkisini de anlar.
 */
export function parseSortableDate(value) {
  if (!value) return null;

  const trMatch = String(value).match(/(\d{1,2})[./](\d{1,2})[./](\d{4})(?:[^\d]+(\d{1,2}):(\d{2}))?/);
  if (trMatch) {
    const [, day, month, year, hour = '0', minute = '0'] = trMatch;
    return new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute)).getTime();
  }

  const ms = new Date(value).getTime();
  return Number.isNaN(ms) ? null : ms;
}

/** direction: 'desc' (yeniden eskiye) veya 'asc'. Tarihsiz kayıtlar sona gider. */
export function sortByDate(rows, field, direction = 'desc') {
  const factor = direction === 'asc' ? 1 : -1;

  return [...rows].sort((a, b) => {
    const left = parseSortableDate(a?.[field]);
    const right = parseSortableDate(b?.[field]);

    if (left == null && right == null) return 0;
    if (left == null) return 1;
    if (right == null) return -1;

    return (left - right) * factor;
  });
}

/**
 * Türkçe karakterleri sadeleştirerek arama karşılaştırması yapar.
 * Dört dosyada birebir kopyalanmıştı ve null/sayı gelince çöküyordu
 * (undefined.toLowerCase is not a function).
 */
export function normalizeText(value) {
  return String(value ?? '')
    .toLocaleLowerCase('tr-TR')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/i̇/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c');
}

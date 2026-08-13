/**
 * Para birimi biçimlendirme ve tablo dışa aktarma.
 * Tarih/metin sıralama yardımcıları için utils/sorting.js'e bakın.
 */

const CURRENCY_SYMBOLS = {
  TRY: '₺',
  TL: '₺',
  USD: '$',
  EUR: '€',
  GBP: '£',
};

/**
 * Fiyatı okunur hale getirir.
 *
 * API bazı uçlarda sayı (4500), bazılarında hazır metin ("4.500 TRY")
 * döndürüyor. Ham sayı doğrudan ekrana basıldığında tablolarda para
 * birimi olmadan "4500" görünüyordu.
 */
export function formatPrice(value, currency = 'TRY') {
  if (value === null || value === undefined || value === '') return '-';

  // Zaten biçimlenmiş metin geldiyse olduğu gibi bırak.
  if (typeof value === 'string' && /[^\d.,\s]/.test(value)) return value.trim();

  const num = typeof value === 'number'
    ? value
    : Number(String(value).replace(/\./g, '').replace(',', '.'));

  if (!Number.isFinite(num)) return String(value);

  const symbol = CURRENCY_SYMBOLS[String(currency).toUpperCase()] || currency;
  return `${num.toLocaleString('tr-TR', { maximumFractionDigits: 2 })} ${symbol}`;
}

/**
 * Satırları CSV olarak indirir. Excel'in Türkçe kurulumları ayırıcı olarak
 * noktalı virgül bekliyor; BOM olmadan da Türkçe karakterler bozuluyor.
 */
export function downloadCsv(filename, headers, rows) {
  const escape = (cell) => {
    const text = cell === null || cell === undefined ? '' : String(cell);
    return /[";\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };

  const csv = [headers, ...rows].map((row) => row.map(escape).join(';')).join('\r\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

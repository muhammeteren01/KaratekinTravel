/**
 * Panel genelinde ortak biçimlendirme yardımcıları.
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

/** Fiyatı sıralama için sayıya çevirir; çözülemezse null. */
export function parsePriceValue(value) {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;

  const cleaned = String(value).replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(',', '.');
  const num = Number(cleaned);
  return Number.isFinite(num) ? num : null;
}

/**
 * "GG.AA.YYYY" ya da ISO biçimindeki tarihi sıralanabilir zaman damgasına
 * çevirir. Çözülemeyen değerler null döner; çağıran taraf bunları listenin
 * sonuna atmalı.
 */
export function parseSortableDate(value) {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value.getTime();

  const str = String(value).trim();

  const tr = str.match(/^(\d{2})\.(\d{2})\.(\d{4})(?:\s*[-\s]\s*(\d{2}):(\d{2}))?/);
  if (tr) {
    const [, d, m, y, hh = '0', mm = '0'] = tr;
    return new Date(Number(y), Number(m) - 1, Number(d), Number(hh), Number(mm)).getTime();
  }

  const parsed = new Date(str);
  return Number.isNaN(parsed.getTime()) ? null : parsed.getTime();
}

/**
 * Verilen alana göre sıralar. Çözülemeyen değerler yön ne olursa olsun
 * listenin sonunda kalır; aksi halde boş tarihler listenin başını dolduruyor.
 */
export function sortRows(rows, { key, direction = 'asc', type = 'text' }) {
  if (!key) return rows;

  const toComparable = (row) => {
    const raw = typeof key === 'function' ? key(row) : row[key];
    if (type === 'date') return parseSortableDate(raw);
    if (type === 'number') return parsePriceValue(raw);
    return raw === null || raw === undefined || raw === '' ? null : String(raw);
  };

  const factor = direction === 'desc' ? -1 : 1;

  return [...rows].sort((a, b) => {
    const av = toComparable(a);
    const bv = toComparable(b);

    if (av === null && bv === null) return 0;
    if (av === null) return 1;
    if (bv === null) return -1;

    if (type === 'text') return av.localeCompare(bv, 'tr') * factor;
    return (av - bv) * factor;
  });
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

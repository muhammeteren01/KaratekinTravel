/**
 * Türkiye banka listesi ve IBAN doğrulama.
 *
 * Formda yalnızca üç banka seçeneği vardı; IBAN alanı ise sınırsız metin
 * kabul ediyordu (harf, sembol, istenildiği kadar hane).
 */

// Türkiye'de faaliyet gösteren mevduat ve katılım bankaları.
export const TURKISH_BANKS = [
  'Akbank',
  'Albaraka Türk',
  'Alternatif Bank',
  'Anadolubank',
  'Burgan Bank',
  'Citibank',
  'Denizbank',
  'Emlak Katılım',
  'Fibabanka',
  'Garanti BBVA',
  'Halkbank',
  'HSBC',
  'ICBC Turkey',
  'ING',
  'İş Bankası',
  'Kuveyt Türk',
  'Odeabank',
  'QNB',
  'Şekerbank',
  'TEB',
  'Türkiye Finans',
  'Vakıf Katılım',
  'VakıfBank',
  'Yapı Kredi',
  'Ziraat Bankası',
  'Ziraat Katılım',
];

// TR IBAN: TR + 2 kontrol hanesi + 22 hane = 26 karakter, 24'ü rakam.
const TR_IBAN_DIGITS = 24;

/**
 * Kullanıcının yazdığını IBAN'a çevirir: TR öneki sabit, yalnızca rakam
 * kabul edilir, en fazla 24 hane, dörderli gruplar hâlinde boşluklanır.
 */
export function formatIban(input) {
  const digits = String(input || '')
    .toUpperCase()
    .replace(/^TR/, '')
    .replace(/\D/g, '')
    .slice(0, TR_IBAN_DIGITS);

  const groups = [];
  // İlk grup "TR" + 2 kontrol hanesi olacak şekilde dörtlü bloklar kuruluyor.
  const full = `TR${digits}`;
  for (let i = 0; i < full.length; i += 4) {
    groups.push(full.slice(i, i + 4));
  }

  return groups.join(' ');
}

/** Biçimlenmiş IBAN'dan boşlukları atar; API'ye bu hâli gider. */
export function compactIban(value) {
  return String(value || '').replace(/\s/g, '').toUpperCase();
}

/** IBAN'ın rakam kısmı; doğrulama ve sayaç için. */
export function ibanDigitCount(value) {
  return compactIban(value).replace(/^TR/, '').replace(/\D/g, '').length;
}

/**
 * IBAN'ın mod-97 kontrolü (ISO 13616). Hane sayısı doğru olsa bile
 * yanlış yazılmış bir IBAN'ı yakalar.
 */
function isMod97Valid(compact) {
  // İlk dört karakter sona alınır, harfler A=10 ... Z=35 ile sayıya çevrilir.
  const rearranged = compact.slice(4) + compact.slice(0, 4);
  const numeric = rearranged.replace(/[A-Z]/g, (ch) => String(ch.charCodeAt(0) - 55));

  // Sayı 2^53'ü aştığı için parça parça mod alınıyor.
  let remainder = 0;
  for (const digit of numeric) {
    remainder = (remainder * 10 + Number(digit)) % 97;
  }

  return remainder === 1;
}

/**
 * @returns {{ valid: boolean, message: string }}
 */
export function validateIban(value) {
  const compact = compactIban(value);

  if (!compact || compact === 'TR') {
    return { valid: false, message: 'IBAN zorunludur.' };
  }

  if (!compact.startsWith('TR')) {
    return { valid: false, message: 'IBAN "TR" ile başlamalıdır.' };
  }

  const digits = compact.slice(2);

  if (!/^\d*$/.test(digits)) {
    return { valid: false, message: 'IBAN yalnızca rakam içerebilir.' };
  }

  if (digits.length !== TR_IBAN_DIGITS) {
    return {
      valid: false,
      message: `IBAN, TR'den sonra ${TR_IBAN_DIGITS} hane olmalıdır (şu an ${digits.length}).`,
    };
  }

  if (!isMod97Valid(compact)) {
    return { valid: false, message: 'IBAN kontrol hanesi tutmuyor; numarayı kontrol edin.' };
  }

  return { valid: true, message: '' };
}

export const IBAN_DIGIT_COUNT = TR_IBAN_DIGITS;

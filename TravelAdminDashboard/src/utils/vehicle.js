/**
 * Araç plakası ve araç sınıfı yardımcıları.
 */

/**
 * Türk plaka biçimleri (il kodu 01-81 + harf grubu + rakam grubu):
 *   34 A 1234     — 1 harf + 4 rakam
 *   34 AB 123     — 2 harf + 3 rakam
 *   34 AB 1234    — 2 harf + 4 rakam
 *   34 ABC 12     — 3 harf + 2 rakam
 */
const PLATE_PATTERN = /^(0[1-9]|[1-7][0-9]|8[01])\s([A-Z]{1}\s\d{4}|[A-Z]{2}\s\d{3,4}|[A-Z]{3}\s\d{2})$/;

/**
 * Kullanıcı yazarken plakayı normalleştirir: harfler büyütülür, Türkçe
 * karakterler plakada kullanılmadığı için Latin karşılığına çevrilir,
 * geçersiz simgeler atılır ve gruplar boşlukla ayrılır.
 *
 * Önceden alan ham metindi: küçük harf, sembol, istenildiği kadar karakter
 * kabul ediyordu.
 */
export function formatPlate(input) {
  const raw = String(input || '')
    .toLocaleUpperCase('tr')
    .replace(/İ/g, 'I')
    .replace(/Ş/g, 'S')
    .replace(/Ğ/g, 'G')
    .replace(/Ü/g, 'U')
    .replace(/Ö/g, 'O')
    .replace(/Ç/g, 'C')
    .replace(/[^A-Z0-9]/g, '');

  const cityCode = raw.slice(0, 2).replace(/\D/g, '');
  if (raw.length <= 2) return cityCode;

  const rest = raw.slice(2);
  const letters = rest.match(/^[A-Z]{0,3}/)?.[0] || '';
  const digits = rest.slice(letters.length).replace(/\D/g, '');

  // Harf grubu uzunluğu rakam grubunun üst sınırını belirliyor.
  const maxDigits = letters.length === 3 ? 2 : letters.length === 2 ? 4 : 4;
  const trimmedDigits = digits.slice(0, maxDigits);

  return [cityCode, letters, trimmedDigits].filter(Boolean).join(' ');
}

export function validatePlate(value) {
  const plate = String(value || '').trim();

  if (!plate) return { valid: false, message: 'Araç plakası zorunludur.' };

  const cityCode = Number(plate.slice(0, 2));
  if (!Number.isInteger(cityCode) || cityCode < 1 || cityCode > 81) {
    return { valid: false, message: 'Plaka 01-81 arası bir il koduyla başlamalıdır.' };
  }

  if (!PLATE_PATTERN.test(plate)) {
    return {
      valid: false,
      message: 'Plaka biçimi geçersiz. Örnek: 34 AB 1234, 06 ABC 12, 18 A 1234.',
    };
  }

  return { valid: true, message: '' };
}

/**
 * Araç sınıfları. Listede önceden ticari araç modelleri vardı
 * (Mercedes Sprinter, Ford Transit gibi); tur firmasının seçtiği şey
 * markadan çok aracın sınıfı ve kapasitesi.
 */
export const VEHICLE_CLASSES = [
  { value: 'minibus', label: 'Minibüs', capacityHint: '13-19 kişi', typicalCapacity: 16 },
  { value: 'midibus', label: 'Midibüs', capacityHint: '20-35 kişi', typicalCapacity: 27 },
  { value: 'otobus', label: 'Otobüs', capacityHint: '36-55 kişi', typicalCapacity: 46 },
  { value: 'vip', label: 'VIP Araç', capacityHint: '4-12 kişi', typicalCapacity: 8 },
];

export function findVehicleClass(value) {
  if (!value) return null;
  const needle = String(value).toLocaleLowerCase('tr');
  return VEHICLE_CLASSES.find(
    (c) => c.value === needle || c.label.toLocaleLowerCase('tr') === needle
  ) || null;
}

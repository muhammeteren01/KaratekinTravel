/**
 * Vergi dairesi seçimi için il listesi.
 *
 * Formda yalnızca "Ankara" ve "İstanbul" seçenekleri vardı; diğer 79 ildeki
 * firmalar vergi dairelerini seçemiyordu.
 */

export const TR_PROVINCES = [
  'Adana', 'Adıyaman', 'Afyonkarahisar', 'Ağrı', 'Aksaray', 'Amasya', 'Ankara',
  'Antalya', 'Ardahan', 'Artvin', 'Aydın', 'Balıkesir', 'Bartın', 'Batman',
  'Bayburt', 'Bilecik', 'Bingöl', 'Bitlis', 'Bolu', 'Burdur', 'Bursa',
  'Çanakkale', 'Çankırı', 'Çorum', 'Denizli', 'Diyarbakır', 'Düzce', 'Edirne',
  'Elazığ', 'Erzincan', 'Erzurum', 'Eskişehir', 'Gaziantep', 'Giresun',
  'Gümüşhane', 'Hakkâri', 'Hatay', 'Iğdır', 'Isparta', 'İstanbul', 'İzmir',
  'Kahramanmaraş', 'Karabük', 'Karaman', 'Kars', 'Kastamonu', 'Kayseri',
  'Kırıkkale', 'Kırklareli', 'Kırşehir', 'Kilis', 'Kocaeli', 'Konya',
  'Kütahya', 'Malatya', 'Manisa', 'Mardin', 'Mersin', 'Muğla', 'Muş',
  'Nevşehir', 'Niğde', 'Ordu', 'Osmaniye', 'Rize', 'Sakarya', 'Samsun',
  'Siirt', 'Sinop', 'Sivas', 'Şanlıurfa', 'Şırnak', 'Tekirdağ', 'Tokat',
  'Trabzon', 'Tunceli', 'Uşak', 'Van', 'Yalova', 'Yozgat', 'Zonguldak',
];

/**
 * Vergi kimlik numarası: kurumlar için 10 hane, şahıs şirketlerinde
 * TC kimlik numarası (11 hane) kullanılıyor.
 */
export function validateTaxNumber(value) {
  const digits = String(value || '').replace(/\D/g, '');

  if (!digits) return { valid: false, message: 'Vergi numarası zorunludur.' };

  if (digits.length !== 10 && digits.length !== 11) {
    return {
      valid: false,
      message: 'Vergi numarası 10 hane, TC kimlik numarası 11 hane olmalıdır.',
    };
  }

  return { valid: true, message: '' };
}

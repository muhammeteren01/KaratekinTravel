/**
 * Görsel yükleme doğrulaması ve okuma.
 *
 * Aynı mantık araç tanımlama ve tur ekleme adımlarında birebir kopyalanmıştı;
 * her iki kopya da `files[0]` okuyordu, yani kullanıcı çoklu seçim yapsa bile
 * yalnızca ilk dosya ekleniyor, geri kalanı sessizce düşüyordu.
 */

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const MAX_GALLERY_IMAGES = 10;

const VALID_TYPES = ['image/svg+xml', 'image/png', 'image/jpeg', 'image/jpg'];

export const readFileAsDataUrl = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = (e) => resolve(e.target.result);
  reader.onerror = reject;
  reader.readAsDataURL(file);
});

/**
 * Seçilen dosyaları eler ve kullanıcıya neyin neden atlandığını bildirir.
 *
 * @param {FileList|File[]} fileList seçilen dosyalar
 * @param {object} options
 * @param {(msg: string, type?: string) => void} options.notify bildirim kancası
 * @param {number} options.remainingSlots kaç görsel daha eklenebilir
 * @returns {File[]} kabul edilen dosyalar
 */
export function filterImageFiles(fileList, { notify, remainingSlots = MAX_GALLERY_IMAGES } = {}) {
  const picked = Array.from(fileList || []);
  if (!picked.length) return [];

  const badType = picked.filter((f) => !VALID_TYPES.includes(f.type));
  const tooBig = picked.filter((f) => VALID_TYPES.includes(f.type) && f.size > MAX_IMAGE_BYTES);

  if (badType.length) {
    notify?.(
      `Yalnızca .svg, .png, .jpg, .jpeg kabul ediliyor. Atlanan: ${badType.map((f) => f.name).join(', ')}`,
      'warning',
    );
  }

  if (tooBig.length) {
    notify?.(
      `5MB sınırını aşan dosyalar atlandı: ${tooBig.map((f) => f.name).join(', ')}`,
      'warning',
    );
  }

  const accepted = picked.filter((f) => VALID_TYPES.includes(f.type) && f.size <= MAX_IMAGE_BYTES);
  if (!accepted.length) return [];

  if (remainingSlots <= 0) {
    notify?.(`En fazla ${MAX_GALLERY_IMAGES} görsel ekleyebilirsiniz.`, 'warning');
    return [];
  }

  if (accepted.length > remainingSlots) {
    notify?.(
      `En fazla ${MAX_GALLERY_IMAGES} görsel tutulabiliyor; ${accepted.length - remainingSlots} tanesi eklenmedi.`,
      'warning',
    );
  }

  return accepted.slice(0, remainingSlots);
}

/**
 * Dosyaları galeri öğesine çevirir (base64 önizlemeli).
 * Aynı milisaniyede birden fazla dosya işlendiği için kimlik Date.now()
 * tek başına benzersiz değil; rastgele bir ek konuyor.
 */
export async function toGalleryItems(files) {
  return Promise.all(files.map(async (file) => ({
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    file,
    name: file.name,
    preview: await readFileAsDataUrl(file),
  })));
}

/** Tek dosyalık alanlar (kapak görseli) için doğrulama. */
export function validateSingleImage(file, { notify } = {}) {
  if (!file) return false;

  if (!VALID_TYPES.includes(file.type)) {
    notify?.('Lütfen sadece .svg, .png, .jpg veya .jpeg formatında dosya seçiniz.', 'warning');
    return false;
  }

  if (file.size > MAX_IMAGE_BYTES) {
    notify?.('Dosya boyutu 5MB\'dan küçük olmalıdır.', 'warning');
    return false;
  }

  return true;
}

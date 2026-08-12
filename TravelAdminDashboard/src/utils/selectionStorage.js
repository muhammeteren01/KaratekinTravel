import { readJson, removeKey, writeJson } from './storage';

/**
 * Panelde sayfalar arası "hangi tur/alt tur/otel seçili" bilgisi localStorage
 * üzerinden taşınıyor. Aynı okuma/yazma kodu 8 dosyada kopyalanmıştı; tek yer
 * burası olsun ki anahtar adları ve id çözümleme kuralları dağılmasın.
 *
 * NOT: Bu, gerçek routing'in yerini tutmuyor. Kalıcı çözüm seçimi URL'e taşımak
 * (ör. /tours/:id), böylece paylaşılan bağlantılar da doğru kaydı açar.
 */

export const SELECTED_TOUR_KEY = 'selectedTour';
export const SELECTED_SUB_TOUR_KEY = 'selectedSubTour';
export const SELECTED_HOTEL_KEY = 'selectedHotel';

export function getSelectedTour() {
  return readJson(SELECTED_TOUR_KEY);
}

export function setSelectedTour(tour) {
  return writeJson(SELECTED_TOUR_KEY, tour);
}

export function clearSelectedTour() {
  return removeKey(SELECTED_TOUR_KEY);
}

export function getSelectedTripId() {
  const tour = getSelectedTour();
  return tour?.raw?.id || tour?.id || null;
}

export function getSelectedSubTour() {
  return readJson(SELECTED_SUB_TOUR_KEY);
}

export function setSelectedSubTour(subTour) {
  return writeJson(SELECTED_SUB_TOUR_KEY, subTour);
}

export function clearSelectedSubTour() {
  return removeKey(SELECTED_SUB_TOUR_KEY);
}

export function getSelectedDepartureId() {
  const subTour = getSelectedSubTour();
  return subTour?.id || subTour?.raw?.id || null;
}

export function getSelectedHotel() {
  return readJson(SELECTED_HOTEL_KEY);
}

export function setSelectedHotel(hotel) {
  return writeJson(SELECTED_HOTEL_KEY, hotel);
}

export function clearSelectedHotel() {
  return removeKey(SELECTED_HOTEL_KEY);
}

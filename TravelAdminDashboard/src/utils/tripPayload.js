/**
 * Maps wizard formData to API trip DTOs and back.
 * CreateTripDto / UpdateTripDto only support core trip fields;
 * pricing, hotels, vehicles, and gallery are handled separately where APIs exist.
 */

const pad = (n) => String(n).padStart(2, '0');

/** Parse "DD.MM.YYYY - HH:MM" to ISO date string (date portion only). */
export function parseTurkishDateTime(str) {
  if (!str || typeof str !== 'string') return null;
  const m = str.match(/(\d{2})\.(\d{2})\.(\d{4})(?:\s*-\s*(\d{2}):(\d{2}))?/);
  if (!m) return null;
  const [, dd, MM, yyyy, HH = '00', mm = '00'] = m;
  const d = new Date(Number(yyyy), Number(MM) - 1, Number(dd), Number(HH), Number(mm));
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

export function formatTurkishDate(isoOrDate) {
  if (!isoOrDate) return '-';
  const d = new Date(isoOrDate);
  if (Number.isNaN(d.getTime())) return String(isoOrDate);
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`;
}

export function formatTurkishDateTime(isoOrDate) {
  if (!isoOrDate) return '-';
  const d = new Date(isoOrDate);
  if (Number.isNaN(d.getTime())) return String(isoOrDate);
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} - ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function formatTimeSpan(timeValue) {
  if (!timeValue) return '-';
  const str = String(timeValue);
  const m = str.match(/(\d{1,2}):(\d{2})/);
  return m ? `${m[1].padStart(2, '0')}:${m[2]}` : str;
}

export function resolveImageSource(imageObj) {
  if (!imageObj) return null;
  return imageObj.preview || imageObj.name || null;
}

/** Prefer http(s) URLs for trip.image; huge data URLs go to gallery instead. */
export function resolveTripCoverUrl(imageObj) {
  const src = resolveImageSource(imageObj);
  if (!src) return null;
  if (src.startsWith('data:')) return null;
  if (src.length > 2000) return null;
  return src;
}

export function getStep3Data(formData) {
  if (formData?.step3 && typeof formData.step3 === 'object') {
    return formData.step3;
  }
  return {
    tourPrice: formData.tourPrice,
    differentPrices: formData.differentPrices,
    extraCharges: formData.extraCharges,
    selectedVehicles: formData.selectedVehicles,
    minParticipants: formData.minParticipants,
    totalCapacity: formData.totalCapacity,
  };
}

export function getWizardCapacity(formData) {
  const step3 = getStep3Data(formData);
  const vehicles = Array.isArray(step3.selectedVehicles) ? step3.selectedVehicles : [];
  const fromVehicles = vehicles.reduce((sum, v) => sum + (Number(v.capacity) || 0), 0);
  if (fromVehicles > 0) return fromVehicles;

  const explicit = Number(step3.totalCapacity);
  if (explicit > 0) return explicit;

  // Wizard'da "Minimum Katılımcı Sayısı" doldurulmuşsa kapasite fallback olarak kullan
  const fromMin = Number(String(step3.minParticipants ?? '').replace(/[^\d]/g, ''));
  if (fromMin > 0) return fromMin;

  return 0;
}

export function getTripDatesFromWizard(formData) {
  const hotels = Array.isArray(formData.hotels) ? formData.hotels : [];
  if (hotels.length === 0) {
    return { dateStart: null, dateEnd: null };
  }
  const checkIns = hotels.map((h) => parseTurkishDateTime(h.checkIn)).filter(Boolean);
  const checkOuts = hotels.map((h) => parseTurkishDateTime(h.checkOut)).filter(Boolean);
  const dateStart = checkIns.length ? checkIns.sort()[0] : null;
  const dateEnd = checkOuts.length ? checkOuts.sort().reverse()[0] : null;
  return { dateStart, dateEnd };
}

export function enrichDescription(formData) {
  const base = (formData.tourDescription || '').trim();
  const parts = [base];

  const tags = Array.isArray(formData.tags) ? formData.tags.filter(Boolean) : [];
  if (tags.length) parts.push(`Etiketler: ${tags.join(', ')}`);
  if (formData.category) parts.push(`Kategori: ${formData.category}`);

  const step3 = getStep3Data(formData);
  if (step3.tourPrice) parts.push(`Tur fiyatı: ${step3.tourPrice} TL`);

  const policy = formData.cancellationPolicyText?.trim();
  if (policy) parts.push(`İptal politikası: ${policy}`);

  const included = formData.step4?.includedItems;
  if (Array.isArray(included) && included.length) {
    parts.push(`Dahil olanlar: ${included.join(', ')}`);
  }

  return parts.filter(Boolean).join('\n\n') || null;
}

export function buildCreateTripPayload(formData) {
  const title = (formData.tourName || '').trim();
  const companyId = String(formData.companyId || '').trim();
  const capacity = getWizardCapacity(formData);
  const stops = Array.isArray(formData.stops) ? formData.stops : [];
  const firstStop = stops[0] || null;
  const coverImage = formData.step4?.coverImage;
  const additionalImages = Array.isArray(formData.step4?.additionalImages)
    ? formData.step4.additionalImages
    : [];
  const { dateStart, dateEnd } = getTripDatesFromWizard(formData);

  if (!companyId) throw new Error('Şirket seçimi zorunludur.');
  if (!title) throw new Error('Tur adı zorunludur.');
  if (!capacity || capacity <= 0) {
    throw new Error(
      "Kapasite 0'dan büyük olmalıdır. En az bir araç ekleyin veya Minimum Katılımcı Sayısı alanına kişi sayısı girin.",
    );
  }

  return {
    companyId,
    title,
    location: firstStop?.name || firstStop?.address || formData.category || null,
    city: firstStop?.city || null,
    region: firstStop?.region || null,
    dateStart,
    dateEnd,
    capacity,
    // data: URL / büyük base64 INSERT'i şişiriyor → null; görseller galeriye yüklenir
    image: resolveTripCoverUrl(coverImage),
    headerImage: resolveTripCoverUrl(additionalImages[0]),
    description: enrichDescription(formData),
    isFeatured: false,
  };
}

export function buildUpdateTripPayload(formData, existingTrip = {}) {
  const base = existingTrip.raw || existingTrip;
  const payload = {};

  const title = formData.tourName?.trim();
  if (title) payload.title = title;

  const description = enrichDescription(formData);
  if (description) payload.description = description;

  const capacity = getWizardCapacity(formData);
  if (capacity > 0) payload.capacity = capacity;

  const stops = Array.isArray(formData.stops) ? formData.stops : [];
  if (stops[0]?.name || stops[0]?.address) {
    payload.location = stops[0].name || stops[0].address;
    if (stops[0].city) payload.city = stops[0].city;
    if (stops[0].region) payload.region = stops[0].region;
  } else {
    if (base.location) payload.location = base.location;
    if (base.city) payload.city = base.city;
    if (base.region) payload.region = base.region;
  }

  const { dateStart, dateEnd } = getTripDatesFromWizard(formData);
  if (dateStart) payload.dateStart = dateStart;
  else if (base.dateStart) payload.dateStart = base.dateStart;
  if (dateEnd) payload.dateEnd = dateEnd;
  else if (base.dateEnd) payload.dateEnd = base.dateEnd;

  const cover = resolveImageSource(formData.step4?.coverImage);
  if (cover) payload.image = cover;
  else if (base.image) payload.image = base.image;

  if (typeof base.isFeatured === 'boolean') payload.isFeatured = base.isFeatured;

  return payload;
}

export function mapApiTripToFormData(trip) {
  if (!trip) return {};
  const pricing = trip.pricing || {};
  return {
    companyId: trip.companyId || '',
    tourName: trip.title || trip.name || '',
    tourDescription: trip.description || '',
    category: trip.region || '',
    tags: [],
    stops: Array.isArray(trip.itinerary)
      ? trip.itinerary.map((item, idx) => ({
          id: idx + 1,
          name: item.title || item.label || `Durak ${idx + 1}`,
          time: item.activities?.[0]?.time || '',
        }))
      : [],
    hotels: Array.isArray(trip.hotels)
      ? trip.hotels.map((h, idx) => ({
          id: idx + 1,
          name: h.name,
          checkIn: h.checkIn || '',
          checkOut: h.checkOut || '',
          note: h.description || '',
        }))
      : [],
    step3: {
      tourPrice: pricing.basePrice ? String(pricing.basePrice) : trip.price || '',
      differentPrices: [],
      extraCharges: Array.isArray(pricing.extras)
        ? pricing.extras.map((e, i) => ({ id: i + 1, type: e.label, amount: String(e.amount) }))
        : [],
      selectedVehicles: [],
      minParticipants: '',
      totalCapacity: trip.capacity || 0,
    },
    step4: {
      coverImage: trip.image ? { name: trip.image, preview: trip.image } : null,
      additionalImages: Array.isArray(trip.gallery)
        ? trip.gallery.map((url, i) => ({ id: i + 1, name: url, preview: url }))
        : [],
      includedItems: trip.details?.included || [],
      excludedItems: trip.details?.excluded || [],
      specialDescription: trip.details?.specialNote || '',
    },
    cancellationPolicyText: trip.policy?.paragraphs?.join('\n') || '',
    raw: trip,
  };
}

/** Normalize list item or API trip for localStorage / navigation. */
export function normalizeSelectedTour(source) {
  if (!source) return null;
  const raw = source.raw || source;
  const id = raw.id || source.id;
  return {
    id,
    code: source.code || (id ? `TR-${String(id).slice(0, 8).toUpperCase()}` : 'TR-0000'),
    name: source.name || raw.title || raw.name || 'Tur',
    status: source.status || (raw.isDeleted ? 'inactive' : 'active'),
    raw,
  };
}

export function getTripIdFromStorage(selectedTour) {
  return selectedTour?.raw?.id || selectedTour?.id || null;
}

export function mapReservationToParticipant(reservation, userMap = {}) {
  const user = userMap[reservation.userId];
  const seat = Array.isArray(reservation.seatNumbers) && reservation.seatNumbers.length
    ? reservation.seatNumbers.join(', ')
    : '-';
  return {
    id: reservation.id,
    name: user?.name || user?.email || reservation.userId || 'Katılımcı',
    gender: 'male',
    tc: user?.phone || '-',
    seat,
    purchasedAt: formatTurkishDateTime(reservation.createdAt),
    note: reservation.status ? `Durum: ${reservation.status}` : '',
    departureId: reservation.departureId,
  };
}

export function mapDepartureToSubTourRow(departure, vehicleLabel = '') {
  const price = departure.price != null
    ? `${Number(departure.price).toLocaleString('tr-TR')} ${departure.currency || 'TRY'}`
    : '-';
  return {
    id: departure.id,
    date: formatTurkishDate(departure.departureDate),
    time: formatTimeSpan(departure.departureTime),
    price,
    bus: vehicleLabel || `${departure.capacity} kişi`,
    sold: departure.soldCount ?? 0,
    status: departure.status === 'inactive' ? 'inactive' : 'active',
    raw: departure,
  };
}

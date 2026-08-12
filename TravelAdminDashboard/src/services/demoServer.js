import { ApiError } from './apiError';
import { buildSeedDatabase, DEMO_ADMIN_ID, DEMO_COMPANY_ID } from './demoData';
import { readJson, writeJson } from '../utils/storage';

/**
 * Tarayıcı içi sahte API.
 *
 * adminApi.js'teki request() demo modunda buraya yönleniyor; böylece yaklaşık 70
 * API fonksiyonunun tamamı ve tüm çağrı yerleri hiç değişmeden çalışıyor.
 * Veri localStorage'da tutuluyor, yani sayfa yenilense de eklediğiniz tur durur.
 */

const DB_KEY = 'travelAdminDashboard.demoDb';
const DEMO_TOKEN = 'demo-mode-token';

let cache = null;

function db() {
  if (cache) return cache;
  const stored = readJson(DB_KEY);
  cache = stored && stored.version === 1 ? stored : buildSeedDatabase();
  return cache;
}

function persist() {
  writeJson(DB_KEY, cache);
}

export function resetDemoDatabase() {
  cache = buildSeedDatabase();
  persist();
}

const uid = (prefix) =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

const nowIso = () => new Date().toISOString();

const notFound = (what = 'Kayıt') => {
  throw new ApiError(404, `${what} bulunamadı.`, null);
};

/** "2026-05-01T00:00:00Z" ya da Date -> ms; geçersizse null */
const toMs = (value) => {
  if (!value) return null;
  const ms = new Date(value).getTime();
  return Number.isNaN(ms) ? null : ms;
};

const inRange = (value, start, end) => {
  const ms = toMs(value);
  if (ms == null) return false;
  const s = toMs(start);
  const e = toMs(end);
  if (s != null && ms < s) return false;
  if (e != null && ms > e) return false;
  return true;
};

// ---------------------------------------------------------------- raporlar

function buildTripReport(query) {
  const data = db();
  const { start, end } = query;
  const reservations = data.reservations.filter((r) => inRange(r.createdAt, start, end));
  const trips = data.trips.filter((t) => !t.isDeleted);

  const ratings = data.reviews.map((r) => r.rating);
  const averageRating = ratings.length
    ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
    : 0;

  const topTrips = trips
    .map((trip) => {
      const tripReservations = reservations.filter((r) => r.tripId === trip.id);
      const tripReviews = data.reviews.filter((r) => r.tripId === trip.id);
      return {
        tripId: trip.id,
        title: trip.title,
        capacity: trip.capacity,
        joinedCount: trip.joinedCount,
        viewCount: trip.viewCount,
        totalReservations: tripReservations.length,
        totalReviews: tripReviews.length,
        avgReviewRating: tripReviews.length
          ? tripReviews.reduce((s, r) => s + r.rating, 0) / tripReviews.length
          : 0,
        confirmedReservations: tripReservations.filter((r) => r.status === 'confirmed').length,
        cancelledReservations: tripReservations.filter((r) => r.status === 'cancelled').length,
      };
    })
    .sort((a, b) => b.joinedCount - a.joinedCount);

  const nowMs = Date.now();

  return {
    startDate: start || null,
    endDate: end || null,
    totalTrips: trips.length,
    completedTrips: trips.filter((t) => (toMs(t.dateEnd) ?? nowMs) < nowMs).length,
    cancelledTrips: 0,
    totalRevenue: reservations
      .filter((r) => r.status === 'confirmed')
      .reduce((sum, r) => sum + Number(r.totalPrice || 0), 0),
    totalReservations: reservations.length,
    averageRating,
    topTrips,
  };
}

function buildFinanceReport(query) {
  const data = db();
  const { start, end } = query;
  const scoped = data.reservations.filter((r) => inRange(r.createdAt, start, end));

  const totalRevenue = scoped
    .filter((r) => r.status === 'confirmed')
    .reduce((sum, r) => sum + Number(r.totalPrice || 0), 0);
  const refundAmount = scoped
    .filter((r) => r.status === 'cancelled')
    .reduce((sum, r) => sum + Number(r.totalPrice || 0), 0);

  const tripById = new Map(data.trips.map((t) => [t.id, t]));
  const nowMs = Date.now();

  const completedTripEarnings = data.tripDepartures
    .filter((d) => (toMs(d.departureDate) ?? nowMs) < nowMs)
    .map((departure) => {
      const trip = tripById.get(departure.tripId);
      const earned = data.reservations
        .filter((r) => r.departureId === departure.id && r.status === 'confirmed')
        .reduce((sum, r) => sum + Number(r.totalPrice || 0), 0);
      return {
        tourCode: `TR-${String(departure.tripId).slice(-4).toUpperCase()}`,
        tourName: trip?.title || 'Tur',
        tourDate: departure.departureDate,
        netEarning: earned,
      };
    })
    .filter((row) => row.netEarning > 0);

  return {
    totalRevenue,
    refundAmount,
    netProfit: totalRevenue - refundAmount,
    periodStart: start || null,
    periodEnd: end || null,
    completedTripEarnings,
  };
}

function buildCompanyReport() {
  const data = db();
  return {
    totalCompanies: data.companies.length,
    activeCompanies: data.companies.filter((c) => c.isActive).length,
    averageCompanyRating: data.companies.length
      ? data.companies.reduce((s, c) => s + Number(c.rating || 0), 0) / data.companies.length
      : 0,
    topCompanies: data.companies.map((c) => ({
      companyId: c.id,
      name: c.name,
      rating: c.rating,
      tripCount: data.trips.filter((t) => t.companyId === c.id).length,
    })),
  };
}

// ------------------------------------------------------------ yardımcılar

function collection(name) {
  const data = db();
  if (!Array.isArray(data[name])) data[name] = [];
  return data[name];
}

function findById(name, id) {
  return collection(name).find((item) => String(item.id) === String(id)) || null;
}

function insert(name, record) {
  collection(name).push(record);
  persist();
  return record;
}

function update(name, id, patch) {
  const item = findById(name, id);
  if (!item) notFound();
  Object.assign(item, patch, { updatedAt: nowIso() });
  persist();
  return item;
}

function remove(name, id) {
  const list = collection(name);
  const index = list.findIndex((item) => String(item.id) === String(id));
  if (index === -1) notFound();
  list.splice(index, 1);
  persist();
}

/** Bir tura ait alt tarih/rezervasyon sayısından joinedCount'u tazeler. */
function recalcTripJoined(tripId) {
  const data = db();
  const trip = data.trips.find((t) => t.id === tripId);
  if (!trip) return;
  trip.joinedCount = data.reservations
    .filter((r) => r.tripId === tripId && r.status === 'confirmed')
    .reduce((sum, r) => sum + (r.seatNumbers?.length || 1), 0);
}

// ---------------------------------------------------------------- yönlendirici

const ROUTES = [
  // ---- auth
  ['POST', /^\/api\/auth\/login$/, (_m, body) => {
    const user = collection('users').find(
      (u) => u.email.toLowerCase() === String(body?.email || '').toLowerCase(),
    );
    if (!user || user.password !== body?.password) {
      throw new ApiError(401, 'E-posta veya şifre hatalı. (Demo: demo@karatekin.test / demo1234)', null);
    }
    setCurrentUser(user.id);
    return { token: DEMO_TOKEN, user: publicUser(user) };
  }],

  ['POST', /^\/api\/auth\/register$/, (_m, body) => {
    const email = String(body?.email || '').toLowerCase();
    if (collection('users').some((u) => u.email.toLowerCase() === email)) {
      throw new ApiError(400, 'Bu e-posta zaten kayıtlı.', null);
    }
    const isCompany = body?.accountType === 'company' || Boolean(body?.companyName);
    let companyId = null;
    if (isCompany) {
      const company = {
        id: uid('c'),
        name: body.companyName || body.name,
        logo: null,
        rating: 0,
        reviewCount: 0,
        location: null,
        about: null,
        isActive: true,
        isVerified: false,
        createdAt: nowIso(),
      };
      insert('companies', company);
      companyId = company.id;
    }
    const user = {
      id: uid('u'),
      name: body?.name || 'Kullanıcı',
      email: body?.email,
      phone: body?.phone || null,
      avatar: null,
      location: null,
      // Gerçek API de self-service admin vermiyor; demo aynı kuralı uyguluyor.
      role: isCompany ? 'CompanyAdmin' : 'User',
      companyId,
      password: body?.password,
      createdAt: nowIso(),
    };
    insert('users', user);
    setCurrentUser(user.id);
    return { token: DEMO_TOKEN, user: publicUser(user) };
  }],

  ['GET', /^\/api\/auth\/me$/, () => publicUser(currentUser())],
  ['POST', /^\/api\/auth\/forgot-password$/, () => ({ message: 'Demo modunda e-posta gönderilmez.' })],
  ['POST', /^\/api\/auth\/reset-password$/, () => ({ message: 'Demo modunda şifre sıfırlanmaz.' })],
  ['GET', /^\/api\/bootstrap$/, () => ({ status: 'ok', mode: 'demo' })],

  // ---- trips
  ['GET', /^\/api\/trips\/search$/, (_m, _b, query) => {
    const term = String(query.searchTerm || '').toLowerCase();
    const items = collection('trips').filter(
      (t) => !t.isDeleted && (!term || t.title.toLowerCase().includes(term)),
    );
    return { items, total: items.length, page: 1, pageSize: items.length };
  }],
  ['GET', /^\/api\/trips$/, () => collection('trips').filter((t) => !t.isDeleted)],
  ['GET', /^\/api\/trips\/([^/]+)$/, (m) => findById('trips', m[1]) || notFound('Tur')],

  ['POST', /^\/api\/trips$/, (_m, body) => {
    const price = Number(body?.pricing?.basePrice ?? 0);
    return insert('trips', {
      id: uid('t'),
      companyId: body?.companyId || DEMO_COMPANY_ID,
      title: body?.title || 'Adsız Tur',
      location: body?.location ?? null,
      city: body?.city ?? null,
      region: body?.region ?? null,
      rating: 0,
      reviewCount: 0,
      price: `${price} TRY`,
      pricing: { currency: 'TRY', basePrice: price, discount: null, extras: [] },
      dateRange: '',
      dateStart: body?.dateStart ?? null,
      dateEnd: body?.dateEnd ?? null,
      createdAt: nowIso(),
      updatedAt: null,
      capacity: Number(body?.capacity || 0),
      joinedCount: 0,
      viewCount: 0,
      avatars: [],
      image: body?.image ?? null,
      headerImage: body?.headerImage ?? null,
      gallery: [],
      description: body?.description ?? null,
      // Yeni tur taslak olarak açılır; "Yayınla" ile kullanıcılara görünür olur.
      isPublished: body?.isPublished ?? false,
      isFeatured: body?.isFeatured ?? false,
      isDeleted: false,
      purchased: false,
      details: {},
      policy: {},
      itinerary: [],
      hotels: [],
    });
  }],

  ['PUT', /^\/api\/trips\/([^/]+)$/, (m, body) => {
    const patch = { ...body };
    delete patch.id;
    if (patch.pricing?.basePrice != null) {
      patch.price = `${patch.pricing.basePrice} TRY`;
    }
    return update('trips', m[1], patch);
  }],

  ['DELETE', /^\/api\/trips\/([^/]+)$/, (m) => {
    // Gerçek API soft-delete yapıyor; demo da aynı davransın.
    update('trips', m[1], { isDeleted: true, isPublished: false, deletedAt: nowIso() });
    return undefined;
  }],

  // ---- companies
  ['GET', /^\/api\/companies$/, () => collection('companies')],
  ['GET', /^\/api\/companies\/([^/]+)$/, (m) => findById('companies', m[1]) || notFound('Şirket')],
  ['POST', /^\/api\/companies$/, (_m, body) => insert('companies', { id: uid('c'), rating: 0, reviewCount: 0, isActive: true, isVerified: false, createdAt: nowIso(), ...body })],
  ['PUT', /^\/api\/companies\/([^/]+)$/, (m, body) => update('companies', m[1], body)],
  ['DELETE', /^\/api\/companies\/([^/]+)$/, (m) => { remove('companies', m[1]); }],

  // ---- trip departures
  ['GET', /^\/api\/trip-departures$/, (_m, _b, query) =>
    collection('tripDepartures').filter((d) => !query.tripId || String(d.tripId) === String(query.tripId))],
  ['GET', /^\/api\/trip-departures\/([^/]+)$/, (m) => findById('tripDepartures', m[1]) || notFound('Alt tarih')],
  ['POST', /^\/api\/trip-departures$/, (_m, body) => insert('tripDepartures', {
    id: uid('d'),
    tripId: body?.tripId,
    vehicleId: body?.vehicleId ?? null,
    departureDate: body?.departureDate ?? nowIso(),
    departureTime: body?.departureTime ?? null,
    price: body?.price ?? null,
    currency: body?.currency || 'TRY',
    capacity: Number(body?.capacity || 0),
    soldCount: 0,
    status: body?.status || 'active',
    notes: body?.notes ?? null,
    createdAt: nowIso(),
  })],
  ['PUT', /^\/api\/trip-departures\/([^/]+)$/, (m, body) => update('tripDepartures', m[1], body)],
  ['DELETE', /^\/api\/trip-departures\/([^/]+)$/, (m) => { remove('tripDepartures', m[1]); }],

  // ---- vehicles
  ['GET', /^\/api\/vehicles\/layouts$/, () => collection('seatLayouts')],
  ['POST', /^\/api\/vehicles\/layouts$/, (_m, body) => insert('seatLayouts', { id: uid('sl'), createdAt: nowIso(), ...body })],
  ['GET', /^\/api\/vehicles$/, (_m, _b, query) =>
    collection('vehicles').filter((v) => !query.companyId || String(v.companyId) === String(query.companyId))],
  ['GET', /^\/api\/vehicles\/([^/]+)$/, (m) => findById('vehicles', m[1]) || notFound('Araç')],
  ['POST', /^\/api\/vehicles$/, (_m, body) => insert('vehicles', {
    id: uid('v'), companyId: body?.companyId || DEMO_COMPANY_ID, status: 'active', createdAt: nowIso(), ...body,
  })],
  ['PUT', /^\/api\/vehicles\/([^/]+)$/, (m, body) => update('vehicles', m[1], body)],
  ['DELETE', /^\/api\/vehicles\/([^/]+)$/, (m) => { remove('vehicles', m[1]); }],

  // ---- reservations
  ['GET', /^\/api\/reservations\/my$/, () => []],
  ['GET', /^\/api\/reservations\/by-trip\/([^/]+)$/, (m) =>
    collection('reservations').filter((r) => String(r.tripId) === String(m[1]))],
  ['GET', /^\/api\/reservations$/, () => collection('reservations')],
  ['GET', /^\/api\/reservations\/([^/]+)$/, (m) => findById('reservations', m[1]) || notFound('Rezervasyon')],
  ['POST', /^\/api\/reservations\/payment$/, () => ({ status: 'ok', message: 'Demo ödeme başarılı.' })],
  ['POST', /^\/api\/reservations$/, (_m, body) => {
    const created = insert('reservations', { id: uid('r'), status: 'confirmed', createdAt: nowIso(), ...body });
    recalcTripJoined(created.tripId);
    persist();
    return created;
  }],
  ['PUT', /^\/api\/reservations\/([^/]+)\/status$/, (m, body) => {
    const updated = update('reservations', m[1], { status: body?.status });
    recalcTripJoined(updated.tripId);
    persist();
    return updated;
  }],
  ['DELETE', /^\/api\/reservations\/([^/]+)$/, (m) => {
    const updated = update('reservations', m[1], { status: 'cancelled' });
    recalcTripJoined(updated.tripId);
    persist();
  }],

  // ---- reviews
  ['GET', /^\/api\/reviews$/, (_m, _b, query) =>
    collection('reviews').filter((r) => !query.tripId || String(r.tripId) === String(query.tripId))],
  ['GET', /^\/api\/reviews\/([^/]+)$/, (m) => findById('reviews', m[1]) || notFound('Değerlendirme')],
  ['POST', /^\/api\/reviews$/, (_m, body) => insert('reviews', { id: uid('rv'), createdAt: nowIso(), ...body })],
  ['DELETE', /^\/api\/reviews\/([^/]+)$/, (m) => { remove('reviews', m[1]); }],

  // ---- users
  ['GET', /^\/api\/users$/, () => collection('users').map(publicUser)],
  ['GET', /^\/api\/users\/([^/]+)$/, (m) => {
    const user = findById('users', m[1]);
    return user ? publicUser(user) : notFound('Kullanıcı');
  }],
  ['PUT', /^\/api\/users\/([^/]+)\/change-password$/, (m, body) => {
    const user = findById('users', m[1]) || notFound('Kullanıcı');
    if (user.password !== body?.currentPassword) {
      throw new ApiError(400, 'Mevcut şifre hatalı.', null);
    }
    user.password = body?.newPassword;
    persist();
    return { message: 'Şifre güncellendi.' };
  }],
  ['PUT', /^\/api\/users\/([^/]+)$/, (m, body) => publicUser(update('users', m[1], body))],

  // ---- hotels
  ['GET', /^\/api\/hotels$/, () => collection('hotels')],
  ['GET', /^\/api\/hotels\/([^/]+)$/, (m) => findById('hotels', m[1]) || notFound('Otel')],
  ['POST', /^\/api\/hotels$/, (_m, body) => insert('hotels', { id: uid('h'), companyId: DEMO_COMPANY_ID, createdAt: nowIso(), ...body })],
  ['PUT', /^\/api\/hotels\/([^/]+)$/, (m, body) => update('hotels', m[1], body)],
  ['DELETE', /^\/api\/hotels\/([^/]+)$/, (m) => { remove('hotels', m[1]); }],

  // ---- coupons
  ['POST', /^\/api\/coupons\/validate$/, (_m, body) => {
    const coupon = collection('coupons').find(
      (c) => c.code.toLowerCase() === String(body?.code || '').toLowerCase() && c.isActive,
    );
    if (!coupon) throw new ApiError(404, 'Kupon geçersiz veya süresi dolmuş.', null);
    return coupon;
  }],
  ['GET', /^\/api\/coupons$/, () => collection('coupons')],
  ['GET', /^\/api\/coupons\/([^/]+)$/, (m) => findById('coupons', m[1]) || notFound('Kupon')],
  ['POST', /^\/api\/coupons$/, (_m, body) => insert('coupons', { id: uid('cp'), companyId: DEMO_COMPANY_ID, usedCount: 0, isActive: true, createdAt: nowIso(), ...body })],
  ['PUT', /^\/api\/coupons\/([^/]+)$/, (m, body) => update('coupons', m[1], body)],
  ['DELETE', /^\/api\/coupons\/([^/]+)$/, (m) => { remove('coupons', m[1]); }],

  // ---- gallery
  ['GET', /^\/api\/gallery$/, (_m, _b, query) =>
    collection('gallery').filter((g) => !query.tripId || String(g.tripId) === String(query.tripId))],
  ['POST', /^\/api\/gallery$/, (_m, body) => insert('gallery', { id: uid('g'), createdAt: nowIso(), ...body })],
  ['DELETE', /^\/api\/gallery\/([^/]+)$/, (m) => { remove('gallery', m[1]); }],

  // ---- notifications
  ['GET', /^\/api\/notifications\/my$/, () => collection('notifications').filter((n) => !n.isArchived)],
  ['PUT', /^\/api\/notifications\/([^/]+)\/read$/, (m) => update('notifications', m[1], { isRead: true })],
  ['PUT', /^\/api\/notifications\/([^/]+)\/archive$/, (m) => update('notifications', m[1], { isArchived: true })],
  ['POST', /^\/api\/notifications$/, (_m, body) => insert('notifications', { id: uid('n'), isRead: false, isArchived: false, createdAt: nowIso(), ...body })],
  ['DELETE', /^\/api\/notifications\/([^/]+)$/, (m) => { remove('notifications', m[1]); }],

  // ---- refunds & review reports
  ['GET', /^\/api\/refunds$/, () => collection('refunds')],
  ['POST', /^\/api\/refunds$/, (_m, body) => insert('refunds', { id: uid('rf'), status: 'pending', createdAt: nowIso(), ...body })],
  ['PUT', /^\/api\/refunds\/([^/]+)\/status$/, (m, body) => update('refunds', m[1], { status: body?.status })],
  ['GET', /^\/api\/review-reports$/, () => collection('reviewReports')],
  ['POST', /^\/api\/review-reports$/, (_m, body) => insert('reviewReports', { id: uid('rr'), status: 'pending', createdAt: nowIso(), ...body })],
  ['PUT', /^\/api\/review-reports\/([^/]+)\/status$/, (m, body) => update('reviewReports', m[1], { status: body?.status })],

  // ---- reports
  ['GET', /^\/api\/reports\/trips$/, (_m, _b, query) => buildTripReport(query)],
  ['GET', /^\/api\/reports\/finance$/, (_m, _b, query) => buildFinanceReport(query)],
  ['GET', /^\/api\/reports\/companies$/, () => buildCompanyReport()],
  ['GET', /^\/api\/reports\/user-activity$/, () => ({
    totalUsers: collection('users').length,
    activeUsers: collection('users').length,
    newUsersThisMonth: 2,
  })],

  // ---- kalanlar (panelde okunuyor ama demo için boş liste yeterli)
  ['GET', /^\/api\/chats\/my$/, () => []],
  ['GET', /^\/api\/chats\/user\/([^/]+)$/, () => []],
  ['GET', /^\/api\/chats\/([^/]+)\/messages$/, () => []],
  ['GET', /^\/api\/chats\/([^/]+)$/, () => notFound('Sohbet')],
  ['POST', /^\/api\/chats\/([^/]+)\/messages$/, (m, body) => ({ id: uid('msg'), groupId: m[1], createdAt: nowIso(), ...body })],
  ['GET', /^\/api\/saved-trips\/my$/, () => []],
  ['GET', /^\/api\/seats\/availability$/, () => ({ seats: [], soldSeats: [] })],
  ['GET', /^\/api\/company-reviews$/, () => collection('companyReviews')],
  ['GET', /^\/api\/calendar-trips$/, () => collection('calendarTrips')],
];

/** Şifre alanını dışarı sızdırmadan kullanıcıyı döndürür. */
/** Demo oturumunda hangi kullanıcının giriş yaptığını tutar. */
function setCurrentUser(userId) {
  db().currentUserId = userId;
  persist();
}

function currentUser() {
  const data = db();
  return (
    findById('users', data.currentUserId) ||
    findById('users', DEMO_ADMIN_ID) ||
    collection('users')[0]
  );
}

function publicUser(user) {
  if (!user) return null;
  const rest = { ...user };
  delete rest.password;
  return rest;
}

/**
 * @param {string} rawUrl  Tam URL (adminApi mutlak URL üretiyor)
 * @param {string} method  GET/POST/PUT/DELETE
 * @param {string|undefined} rawBody  JSON string
 */
export function handleDemoRequest(rawUrl, method = 'GET', rawBody) {
  const url = new URL(rawUrl, window.location.origin);
  const path = url.pathname.replace(/\/+$/, '') || '/';
  const query = Object.fromEntries(url.searchParams.entries());

  let body;
  if (rawBody) {
    try {
      body = JSON.parse(rawBody);
    } catch {
      body = rawBody;
    }
  }

  for (const [routeMethod, pattern, handler] of ROUTES) {
    if (routeMethod !== method.toUpperCase()) continue;
    const match = path.match(pattern);
    if (match) return handler(match, body, query);
  }

  throw new ApiError(404, `Demo modunda tanımlı olmayan uç: ${method} ${path}`, null);
}

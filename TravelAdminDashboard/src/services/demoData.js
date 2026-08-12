/**
 * Demo modunun başlangıç verisi.
 *
 * Alan adları API'nin döndürdüğü DTO'larla birebir aynı tutuldu
 * (TripResponseDto, VehicleDto, TripDepartureDto ...) ki demo modundan
 * gerçek API'ye geçtiğinizde ekranlarda hiçbir şey değişmesin.
 */

const DAY = 24 * 60 * 60 * 1000;

const iso = (offsetDays, hour = 9) => {
  const d = new Date();
  d.setHours(hour, 0, 0, 0);
  return new Date(d.getTime() + offsetDays * DAY).toISOString();
};

const dateOnly = (offsetDays) => iso(offsetDays).slice(0, 10);

export const DEMO_COMPANY_ID = 'c0000000-0000-4000-8000-000000000001';
export const DEMO_ADMIN_ID = 'u0000000-0000-4000-8000-000000000001';

const trip = ({ id, title, city, region, capacity, joined, price, start, end, published, featured, rating, reviewCount, image }) => ({
  id,
  companyId: DEMO_COMPANY_ID,
  title,
  location: city,
  city,
  region,
  rating,
  reviewCount,
  price: `${price} TRY`,
  pricing: { currency: 'TRY', basePrice: price, discount: null, extras: [] },
  dateRange: `${dateOnly(start)} - ${dateOnly(end)}`,
  dateStart: iso(start),
  dateEnd: iso(end),
  createdAt: iso(start - 30),
  updatedAt: null,
  capacity,
  joinedCount: joined,
  viewCount: Math.round(joined * 7.5),
  avatars: [],
  image,
  headerImage: image,
  gallery: [],
  description: `${title} — demo verisi. Bu kayıt tarayıcınızda saklanıyor, sunucuya gitmiyor.`,
  isPublished: published,
  isFeatured: featured,
  isDeleted: false,
  purchased: false,
  details: {},
  policy: {},
  itinerary: [],
  hotels: [],
});

export function buildSeedDatabase() {
  const companies = [
    {
      id: DEMO_COMPANY_ID,
      name: 'Karatekin Travel (Demo)',
      logo: null,
      rating: 4.6,
      reviewCount: 128,
      location: 'Çankırı',
      about: 'Demo modunda çalışan örnek işletme kaydı.',
      fullAbout: 'Bu kayıt demo verisidir; gerçek bir işletmeyi temsil etmez.',
      isActive: true,
      isVerified: true,
      createdAt: iso(-400),
    },
  ];

  const users = [
    {
      id: DEMO_ADMIN_ID,
      name: 'Demo Yönetici',
      email: 'demo@karatekin.test',
      phone: '0555 000 00 00',
      avatar: null,
      location: 'Çankırı',
      role: 'CompanyAdmin',
      companyId: DEMO_COMPANY_ID,
      password: 'demo1234',
      createdAt: iso(-400),
    },
    { id: 'u-2', name: 'Ayşe Yıldız', email: 'ayse@example.com', phone: '0532 111 22 33', avatar: null, location: 'Ankara', role: 'User', companyId: null, password: 'demo1234', createdAt: iso(-120) },
    { id: 'u-3', name: 'Mert Aslan', email: 'mert@example.com', phone: '0533 222 33 44', avatar: null, location: 'İstanbul', role: 'User', companyId: null, password: 'demo1234', createdAt: iso(-90) },
    { id: 'u-4', name: 'Elif Korkmaz', email: 'elif@example.com', phone: '0534 333 44 55', avatar: null, location: 'İzmir', role: 'User', companyId: null, password: 'demo1234', createdAt: iso(-60) },
  ];

  const trips = [
    trip({ id: 't-1', title: 'Kastamonu Doğa Turu', city: 'Kastamonu', region: 'Karadeniz', capacity: 45, joined: 38, price: 2450, start: 12, end: 14, published: true, featured: true, rating: 4.7, reviewCount: 24, image: '' }),
    trip({ id: 't-2', title: 'Ilgaz Kayak Kampı', city: 'Çankırı', region: 'İç Anadolu', capacity: 40, joined: 40, price: 3900, start: 25, end: 28, published: true, featured: false, rating: 4.5, reviewCount: 17, image: '' }),
    trip({ id: 't-3', title: 'Safranbolu Kültür Gezisi', city: 'Karabük', region: 'Karadeniz', capacity: 30, joined: 12, price: 1850, start: 5, end: 6, published: true, featured: false, rating: 4.2, reviewCount: 9, image: '' }),
    // Yayında değil: "Taslak" rozetinin ve yayınla/yayından kaldır akışının denenebilmesi için
    trip({ id: 't-4', title: 'Amasra Deniz Turu (Taslak)', city: 'Bartın', region: 'Karadeniz', capacity: 35, joined: 0, price: 2100, start: 40, end: 41, published: false, featured: false, rating: 0, reviewCount: 0, image: '' }),
    trip({ id: 't-5', title: 'Kapadokya Balon Turu', city: 'Nevşehir', region: 'İç Anadolu', capacity: 50, joined: 31, price: 5600, start: -20, end: -18, published: true, featured: true, rating: 4.9, reviewCount: 41, image: '' }),
  ];

  const vehicles = [
    { id: 'v-1', companyId: DEMO_COMPANY_ID, plate: '18 TTG 185', model: 'Travego', busType: '2+1', capacity: 45, hasWifi: true, hasAirCondition: true, hasPowerOutlet: true, coverImage: null, status: 'active', seatLayoutId: null, createdAt: iso(-300) },
    { id: 'v-2', companyId: DEMO_COMPANY_ID, plate: '06 AAT 180', model: 'Tourismo', busType: '2+2', capacity: 50, hasWifi: true, hasAirCondition: true, hasPowerOutlet: false, coverImage: null, status: 'maintenance', seatLayoutId: null, createdAt: iso(-260) },
    { id: 'v-3', companyId: DEMO_COMPANY_ID, plate: '67 TS 1967', model: 'Sprinter', busType: '2+1', capacity: 30, hasWifi: false, hasAirCondition: true, hasPowerOutlet: false, coverImage: null, status: 'active', seatLayoutId: null, createdAt: iso(-180) },
  ];

  const departures = [
    { id: 'd-1', tripId: 't-1', vehicleId: 'v-1', departureDate: iso(12), departureTime: '08:30:00', price: 2450, currency: 'TRY', capacity: 45, soldCount: 38, status: 'active', notes: '', createdAt: iso(-30) },
    { id: 'd-2', tripId: 't-1', vehicleId: 'v-3', departureDate: iso(19), departureTime: '09:00:00', price: 2450, currency: 'TRY', capacity: 30, soldCount: 11, status: 'active', notes: '', createdAt: iso(-25) },
    { id: 'd-3', tripId: 't-2', vehicleId: 'v-1', departureDate: iso(25), departureTime: '07:00:00', price: 3900, currency: 'TRY', capacity: 40, soldCount: 40, status: 'active', notes: 'Kontenjan doldu', createdAt: iso(-20) },
    { id: 'd-4', tripId: 't-3', vehicleId: 'v-3', departureDate: iso(5), departureTime: '10:00:00', price: 1850, currency: 'TRY', capacity: 30, soldCount: 12, status: 'active', notes: '', createdAt: iso(-15) },
    { id: 'd-5', tripId: 't-5', vehicleId: 'v-2', departureDate: iso(-20), departureTime: '06:00:00', price: 5600, currency: 'TRY', capacity: 50, soldCount: 31, status: 'completed', notes: 'Tamamlandı', createdAt: iso(-60) },
  ];

  const reservations = [
    { id: 'r-1', tripId: 't-1', departureId: 'd-1', userId: 'u-2', seatNumbers: ['12', '13'], totalPrice: 4900, currency: 'TRY', status: 'confirmed', createdAt: iso(-10) },
    { id: 'r-2', tripId: 't-1', departureId: 'd-1', userId: 'u-3', seatNumbers: ['21'], totalPrice: 2450, currency: 'TRY', status: 'confirmed', createdAt: iso(-8) },
    { id: 'r-3', tripId: 't-2', departureId: 'd-3', userId: 'u-4', seatNumbers: ['5', '6'], totalPrice: 7800, currency: 'TRY', status: 'confirmed', createdAt: iso(-6) },
    { id: 'r-4', tripId: 't-3', departureId: 'd-4', userId: 'u-2', seatNumbers: ['9'], totalPrice: 1850, currency: 'TRY', status: 'pending', createdAt: iso(-3) },
    { id: 'r-5', tripId: 't-5', departureId: 'd-5', userId: 'u-3', seatNumbers: ['1', '2'], totalPrice: 11200, currency: 'TRY', status: 'cancelled', createdAt: iso(-30) },
    { id: 'r-6', tripId: 't-5', departureId: 'd-5', userId: 'u-4', seatNumbers: ['14'], totalPrice: 5600, currency: 'TRY', status: 'confirmed', createdAt: iso(-28) },
  ];

  const reviews = [
    { id: 'rv-1', tripId: 't-1', userId: 'u-2', userName: 'Ayşe Yıldız', rating: 5, comment: 'Rehber çok ilgiliydi, tekrar katılırım.', createdAt: iso(-9) },
    { id: 'rv-2', tripId: 't-1', userId: 'u-3', userName: 'Mert Aslan', rating: 4, comment: 'Güzel bir turdu, otobüs biraz geç kalktı.', createdAt: iso(-7) },
    { id: 'rv-3', tripId: 't-5', userId: 'u-4', userName: 'Elif Korkmaz', rating: 5, comment: 'Balon turu muhteşemdi.', createdAt: iso(-17) },
    { id: 'rv-4', tripId: 't-3', userId: 'u-2', userName: 'Ayşe Yıldız', rating: 3, comment: 'Program biraz sıkışıktı.', createdAt: iso(-4) },
  ];

  const coupons = [
    { id: 'cp-1', companyId: DEMO_COMPANY_ID, code: 'BAHAR25', discountType: 'percentage', discountValue: 25, maxUsage: 100, usedCount: 12, validFrom: iso(-30), validUntil: iso(30), isActive: true, createdAt: iso(-30) },
    { id: 'cp-2', companyId: DEMO_COMPANY_ID, code: 'ILKUYE500', discountType: 'amount', discountValue: 500, maxUsage: 50, usedCount: 41, validFrom: iso(-60), validUntil: iso(10), isActive: true, createdAt: iso(-60) },
    { id: 'cp-3', companyId: DEMO_COMPANY_ID, code: 'KIS2025', discountType: 'percentage', discountValue: 15, maxUsage: 200, usedCount: 200, validFrom: iso(-120), validUntil: iso(-10), isActive: false, createdAt: iso(-120) },
  ];

  const hotels = [
    { id: 'h-1', companyId: DEMO_COMPANY_ID, name: 'Ilgaz Dağ Otel', city: 'Çankırı', address: 'Ilgaz Dağı Milli Parkı', stars: 4, description: 'Demo otel kaydı.', amenities: ['Wi-Fi', 'Kahvaltı', 'Otopark'], images: [], createdAt: iso(-200) },
    { id: 'h-2', companyId: DEMO_COMPANY_ID, name: 'Safranbolu Konak', city: 'Karabük', address: 'Çarşı Mahallesi', stars: 3, description: 'Demo otel kaydı.', amenities: ['Kahvaltı'], images: [], createdAt: iso(-150) },
  ];

  const notifications = [
    { id: 'n-1', userId: DEMO_ADMIN_ID, title: 'Yeni rezervasyon', message: 'Kastamonu Doğa Turu için 2 kişilik rezervasyon alındı.', isRead: false, isArchived: false, createdAt: iso(-1, 14) },
    { id: 'n-2', userId: DEMO_ADMIN_ID, title: 'Kontenjan doldu', message: 'Ilgaz Kayak Kampı için kontenjan doldu.', isRead: false, isArchived: false, createdAt: iso(-2, 11) },
    { id: 'n-3', userId: DEMO_ADMIN_ID, title: 'Değerlendirme', message: 'Kapadokya Balon Turu 5 yıldız aldı.', isRead: true, isArchived: false, createdAt: iso(-5, 16) },
  ];

  const refunds = [
    { id: 'rf-1', reservationId: 'r-5', userId: 'u-3', amount: 11200, currency: 'TRY', reason: 'Kişisel sebep', status: 'pending', createdAt: iso(-29) },
  ];

  return {
    version: 1,
    companies,
    users,
    trips,
    vehicles,
    tripDepartures: departures,
    reservations,
    reviews,
    coupons,
    hotels,
    notifications,
    refunds,
    reviewReports: [],
    gallery: [],
    chats: [],
    savedTrips: [],
    calendarTrips: [],
    seatLayouts: [],
    companyReviews: [],
  };
}

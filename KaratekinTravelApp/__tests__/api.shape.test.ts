import {
  TripSchema,
  CompanySchema,
  CalendarTripSchema,
  OnboardingSlideSchema,
  resolveImage,
} from '@/core/data/schemas';

// Asagidaki iki nesne uydurma degil: calisan API'nin
// GET /api/bootstrap yanitindan birebir alindi.
const apiTrip = {
  id: '12e21ddf-ca72-4935-b8e9-c4e8494c0677',
  companyId: '4ea9f4b0-b28c-44a1-8b50-c7e26d383943',
  title: 'İzmir turu',
  location: 'Çankırı',
  city: '',
  region: '',
  rating: 0,
  reviewCount: 0,
  price: '1000,00 TRY',
  pricing: { currency: 'TRY', basePrice: 1000.0, discount: null, extras: [] },
  dateRange: '',
  dateStart: '',
  dateEnd: '',
  createdAt: '2026-08-13T11:00:32.808294Z',
  updatedAt: '2026-08-13T11:01:56.024946Z',
  capacity: 25,
  joinedCount: 0,
  avatars: [],
  image: '',
  headerImage: '',
  gallery: ['data:image/png;base64,iVBORw0KGgoAAAANSUhEUg'],
  description: '',
  isPublished: true,
  isFeatured: false,
  isDeleted: false,
  purchased: false,
  details: null,
  policy: null,
  itinerary: [],
  hotels: [],
};

const apiCompany = {
  id: '4ea9f4b0-b28c-44a1-8b50-c7e26d383943',
  name: 'Tuna Turizm',
  logo: '', phone: '', email: '', website: '',
  rating: 0, reviewCount: 0, about: '', fullAbout: '',
  tripsLabel: '1 Tur', participantsLabel: '0 Katılımcı', location: '',
};

describe('gercek /api/bootstrap yaniti semalara uyuyor', () => {
  test('tur kaydi parse ediliyor', () => {
    const r = TripSchema.safeParse(apiTrip);
    if (!r.success) console.error(r.error.issues);
    expect(r.success).toBe(true);
  });

  test('firma kaydi parse ediliyor', () => {
    const r = CompanySchema.safeParse(apiCompany);
    if (!r.success) console.error(r.error.issues);
    expect(r.success).toBe(true);
  });

  test('isPublished korunuyor: yayin durumu arayuze tasinabilmeli', () => {
    const r = TripSchema.safeParse(apiTrip);
    expect(r.success && r.data.isPublished).toBe(true);
  });

  test('bos tarihler tanimsiza cevriliyor, gecersiz tarih uretilmiyor', () => {
    const r = TripSchema.safeParse(apiTrip);
    expect(r.success && r.data.dateStart).toBeUndefined();
  });

  test('takvim turu: bos baslik/konum/gorsel', () => {
    const r = CalendarTripSchema.safeParse({
      id: 'c1', title: '', location: '', date: '01 Eylul 2026', time: '09:00', image: '',
    });
    if (!r.success) console.error(r.error.issues);
    expect(r.success).toBe(true);
  });

  test('onboarding slaydi bos gorselle gecerli', () => {
    const r = OnboardingSlideSchema.safeParse({
      id: '1', image: '', title: 'a', highlightText: 'b', description: 'c',
    });
    expect(r.success).toBe(true);
  });
});

describe('koruma altindaki kurallar', () => {
  test('bassiz tur hala reddediliyor', () => {
    expect(TripSchema.safeParse({ ...apiTrip, title: '' }).success).toBe(false);
  });

  test('gercek tarih hala dogrulaniyor', () => {
    const r = TripSchema.safeParse({ ...apiTrip, dateStart: '2026-09-01' });
    expect(r.success && r.data.dateStart).toBe('2026-09-01');
  });

  test('anlamsiz tarih reddediliyor', () => {
    expect(TripSchema.safeParse({ ...apiTrip, dateStart: 'bugun' }).success).toBe(false);
  });

  test('gecersiz e-posta hala reddediliyor', () => {
    expect(CompanySchema.safeParse({ ...apiCompany, email: 'bu-eposta-degil' }).success).toBe(false);
  });

  test('gecerli e-posta korunuyor', () => {
    const r = CompanySchema.safeParse({ ...apiCompany, email: 'a@b.com' });
    expect(r.success && r.data.email).toBe('a@b.com');
  });

  test('gercek indirim korunuyor', () => {
    const r = TripSchema.safeParse({
      ...apiTrip,
      pricing: { currency: 'TRY', basePrice: 1000, discount: { label: 'Erken', amount: 100 }, extras: [] },
    });
    expect(r.success && r.data.pricing?.discount?.amount).toBe(100);
  });
});

describe('resolveImage', () => {
  test('bos girdide tanimsiz donuyor', () => {
    expect(resolveImage('')).toBeUndefined();
    expect(resolveImage('   ')).toBeUndefined();
  });

  test('gercek URL korunuyor', () => {
    expect(resolveImage('https://x.test/a.png')).toEqual({ uri: 'https://x.test/a.png' });
  });
});

// ── null normallestirme ────────────────────────────────────────────
import { nullToUndefined } from '@/core/data/api/nullToUndefined';

describe('nullToUndefined', () => {
  test('ic ice null degerleri temizliyor', () => {
    expect(nullToUndefined({ a: null, b: { c: null, d: 1 } })).toEqual({ b: { d: 1 } });
  });

  test('dizilerin icine giriyor', () => {
    expect(nullToUndefined({ xs: [{ hotelIndex: null, day: 1 }] })).toEqual({
      xs: [{ day: 1 }],
    });
  });

  test('bos string ve 0 ve false korunuyor', () => {
    expect(nullToUndefined({ a: '', b: 0, c: false })).toEqual({ a: '', b: 0, c: false });
  });

  test('gercek API turu artik hotelIndex null ile de parse ediliyor', () => {
    const withItinerary = {
      ...apiTrip,
      itinerary: [{ day: 1, title: 'Gun 1', activities: [], hotelIndex: null }],
    };
    // Ham hali reddediliyor
    expect(TripSchema.safeParse(withItinerary).success).toBe(false);
    // Normallestirilmis hali geciyor
    const r = TripSchema.safeParse(nullToUndefined(withItinerary));
    if (!r.success) console.error(r.error.issues);
    expect(r.success).toBe(true);
  });

  test('zorunlu alan null ise hata gizlenmiyor, sadece mesaji degisiyor', () => {
    const broken = nullToUndefined({ ...apiTrip, title: null });
    const r = TripSchema.safeParse(broken);
    expect(r.success).toBe(false);
  });
});

import {
  TripSchema,
  CompanySchema,
  CalendarTripSchema,
  OnboardingSlideSchema,
  resolveImage,
} from '@/core/data/schemas';

// Asagidaki nesneler API'nin gercekte urettigi sekiller:
// TripService.MapToResponseDto ve CompanyService.MapToResponseDto
// doldurulmamis alanlar icin null degil string.Empty donduruyor,
// tarihleri de "yyyy-MM-dd" bicimiyle yaziyor.

const apiTrip = {
  id: '3f2a', companyId: '8b1c', title: 'Kapadokya Turu',
  location: '', city: '', region: '',
  rating: 0, reviewCount: 0, price: '1500 TRY',
  dateRange: '', dateStart: '2026-09-01', dateEnd: '2026-09-03',
  capacity: 0, joinedCount: 0, avatars: [],
  image: '', headerImage: '', gallery: [], description: 'Ucus dahil',
  purchased: false,
};

const apiCompany = {
  id: '8b1c', name: 'Kabir Turizm', logo: '', phone: '', email: '', website: '',
  rating: 0, reviewCount: 0, about: '', fullAbout: '',
  tripsLabel: '1 Tur', participantsLabel: '0 Katilimci', location: '',
};

// BootstrapService.GetCalendarTripsAsync
const apiCalendarTrip = {
  id: 'c1', title: '', location: '', date: '01 Eylul 2026', time: '09:00', image: '',
};

describe('API yanit sekilleri semalara uyuyor', () => {
  test('tur: bos sehir/bolge/gorsel ve gun bicimli tarih', () => {
    const r = TripSchema.safeParse(apiTrip);
    if (!r.success) console.error(r.error.issues);
    expect(r.success).toBe(true);
  });

  test('firma: bos e-posta ve web sitesi', () => {
    const r = CompanySchema.safeParse(apiCompany);
    if (!r.success) console.error(r.error.issues);
    expect(r.success).toBe(true);
  });

  test('takvim turu: bos baslik/konum/gorsel', () => {
    const r = CalendarTripSchema.safeParse(apiCalendarTrip);
    if (!r.success) console.error(r.error.issues);
    expect(r.success).toBe(true);
  });

  test('onboarding slaydi bos gorselle gecerli', () => {
    const r = OnboardingSlideSchema.safeParse({
      id: '1', image: '', title: 'a', highlightText: 'b', description: 'c',
    });
    if (!r.success) console.error(r.error.issues);
    expect(r.success).toBe(true);
  });
});

describe('koruma altindaki kurallar', () => {
  test('bassiz tur hala reddediliyor', () => {
    expect(TripSchema.safeParse({ ...apiTrip, title: '' }).success).toBe(false);
  });

  test('gecersiz e-posta hala reddediliyor', () => {
    expect(CompanySchema.safeParse({ ...apiCompany, email: 'bu-eposta-degil' }).success).toBe(false);
  });

  test('gecerli e-posta korunuyor', () => {
    const r = CompanySchema.safeParse({ ...apiCompany, email: 'a@b.com' });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.email).toBe('a@b.com');
  });
});

describe('resolveImage', () => {
  test('bos girdide tanimsiz donuyor, { uri: "" } uretmiyor', () => {
    expect(resolveImage('')).toBeUndefined();
    expect(resolveImage('   ')).toBeUndefined();
  });

  test('gercek URL korunuyor', () => {
    expect(resolveImage('https://x.test/a.png')).toEqual({ uri: 'https://x.test/a.png' });
  });
});

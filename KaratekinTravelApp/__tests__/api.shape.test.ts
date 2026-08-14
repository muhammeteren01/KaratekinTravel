import { TripSchema, CompanySchema } from '@/core/data/schemas';
import { emptyToUndefined } from '@/core/data/api/normalize';

// TripService.MapToResponseDto ciktisinin birebir sekli
const apiTrip = {
  id: '3f2a', companyId: '8b1c', title: 'Kapadokya Turu',
  location: '', city: '', region: '',
  rating: 0, reviewCount: 0, price: '1500 TRY',
  dateRange: '', dateStart: '2026-09-01', dateEnd: '2026-09-03',
  capacity: 0, joinedCount: 0, avatars: [],
  image: '', headerImage: '', gallery: [], description: 'Ucus dahil',
  purchased: false,
};

// CompanyService.MapToResponseDto ciktisinin birebir sekli
const apiCompany = {
  id: '8b1c', name: 'Kabir Turizm', logo: '', phone: '', email: '', website: '',
  rating: 0, reviewCount: 0, about: '', fullAbout: '',
  tripsLabel: '1 Tur', participantsLabel: '0 Katilimci', location: '',
};

test('gercek API turu artik parse ediliyor', () => {
  const r = TripSchema.safeParse(emptyToUndefined(apiTrip));
  if (!r.success) console.error(r.error.issues);
  expect(r.success).toBe(true);
});

test('gercek API firmasi artik parse ediliyor', () => {
  const r = CompanySchema.safeParse(emptyToUndefined(apiCompany));
  if (!r.success) console.error(r.error.issues);
  expect(r.success).toBe(true);
});

test('gun bicimli tarih kabul ediliyor', () => {
  const r = TripSchema.safeParse(emptyToUndefined({ ...apiTrip, dateStart: '2026-09-01' }));
  expect(r.success).toBe(true);
});

test('basliksiz tur hala reddediliyor', () => {
  const r = TripSchema.safeParse(emptyToUndefined({ ...apiTrip, title: '' }));
  expect(r.success).toBe(false);
});

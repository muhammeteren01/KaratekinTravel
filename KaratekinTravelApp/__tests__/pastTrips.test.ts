import { PastTripSchema } from '@/core/data/schemas';
import { nullToUndefined } from '@/core/data/api/nullToUndefined';

// BootstrapService.BuildPastTrips'in urettigi sekil.
// Gorseli/oteli olmayan bir tur icin API bos string ve bos nesne donduruyor.
const apiPastTrip = {
  id: '12e21ddf-ca72-4935-b8e9-c4e8494c0677',
  title: 'İzmir turu',
  location: 'Çankırı',
  city: '',
  rating: 0,
  reviewCount: 0,
  image: '',
  headerImage: '',
  gallery: [],
  about: '',
  date: '2026-08-01',
  companyId: '4ea9f4b0-b28c-44a1-8b50-c7e26d383943',
  companyName: 'Tuna Turizm',
  priceText: '1000,00 TRY',
  timeline: [
    { id: 't-1-Kahvalti', title: 'Kahvaltı', time: '09:00', image: '', isCompleted: true },
  ],
  hotel: { title: '', durationText: '', rating: 0 },
  reviews: [
    { id: 'r1', name: 'Tunahan', avatar: { uri: '' }, rating: 5, text: 'Guzeldi' },
  ],
};

describe('BuildPastTrips ciktisi mobil semaya uyuyor', () => {
  test('gecmis tur kaydi parse ediliyor', () => {
    const r = PastTripSchema.safeParse(nullToUndefined(apiPastTrip));
    if (!r.success) console.error(r.error.issues);
    expect(r.success).toBe(true);
  });

  test('otelsiz tur da kabul ediliyor', () => {
    const r = PastTripSchema.safeParse(
      nullToUndefined({ ...apiPastTrip, hotel: { title: '', durationText: '', rating: 0 } }),
    );
    expect(r.success).toBe(true);
  });

  test('bos zaman cizelgesi ve degerlendirme listesi sorun degil', () => {
    const r = PastTripSchema.safeParse(
      nullToUndefined({ ...apiPastTrip, timeline: [], reviews: [] }),
    );
    expect(r.success).toBe(true);
  });
});

import { TripSchema } from '@/core/data/schemas';
import { mapTripSchemaToUi, mapTripsSchemaToUi } from '@/core/data/adapters';
import { TripUISchema } from '@/core/data/uiSchemas';

describe('mapTripSchemaToUi', () => {
  it('maps zod Trip schema object to UI Trip type', () => {
    const input = TripSchema.parse({
      id: 't1',
      companyId: 'c1',
      title: 'Amasra Turu',
      location: 'Amasra, Türkiye',
      city: 'Amasra',
      region: 'Bartın',
      rating: 4.6,
      reviewCount: 128,
      price: '₺750',
      dateStart: '2025-06-20T09:00:00.000Z',
      dateEnd: '2025-06-22T18:00:00.000Z',
      capacity: 50,
      joinedCount: 24,
      avatars: [],
      image: 'asset:onboarding1',
      description: 'Keyifli bir tur',
      purchased: false,
    });
    const ui = mapTripSchemaToUi(input);
    expect(typeof ui.id).toBe('number');
    expect(ui.title).toBe('Amasra Turu');
    expect(ui.location).toContain('Amasra');
    expect(ui.dateStart).toBeInstanceOf(Date);
    expect(ui.dateEnd).toBeInstanceOf(Date);
    expect(ui.peopleCountLabel).toBe('+24');
    expect(ui.image).toBeTruthy();
    // price falls back to schema price when present
    expect(ui.price).toBe('₺750');
  });

  it('computes price label from pricing when price is missing', () => {
    const input = TripSchema.parse({
      id: 2,
      companyId: 'c1',
      title: 'Safranbolu',
      location: 'Safranbolu, Türkiye',
      city: 'Safranbolu',
      region: 'Karabük',
      rating: 4.2,
      reviewCount: 10,
      capacity: 30,
      joinedCount: 0,
      image: 'asset:onboarding2',
      pricing: { currency: 'TRY', basePrice: 1200 },
    });
    const ui = mapTripSchemaToUi(input);
    expect(ui.price).toBe('TRY 1200');
  });

  it('maps list without any casts', () => {
    const list = [
      TripSchema.parse({
        id: 't3', companyId: 'c1', title: 'Kazdağları', location: 'Balıkesir', city: 'Edremit', region: 'Marmara', rating: 4.9, reviewCount: 3, capacity: 10, joinedCount: 2, image: 'asset:onboarding3'
      }),
    ];
    const uiList = mapTripsSchemaToUi(list);
    expect(uiList.length).toBe(1);
    expect(typeof uiList[0].id).toBe('number');
  });

  it('rejects invalid data at runtime', () => {
    const invalid: any = {
      id: 'x',
      // missing companyId
      title: '', // invalid: min(1)
      location: 'Somewhere',
      city: 'City',
      region: 'Region',
      rating: 7, // invalid: > 5
      reviewCount: -1, // invalid
      capacity: 0, // invalid positive
      joinedCount: 2,
      image: '', // invalid empty
    };
    const res = TripUISchema.safeParse(invalid);
    expect(res.success).toBe(false);
    expect(() => mapTripSchemaToUi(invalid)).toThrow();
  });
});

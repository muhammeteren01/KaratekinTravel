import { migrateBootstrap, CURRENT_SCHEMA_VERSION } from '../src/core/data/migrations';

const bootstrapV3 = {
  version: 3,
  companies: [
    { id: 'c1', name: 'Test', logo: 'asset:logo', rating: 0, reviewCount: 0 },
  ],
  trips: [
    {
      id: 't1',
      companyId: 'c1',
      title: 'Trip',
      location: 'Loc',
      city: 'City',
      region: 'Reg',
      rating: 4.2,
      reviewCount: 10,
      capacity: 10,
      joinedCount: 0,
      avatars: [],
      image: 'asset:ob1',
      description: '',
    },
  ],
  users: [],
  reservations: [],
  reviews: [],
  supportingData: {
    calendarTrips: [
      { id: 1, title: 'CT', location: 'L', date: '2025-01-01', time: '10:00', image: 'asset:ob1' },
    ],
    routeStops: [
      { id: 2, title: 'RS', time: '11:00', image: 'asset:ob2', width: 100, height: 60, timelineAlign: 'left', top: 10, side: 'left', sideOffset: 0 },
    ],
    reservationPresets: [
      { id: 3, companyName: 'X', durationHours: 2, dateLabel: 'Now', busType: 'A', backgroundImage: 'asset:ob3', layout: { rows: 10, seatsLeft: 2, seatsRight: 2, totalSeats: 40 } },
    ],
  },
};

describe('migrations', () => {
  it('version 3 bootstrap upgrades to 4 correctly', () => {
    const out = migrateBootstrap(bootstrapV3);
    expect(out.version).toBe(CURRENT_SCHEMA_VERSION);
    // IDs coerced to strings
    expect(out.supportingData?.calendarTrips?.[0].id).toBe('1');
    expect(out.supportingData?.routeStops?.[0].id).toBe('2');
    expect(out.supportingData?.reservationPresets?.[0].id).toBe('3');
    // images preserved as strings and ready for resolveImage
    expect(out.supportingData?.calendarTrips?.[0].image).toBe('asset:ob1');
  });
});

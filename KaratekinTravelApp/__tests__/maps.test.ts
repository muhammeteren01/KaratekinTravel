import { buildWebMapsUrl, mapQueryFromTrip } from '@/utils/maps';

describe('mapQueryFromTrip', () => {
  test('dolu alanlari birlestiriyor', () => {
    expect(mapQueryFromTrip({ location: 'Çankırı', city: 'Ankara', region: 'İç Anadolu' }))
      .toBe('Çankırı, Ankara, İç Anadolu');
  });

  test('API bos string gonderdiginde onlari atiyor', () => {
    expect(mapQueryFromTrip({ location: 'Çankırı', city: '', region: '' })).toBe('Çankırı');
  });

  test('tekrar eden degerleri tekillestiriyor', () => {
    expect(mapQueryFromTrip({ location: 'Ankara', city: 'Ankara', region: '' })).toBe('Ankara');
  });

  test('konum alanlari bossa basliga dusuyor', () => {
    expect(mapQueryFromTrip({ location: '', city: '', region: '', title: 'İzmir turu' }))
      .toBe('İzmir turu');
  });

  test('hicbir sey yoksa bos donuyor, buton pasiflestirilebilir', () => {
    expect(mapQueryFromTrip({ location: '', city: '', region: '', title: '' })).toBe('');
    expect(mapQueryFromTrip(null)).toBe('');
    expect(mapQueryFromTrip(undefined)).toBe('');
  });
});

describe('buildWebMapsUrl', () => {
  test('turkce karakterleri kodluyor', () => {
    expect(buildWebMapsUrl('Çankırı')).toBe(
      'https://www.google.com/maps/search/?api=1&query=%C3%87ank%C4%B1r%C4%B1',
    );
  });
});

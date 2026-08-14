import { userAvatarSource } from '@/utils/avatar';

describe('userAvatarSource', () => {
  test('gercek URL oldugu gibi kullaniliyor', () => {
    expect(userAvatarSource('https://x.test/a.png')).toEqual({ uri: 'https://x.test/a.png' });
  });

  test('avatar yoksa yer tutucu donuyor, dis adrese gidilmiyor', () => {
    const s = userAvatarSource(undefined);
    expect(s).toBeDefined();
    expect(JSON.stringify(s)).not.toContain('unsplash');
  });

  test('bos string ve null da yer tutucuya dusuyor', () => {
    expect(JSON.stringify(userAvatarSource(''))).not.toContain('http');
    expect(JSON.stringify(userAvatarSource(null))).not.toContain('http');
  });

  test('base64 data URI korunuyor (avatar yukleme bu bicimde kaydediyor)', () => {
    const d = 'data:image/png;base64,QUJD';
    expect(userAvatarSource(d)).toEqual({ uri: d });
  });
});

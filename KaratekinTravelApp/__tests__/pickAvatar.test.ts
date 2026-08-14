import { AVATAR_MAX_BYTES } from '@/utils/pickAvatar';

jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
}));

import * as ImagePicker from 'expo-image-picker';
import { pickAvatar } from '@/utils/pickAvatar';

const mocked = ImagePicker as jest.Mocked<typeof ImagePicker>;

beforeEach(() => jest.resetAllMocks());

test('izin verilmezse denied donuyor, secici hic acilmiyor', async () => {
  mocked.requestMediaLibraryPermissionsAsync.mockResolvedValue({ granted: false } as any);
  await expect(pickAvatar()).resolves.toEqual({ status: 'denied' });
  expect(mocked.launchImageLibraryAsync).not.toHaveBeenCalled();
});

test('kullanici vazgecerse cancelled donuyor', async () => {
  mocked.requestMediaLibraryPermissionsAsync.mockResolvedValue({ granted: true } as any);
  mocked.launchImageLibraryAsync.mockResolvedValue({ canceled: true } as any);
  await expect(pickAvatar()).resolves.toEqual({ status: 'cancelled' });
});

test('secilen gorsel data URI olarak donuyor', async () => {
  mocked.requestMediaLibraryPermissionsAsync.mockResolvedValue({ granted: true } as any);
  mocked.launchImageLibraryAsync.mockResolvedValue({
    canceled: false,
    assets: [{ base64: 'QUJD', mimeType: 'image/png' }],
  } as any);
  await expect(pickAvatar()).resolves.toEqual({
    status: 'picked',
    dataUri: 'data:image/png;base64,QUJD',
  });
});

test('sinirin ustundeki gorsel reddediliyor', async () => {
  mocked.requestMediaLibraryPermissionsAsync.mockResolvedValue({ granted: true } as any);
  const tooBig = 'A'.repeat(Math.ceil((AVATAR_MAX_BYTES + 1024) * 4 / 3));
  mocked.launchImageLibraryAsync.mockResolvedValue({
    canceled: false,
    assets: [{ base64: tooBig, mimeType: 'image/jpeg' }],
  } as any);
  const r = await pickAvatar();
  expect(r.status).toBe('too-large');
});

test('secici hata firlatirsa istisna disari sizmiyor', async () => {
  mocked.requestMediaLibraryPermissionsAsync.mockRejectedValue(new Error('boom'));
  await expect(pickAvatar()).resolves.toEqual({ status: 'failed' });
});

import { resolveImage } from '../src/core/data/schemas';
import * as assets from '../assets/assetsMap';

describe('resolveImage', () => {
  test('returns correct require() for asset:onboarding1', () => {
    const spy = jest.spyOn(assets, 'getAssetByKey');
    // First call should be with key from asset: prefix
    const res: any = resolveImage('asset:onboarding1');
    expect(spy).toHaveBeenCalled();
    // assetsMap maps onboarding1 -> require('./ob1.png'), which is opaque number in RN
    // In Node/Jest, we just assert that getAssetByKey was called with onboarding1 and returned something truthy
    expect(assets.getAssetByKey('onboarding1')).toBeTruthy();
    expect(res).toBe(assets.getAssetByKey('onboarding1'));
    spy.mockRestore();
  });

  test('warns on missing key', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const res = resolveImage('asset:not-exist-xyz');
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('resolveImage: asset key "not-exist-xyz" not found')
    );
    // Should still return a URI object fallback
    expect(typeof res).toBe('object');
    warn.mockRestore();
  });
});

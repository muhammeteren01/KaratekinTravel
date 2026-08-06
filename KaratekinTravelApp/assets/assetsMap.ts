// Auto-generated assets registry for local images.
// Keep this file in the assets/ folder so "require" stays relative and packager can bundle.
// src/** code should import { getAssetByKey } from '../../assets/assetsMap';

// NOTE: This file is hand-maintained based on assets/assetsIndex.json; update both when adding assets.

// Key to require() mapping. Keys must match values used in JSON as "asset:<key>".
const registry: Record<string, any> = {
  ob1: require('./ob1.png'),
  ob2: require('./ob2.png'),
  ob3: require('./ob3.png'),
  // Remapped to valid images until dedicated onboarding images are replaced with real PNGs
  onboarding1: require('./ob1.png'),
  onboarding2: require('./ob2.png'),
  onboarding3: require('./ob3.png'),
  logo: require('./logo.png'),
  bg1: require('./bg1.jpg'),
  'steering-wheel': require('./steering-wheel.png'),
};

export function getAssetByKey(key?: string) {
  if (!key) return undefined;
  return registry[key];
}

export type AssetKey = keyof typeof registry;

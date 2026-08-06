import { ImageSourcePropType } from 'react-native';

// Types used by OnboardingScreen
export interface OnboardingData {
  id: number;
  image: ImageSourcePropType;
  title: string;
  highlightText: string;
  description: string;
  backgroundColor: string[];
}

export interface OnboardingScreenProps {
  onComplete: () => void;
}

// Types used by SplashScreen
export interface SplashScreenProps {
  onAnimationFinish: () => void;
}

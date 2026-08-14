export { default } from "react-native-pager-view";
// Tipler de yeniden disari veriliyor: OnboardingScreen bu dosyadan
// { type PagerViewRef } import ediyordu ve yalnizca default disari
// verildigi icin TS2614 aliniyordu.
export type { PagerViewRef, PagerViewProps } from "./react-native-pager-view.web";

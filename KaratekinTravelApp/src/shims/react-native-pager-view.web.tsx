// Web shim for react-native-pager-view
import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  PropsWithChildren,
} from "react";
import { ScrollView, View, ViewStyle } from "react-native";

export type PagerViewRef = {
  setPage: (index: number) => void;
};

export type PagerViewProps = PropsWithChildren<{
  style?: ViewStyle;
  initialPage?: number;
  onPageSelected?: (e: { nativeEvent: { position: number } } | any) => void;
}>;

const PagerView = forwardRef<PagerViewRef, PagerViewProps>(function PagerView(
  { style, initialPage = 0, onPageSelected, children },
  ref,
) {
  const scrollRef = useRef<ScrollView>(null);

  useImperativeHandle(ref, () => ({
    setPage: (index: number) => {
      scrollRef.current?.scrollTo({
        x: index * window.innerWidth,
        animated: true,
      });
      onPageSelected?.({
        // @ts-expect-error minimal event for web shim
        nativeEvent: { position: index },
      });
    },
  }));

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      style={style as any}
      onMomentumScrollEnd={(e) => {
        const x = e.nativeEvent.contentOffset.x;
        const width =
          (e.nativeEvent as any).layoutMeasurement?.width || window.innerWidth;
        const position = Math.round(x / width);
        onPageSelected?.({
          // @ts-expect-error minimal event for web shim
          nativeEvent: { position },
        });
      }}
    >
      {React.Children.map(children, (child) => (
        <View style={{ width: window.innerWidth, flex: 1 }}>{child}</View>
      ))}
    </ScrollView>
  );
});

export default PagerView;

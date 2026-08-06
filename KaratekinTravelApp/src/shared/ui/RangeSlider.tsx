import React, { useState } from 'react';
import { View, StyleSheet, PanResponder } from 'react-native';

interface RangeSliderProps {
  min: number;
  max: number;
  minValue: number;
  maxValue: number;
  onMinValueChange: (value: number) => void;
  onMaxValueChange: (value: number) => void;
  step?: number;
}

export default function RangeSlider({
  min,
  max,
  minValue,
  maxValue,
  onMinValueChange,
  onMaxValueChange,
  step = 1,
}: RangeSliderProps) {
  const [sliderWidth, setSliderWidth] = useState(300);
  const [isDragging, setIsDragging] = useState<'min' | 'max' | null>(null);

  const thumbSize = 18;
  const trackHeight = 3;

  const valueToPosition = (value: number) => {
    return ((value - min) / (max - min)) * (sliderWidth - thumbSize);
  };

  const positionToValue = (position: number) => {
    const value = (position / (sliderWidth - thumbSize)) * (max - min) + min;
    const steppedValue = Math.round(value / step) * step;
    return Math.max(min, Math.min(max, steppedValue));
  };

  const minPosition = valueToPosition(minValue);
  const maxPosition = valueToPosition(maxValue);

  const minPanResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      setIsDragging('min');
    },
    onPanResponderMove: (evt, gestureState) => {
      const newPosition = Math.max(0, Math.min(maxPosition - thumbSize, minPosition + gestureState.dx));
      const newValue = positionToValue(newPosition);
      if (newValue < maxValue) {
        onMinValueChange(newValue);
      }
    },
    onPanResponderRelease: () => {
      setIsDragging(null);
    },
  });

  const maxPanResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      setIsDragging('max');
    },
    onPanResponderMove: (evt, gestureState) => {
      const newPosition = Math.max(minPosition + thumbSize, Math.min(sliderWidth - thumbSize, maxPosition + gestureState.dx));
      const newValue = positionToValue(newPosition);
      if (newValue > minValue) {
        onMaxValueChange(newValue);
      }
    },
    onPanResponderRelease: () => {
      setIsDragging(null);
    },
  });

  return (
    <View style={styles.container}>
      <View
        style={styles.sliderContainer}
        onLayout={(event) => {
          setSliderWidth(event.nativeEvent.layout.width);
        }}
      >
        <View style={styles.track} />
        <View
          style={[
            styles.range,
            {
              left: minPosition + thumbSize / 2,
              width: maxPosition - minPosition,
            },
          ]}
        />
        <View
          style={[
            styles.thumb,
            {
              left: minPosition,
              zIndex: isDragging === 'min' ? 10 : 5,
            },
          ]}
          {...minPanResponder.panHandlers}
        />
        <View
          style={[
            styles.thumb,
            {
              left: maxPosition,
              zIndex: isDragging === 'max' ? 10 : 5,
            },
          ]}
          {...maxPanResponder.panHandlers}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 5,
  },
  sliderContainer: {
    height: 44,
    position: 'relative',
    marginHorizontal: 10,
  },
  track: {
    position: 'absolute',
    top: 21,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#8D8D8D',
    borderRadius: 1,
  },
  range: {
    position: 'absolute',
    top: 21,
    height: 3,
    backgroundColor: '#8D8D8D',
    borderRadius: 1,
    zIndex: 1,
  },
  thumb: {
    position: 'absolute',
    top: 12,
    width: 18,
    height: 18,
    backgroundColor: '#EFEFEF',
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#8D8D8D',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
});

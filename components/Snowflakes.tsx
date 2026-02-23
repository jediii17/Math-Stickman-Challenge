import React, { useEffect } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
  withDelay,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

// width and height are now obtained via useWindowDimensions() inside the component
const SNOWFLAKE_COUNT = 15;

const Snowflake = ({ index, width, height }: { index: number, width: number, height: number }) => {
  const startX = Math.random() * width;
  const startY = -50;
  
  const translateY = useSharedValue(startY);
  const translateX = useSharedValue(startX);
  const opacity = useSharedValue(Math.random() * 0.5 + 0.3); // 0.3 to 0.8 opacity
  const rotation = useSharedValue(0);

  const duration = Math.random() * 3000 + 4000; // 4 to 7 seconds
  const delay = Math.random() * 3000;

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withRepeat(
        withTiming(height + 50, {
          duration,
          easing: Easing.linear,
        }),
        -1, // infinite
        false
      )
    );

    translateX.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(startX + 30, { duration: duration / 2, easing: Easing.inOut(Easing.ease) }),
          withTiming(startX - 30, { duration: duration / 2, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      )
    );

    rotation.value = withDelay(
      delay,
      withRepeat(
        withTiming(360, { duration: duration, easing: Easing.linear }),
        -1,
        false
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotation.value}deg` }
    ],
    opacity: opacity.value,
  }));

  const size = Math.random() * 10 + 10; // 10 to 20 px

  return (
    <Animated.View style={[styles.snowflake, animatedStyle]}>
      <Ionicons name="snow" size={size} color="#B2EBF2" />
    </Animated.View>
  );
};

export default function Snowflakes() {
  const { width, height } = useWindowDimensions();
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {Array.from({ length: SNOWFLAKE_COUNT }).map((_, i) => (
        <Snowflake key={i} index={i} width={width} height={height} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  snowflake: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
});

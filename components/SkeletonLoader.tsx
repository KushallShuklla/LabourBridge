import { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

export const SkeletonLoader = ({ width = '100%', height = 20, borderRadius = 8, style = {} }: SkeletonLoaderProps) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          opacity,
        } as any,
        style,
      ]}
    />
  );
};

export const CardSkeleton = () => (
  <View style={styles.card}>
    <View style={styles.header}>
      <SkeletonLoader width={60} height={60} borderRadius={30} />
      <View style={styles.info}>
        <SkeletonLoader width="80%" height={20} />
        <SkeletonLoader width="60%" height={16} style={{ marginTop: 8 }} />
      </View>
    </View>
    <SkeletonLoader width="100%" height={16} style={{ marginTop: 12 }} />
    <SkeletonLoader width="90%" height={16} style={{ marginTop: 8 }} />
    <View style={styles.footer}>
      <SkeletonLoader width="45%" height={40} borderRadius={8} />
      <SkeletonLoader width="45%" height={40} borderRadius={8} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#E1E9EE',
  },
  card: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
});

import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

// ─── Skeleton primitive ───────────────────────────────────────────────────────
interface SkeletonBoxProps {
  height: number;
  width: number | `${number}%`;
  radius?: number;
}

const SkeletonBox = ({ height, width, radius = 8 }: SkeletonBoxProps) => {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.35, { duration: 750 }),
        withTiming(1,    { duration: 750 })
      ),
      -1,
      false
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[
        animStyle,
        {
          height,
          width: width as any,
          borderRadius: radius,
          backgroundColor: '#E2E8F0',
        },
      ]}
    />
  );
};

// ─── Marketplace skeleton card list ──────────────────────────────────────────
export const MarketplaceSkeleton = () => {
  return (
    <View style={{ paddingHorizontal: 24, gap: 24 }}>
      {[1, 2, 3].map((i) => (
        <View
          key={i}
          style={{
            backgroundColor: 'white',
            borderRadius: 40,
            padding: 24,
            borderWidth: 1,
            borderColor: '#F1F5F9',
            overflow: 'hidden',
          }}
        >
          {/* Header row */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <SkeletonBox height={60} width={60} radius={16} />
              <View style={{ marginLeft: 16, gap: 8 }}>
                <SkeletonBox height={24} width={150} />
                <SkeletonBox height={16} width={100} />
              </View>
            </View>
            <SkeletonBox height={40} width={80} radius={12} />
          </View>

          {/* Description lines */}
          <View style={{ gap: 8, marginBottom: 24 }}>
            <SkeletonBox height={16} width="100%" />
            <SkeletonBox height={16} width="80%" />
          </View>

          {/* Stats row */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              padding: 16,
              backgroundColor: '#F8FAFC',
              borderRadius: 16,
            }}
          >
            <View style={{ gap: 4 }}>
              <SkeletonBox height={12} width={60} />
              <SkeletonBox height={24} width={80} />
            </View>
            <View style={{ alignItems: 'flex-end', gap: 4 }}>
              <SkeletonBox height={12} width={60} />
              <SkeletonBox height={24} width={120} />
            </View>
          </View>
        </View>
      ))}
    </View>
  );
};

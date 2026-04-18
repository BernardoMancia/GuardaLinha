import React, { useEffect, useRef } from 'react';
import {
  Animated,
  TouchableOpacity,
  StyleSheet,
  View,
  Text,
} from 'react-native';
import { colors } from '../theme/colors';

interface NeonToggleProps {
  value: boolean;
  onToggle: () => void;
  activeColor?: string;
  size?: 'small' | 'normal';
}

export const NeonToggle: React.FC<NeonToggleProps> = ({
  value,
  onToggle,
  activeColor = colors.neonGreen,
  size = 'normal',
}) => {
  const translateX = useRef(new Animated.Value(value ? 1 : 0)).current;
  const glowOpacity = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(translateX, {
        toValue: value ? 1 : 0,
        useNativeDriver: true,
        tension: 80,
        friction: 8,
      }),
      Animated.timing(glowOpacity, {
        toValue: value ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [value]);

  const isSmall = size === 'small';
  const trackW = isSmall ? 40 : 52;
  const trackH = isSmall ? 22 : 28;
  const thumbSize = isSmall ? 16 : 20;
  const travel = trackW - thumbSize - 6;

  const thumbTranslate = translateX.interpolate({
    inputRange: [0, 1],
    outputRange: [3, travel],
  });

  return (
    <TouchableOpacity onPress={onToggle} activeOpacity={0.8}>
      <View
        style={[
          styles.track,
          {
            width: trackW,
            height: trackH,
            borderRadius: trackH / 2,
            backgroundColor: value ? activeColor + '33' : 'rgba(255,255,255,0.05)',
            borderColor: value ? activeColor + '88' : colors.border,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.thumb,
            {
              width: thumbSize,
              height: thumbSize,
              borderRadius: thumbSize / 2,
              transform: [{ translateX: thumbTranslate }],
              backgroundColor: value ? activeColor : 'rgba(255,255,255,0.3)',
              shadowColor: value ? activeColor : 'transparent',
              shadowOpacity: value ? 0.9 : 0,
              shadowRadius: 8,
              elevation: value ? 6 : 0,
            },
          ]}
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  track: {
    justifyContent: 'center',
    borderWidth: 1,
  },
  thumb: {
    position: 'absolute',
    shadowOffset: { width: 0, height: 0 },
  },
});

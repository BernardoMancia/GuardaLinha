import React, { useEffect, useRef } from 'react';
import { Animated, View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

interface AnimatedShieldProps {
  active: boolean;
  blockedToday: number;
}

export const AnimatedShield: React.FC<AnimatedShieldProps> = ({ active, blockedToday }) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (active) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.06, duration: 1800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1800, useNativeDriver: true }),
        ])
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
          Animated.timing(glowAnim, { toValue: 0.4, duration: 2000, useNativeDriver: true }),
        ])
      ).start();

      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 12000,
          useNativeDriver: true,
        })
      ).start();
    } else {
      pulseAnim.stopAnimation();
      glowAnim.stopAnimation();
      Animated.timing(pulseAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
      Animated.timing(glowAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start();
    }
  }, [active]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const glowColor = active ? colors.neonGreen : colors.neonRed;

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.outerRing,
          {
            opacity: glowAnim,
            borderColor: glowColor,
            transform: [{ rotate: spin }],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.middleRing,
          {
            opacity: Animated.multiply(glowAnim, 0.6),
            borderColor: glowColor,
          },
        ]}
      />
      <Animated.View
        style={[
          styles.shieldWrapper,
          { transform: [{ scale: pulseAnim }] },
        ]}
      >
        <View
          style={[
            styles.shieldBg,
            {
              backgroundColor: active ? colors.neonGreenDim : colors.neonRedDim,
              borderColor: glowColor + '66',
            },
          ]}
        >
          <Text style={styles.shieldEmoji}>{active ? '🛡️' : '⚠️'}</Text>
        </View>
      </Animated.View>

      <View style={styles.infoContainer}>
        <Text style={[styles.statusText, { color: active ? colors.neonGreen : colors.neonRed }]}>
          {active ? 'PROTEÇÃO ATIVA' : 'PROTEÇÃO INATIVA'}
        </Text>
        {active && (
          <Text style={styles.countText}>
            {blockedToday} bloqueada{blockedToday !== 1 ? 's' : ''} hoje
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  outerRing: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  middleRing: {
    position: 'absolute',
    width: 148,
    height: 148,
    borderRadius: 74,
    borderWidth: 1,
  },
  shieldWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  shieldBg: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  shieldEmoji: { fontSize: 52 },
  infoContainer: { marginTop: 24, alignItems: 'center' },
  statusText: { fontSize: 14, fontWeight: '800', letterSpacing: 2 },
  countText: { fontSize: 12, color: colors.textSecondary, marginTop: 4 },
});

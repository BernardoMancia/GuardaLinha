export const colors = {
  bg: '#090b12',
  bgCard: 'rgba(255,255,255,0.04)',
  bgCardHover: 'rgba(255,255,255,0.07)',
  border: 'rgba(255,255,255,0.07)',
  borderAccent: 'rgba(0,240,175,0.3)',

  neonGreen: '#00f0af',
  neonGreenDim: 'rgba(0,240,175,0.15)',
  neonGreenGlow: 'rgba(0,240,175,0.4)',

  neonRed: '#ff4d6a',
  neonRedDim: 'rgba(255,77,106,0.15)',
  neonRedGlow: 'rgba(255,77,106,0.4)',

  neonBlue: '#4da6ff',
  neonBlueDim: 'rgba(77,166,255,0.15)',

  neonPurple: '#b47aff',
  neonPurpleDim: 'rgba(180,122,255,0.15)',

  neonOrange: '#ff9f4a',
  neonOrangeDim: 'rgba(255,159,74,0.15)',

  neonYellow: '#ffd54f',
  neonYellowDim: 'rgba(255,213,79,0.15)',

  textPrimary: '#e8eaf0',
  textSecondary: 'rgba(232,234,240,0.55)',
  textMuted: 'rgba(232,234,240,0.3)',

  white: '#ffffff',
  success: '#00f0af',
  danger: '#ff4d6a',
  warning: '#ff9f4a',
  info: '#4da6ff',
};

export const ruleTypeColors: Record<string, string> = {
  BLOCK_ALL: colors.neonRed,
  BLOCK_ALL_EXCEPT: colors.neonGreen,
  SPECIFIC_NUMBERS: colors.neonBlue,
  NUMBER_RANGE: colors.neonPurple,
  NUMBER_LIST: colors.neonOrange,
  FOREIGN_CALLS: colors.neonYellow,
  SPECIFIC_DDD: colors.neonBlue,
  PREFIX: colors.neonPurple,
  SUFFIX: colors.neonPurple,
};

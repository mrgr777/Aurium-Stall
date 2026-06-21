/**
 * Identidade visual do Aurium-Stall.
 * "Aurium" = ouro: paleta quente, em tons dourados, clara e acolhedora.
 */

export const colors = {
  bg: '#FAF6EE',
  surface: '#FFFFFF',
  surfaceAlt: '#F3EEE2',

  text: '#211D17',
  textMuted: '#837B6E',
  textInverse: '#FFFFFF',

  // Dourado da marca
  primary: '#9C7410', // botões / ações principais (contraste AA com texto branco)
  primaryDark: '#7E5D0B', // estado pressionado
  accent: '#D4A82A', // destaques, aba ativa, barras de gráfico
  accentSoft: '#F6EBCB', // fundos de destaque

  // Semânticos (no contexto de preços: subiu = ruim/vermelho, caiu = bom/verde)
  success: '#2E7D32',
  successSoft: '#E4F1E5',
  danger: '#C0392B',
  dangerSoft: '#FBE7E4',

  border: '#E9E2D4',
  shadow: '#000000',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
} as const;

export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 22,
  xxl: 28,
  display: 34,
} as const;

/**
 * Identidade visual do Aurium-Stall.
 * Paleta azul-marinho (navy) + branco, com a fonte do sistema Apple (San Francisco).
 */
import { Platform, type TextStyle } from 'react-native';

export const colors = {
  bg: '#F4F6FB',
  surface: '#FFFFFF',
  surfaceAlt: '#EEF1F8',

  text: '#0F1E3D',
  textMuted: '#5C6B86',
  textInverse: '#FFFFFF',

  // Azul-marinho da marca
  primary: '#14274E', // navy — botões / cabeçalho / ações principais
  primaryDark: '#0D1B38', // estado pressionado
  accent: '#3461C9', // azul mais vivo — destaques, barras de gráfico
  accentSoft: '#E5ECFA', // fundos de destaque

  // Semânticos (no contexto de preços: subiu = ruim/vermelho, caiu = bom/verde)
  success: '#1E8E3E',
  successSoft: '#E4F3E8',
  danger: '#C62828',
  dangerSoft: '#FBE7E6',

  border: '#E1E7F1',
  shadow: '#000000',
} as const;

/**
 * Fonte do sistema Apple (San Francisco / SF Pro).
 * No iOS, 'System' já é a San Francisco. Na web e no Android usamos a
 * pilha de fontes do sistema, que cai na San Francisco em aparelhos Apple.
 */
const appleStack =
  '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Segoe UI", Roboto, system-ui, sans-serif';

export const fonts = {
  sans: Platform.select({ ios: 'System', default: appleStack }) as string,
};

/** Aplica a fonte do app a qualquer estilo de texto. */
export const fontFamily: TextStyle = { fontFamily: fonts.sans };

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

/**
 * Gráficos leves construídos só com Views (sem dependências nativas extras),
 * para funcionar de forma confiável no Expo Go.
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fontSize, radius, spacing } from '@/theme';
import { formatBRL } from '@/lib/format';

export type BarDatum = { label: string; value: number };

/** Gráfico de barras verticais (ex.: gasto por mês). */
export function BarChart({ data, height = 140 }: { data: BarDatum[]; height?: number }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <View style={[styles.barChart, { height: height + 28 }]}>
      {data.map((d, i) => {
        const h = d.value > 0 ? Math.max(4, (d.value / max) * height) : 2;
        return (
          <View key={i} style={styles.barCol}>
            <Text style={styles.barValue} numberOfLines={1}>
              {d.value > 0 ? formatBRL(d.value).replace('R$ ', '') : ''}
            </Text>
            <View style={[styles.bar, { height: h }]} />
            <Text style={styles.barLabel}>{d.label}</Text>
          </View>
        );
      })}
    </View>
  );
}

/** Mini gráfico de linha (sparkline) para histórico de preços de um produto. */
export function Sparkline({
  values,
  width = 90,
  height = 36,
}: {
  values: number[];
  width?: number;
  height?: number;
}) {
  if (values.length < 2) {
    return <View style={{ width, height }} />;
  }
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const step = width / (values.length - 1);
  const up = values[values.length - 1] >= values[0];
  const tint = up ? colors.danger : colors.success;

  return (
    <View style={{ width, height, justifyContent: 'flex-end' }}>
      <View style={{ width, height, flexDirection: 'row', alignItems: 'flex-end' }}>
        {values.map((v, i) => {
          const norm = (v - min) / range;
          const dotBottom = norm * (height - 6);
          return (
            <View key={i} style={{ width: step || width, height, justifyContent: 'flex-end' }}>
              <View
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: 3,
                  backgroundColor: tint,
                  marginBottom: dotBottom,
                }}
              />
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  barChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: spacing.xs,
  },
  barCol: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  bar: {
    width: '70%',
    backgroundColor: colors.accent,
    borderTopLeftRadius: radius.sm,
    borderTopRightRadius: radius.sm,
  },
  barValue: {
    fontSize: 10,
    color: colors.textMuted,
    marginBottom: spacing.xs,
    fontWeight: '600',
  },
  barLabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
});

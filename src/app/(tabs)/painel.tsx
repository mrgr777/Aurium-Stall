import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '@/context/AppContext';
import { Button, Card, SectionTitle } from '@/components/ui';
import { BarChart } from '@/components/Charts';
import { colors, fontSize, radius, spacing } from '@/theme';
import { formatBRL } from '@/lib/format';
import {
  biggestFallers,
  biggestRisers,
  monthlySpend,
  spentThisMonth,
  topProducts,
  type PriceMover,
} from '@/lib/analytics';

export default function PainelScreen() {
  const { user, purchases, products, signOut } = useApp();
  const insets = useSafeAreaInsets();

  const thisMonth = useMemo(() => spentThisMonth(purchases), [purchases]);
  const months = useMemo(() => monthlySpend(purchases, 6), [purchases]);
  const top = useMemo(() => topProducts(purchases, 5), [purchases]);
  const risers = useMemo(() => biggestRisers(products, 3), [products]);
  const fallers = useMemo(() => biggestFallers(products, 3), [products]);
  const totalPurchases = purchases.length;

  const hasData = totalPurchases > 0;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={[
        styles.container,
        { paddingTop: insets.top + spacing.md, paddingBottom: insets.bottom + spacing.xxl },
      ]}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Olá, {user?.name}</Text>
          <Text style={styles.headerTitle}>Painel</Text>
        </View>
      </View>

      {/* Gasto no mês */}
      <Card style={styles.heroCard}>
        <Text style={styles.heroLabel}>Gasto neste mês</Text>
        <Text style={styles.heroValue}>{formatBRL(thisMonth)}</Text>
        <Text style={styles.heroSub}>
          {totalPurchases} {totalPurchases === 1 ? 'compra registrada' : 'compras registradas'}
        </Text>
      </Card>

      {!hasData ? (
        <Card style={{ marginTop: spacing.lg, alignItems: 'center', gap: spacing.sm }}>
          <Text style={{ fontSize: 40 }}>📊</Text>
          <Text style={styles.emptyTitle}>Ainda sem indicadores</Text>
          <Text style={styles.emptySubtitle}>
            Finalize sua primeira compra na aba Lista para começar a ver seus gastos e a evolução
            dos preços aqui.
          </Text>
        </Card>
      ) : (
        <>
          {/* Evolução de gastos */}
          <View style={{ marginTop: spacing.xl }}>
            <SectionTitle>Gasto por mês</SectionTitle>
            <Card>
              <BarChart data={months} />
            </Card>
          </View>

          {/* O que mais pesou na cesta */}
          {top.length > 0 ? (
            <View style={{ marginTop: spacing.xl }}>
              <SectionTitle>O que mais pesou na cesta</SectionTitle>
              <Card style={{ gap: spacing.md }}>
                {top.map((p, i) => (
                  <View key={i} style={styles.topRow}>
                    <Text style={styles.topRank}>{i + 1}</Text>
                    <View style={{ flex: 1 }}>
                      <View style={styles.topHeader}>
                        <Text style={styles.topName} numberOfLines={1}>
                          {p.name}
                        </Text>
                        <Text style={styles.topValue}>{formatBRL(p.total)}</Text>
                      </View>
                      <View style={styles.barTrack}>
                        <View style={[styles.barFill, { width: `${Math.max(6, p.share * 100)}%` }]} />
                      </View>
                    </View>
                  </View>
                ))}
              </Card>
            </View>
          ) : null}

          {/* Variação de preços */}
          {risers.length > 0 ? (
            <View style={{ marginTop: spacing.xl }}>
              <SectionTitle>Produtos que mais subiram</SectionTitle>
              <Card style={{ gap: spacing.sm }}>
                {risers.map((m, i) => (
                  <MoverRow key={i} mover={m} direction="up" />
                ))}
              </Card>
            </View>
          ) : null}

          {fallers.length > 0 ? (
            <View style={{ marginTop: spacing.xl }}>
              <SectionTitle>Produtos que mais caíram</SectionTitle>
              <Card style={{ gap: spacing.sm }}>
                {fallers.map((m, i) => (
                  <MoverRow key={i} mover={m} direction="down" />
                ))}
              </Card>
            </View>
          ) : null}

          {risers.length === 0 && fallers.length === 0 ? (
            <Text style={styles.hint}>
              Dica: registre o mesmo produto em compras diferentes para acompanhar a evolução do
              preço dele.
            </Text>
          ) : null}
        </>
      )}

      <Button
        title="Sair da conta"
        variant="secondary"
        onPress={signOut}
        style={{ marginTop: spacing.xxl }}
      />
    </ScrollView>
  );
}

function MoverRow({ mover, direction }: { mover: PriceMover; direction: 'up' | 'down' }) {
  const tint = direction === 'up' ? colors.danger : colors.success;
  const soft = direction === 'up' ? colors.dangerSoft : colors.successSoft;
  return (
    <View style={styles.moverRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.moverName} numberOfLines={1}>
          {mover.name}
        </Text>
        <Text style={styles.moverPrices}>
          {formatBRL(mover.previous)} → {formatBRL(mover.current)}
        </Text>
      </View>
      <View style={[styles.badge, { backgroundColor: soft }]}>
        <Ionicons
          name={direction === 'up' ? 'arrow-up' : 'arrow-down'}
          size={14}
          color={tint}
        />
        <Text style={[styles.badgeText, { color: tint }]}>
          {Math.abs(mover.changePct).toFixed(0)}%
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: spacing.lg },
  header: { marginBottom: spacing.lg },
  greeting: { fontSize: fontSize.sm, color: colors.textMuted },
  headerTitle: { fontSize: fontSize.xxl, fontWeight: '800', color: colors.text },
  heroCard: { backgroundColor: colors.primary, borderColor: colors.primary },
  heroLabel: { color: colors.accentSoft, fontSize: fontSize.sm, fontWeight: '600' },
  heroValue: {
    color: colors.textInverse,
    fontSize: fontSize.display,
    fontWeight: '800',
    marginVertical: spacing.xs,
  },
  heroSub: { color: colors.accentSoft, fontSize: fontSize.sm },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  topRank: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.accentSoft,
    color: colors.primary,
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '800',
    fontSize: fontSize.sm,
    overflow: 'hidden',
  },
  topHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs },
  topName: { flex: 1, fontSize: fontSize.md, fontWeight: '600', color: colors.text, marginRight: spacing.sm },
  topValue: { fontSize: fontSize.md, fontWeight: '800', color: colors.text },
  barTrack: { height: 8, backgroundColor: colors.surfaceAlt, borderRadius: radius.pill, overflow: 'hidden' },
  barFill: { height: 8, backgroundColor: colors.accent, borderRadius: radius.pill },
  moverRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xs,
  },
  moverName: { fontSize: fontSize.md, fontWeight: '600', color: colors.text },
  moverPrices: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: 2 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
  },
  badgeText: { fontSize: fontSize.sm, fontWeight: '800' },
  emptyTitle: { fontSize: fontSize.lg, fontWeight: '700', color: colors.text },
  emptySubtitle: { fontSize: fontSize.sm, color: colors.textMuted, textAlign: 'center' },
  hint: {
    marginTop: spacing.lg,
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

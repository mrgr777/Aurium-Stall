import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui';
import { colors, fontFamily, fontSize, radius, spacing } from '@/theme';
import { formatBRL, parsePrice } from '@/lib/format';
import { alertDialog, confirmDialog } from '@/lib/dialog';
import type { ListItem } from '@/types';

/** Texto da quantidade conforme a unidade. */
function qtyText(item: ListItem): string {
  if (item.unit === 'kg') {
    return `${item.qty.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} kg`;
  }
  if (item.unit === 'pacote') {
    return `${item.qty} ${item.qty > 1 ? 'pacotes' : 'pacote'}`;
  }
  return `${item.qty} un`;
}

/** Sufixo do preço por unidade de venda. */
function priceSuffix(unit: ListItem['unit']): string {
  if (unit === 'kg') return '/kg';
  if (unit === 'pacote') return '/pac';
  return '/un';
}

export default function ListaScreen() {
  const {
    user,
    products,
    activeList,
    addToList,
    addNewToList,
    updateListItem,
    removeListItem,
    toggleChecked,
    finalizePurchase,
    clearList,
  } = useApp();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [query, setQuery] = useState('');

  // Mapa para descobrir os tamanhos de pacote de cada produto.
  const packSizesByProduct = useMemo(() => {
    const map = new Map<string, number[] | undefined>();
    products.forEach((p) => map.set(p.id, p.packSizes));
    return map;
  }, [products]);

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const inList = new Set(activeList.map((i) => i.productId));
    return products
      .filter((p) => !inList.has(p.id) && p.name.toLowerCase().includes(q))
      .slice(0, 6);
  }, [query, products, activeList]);

  const exactMatch = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.some((p) => p.name.toLowerCase() === q);
  }, [query, products]);

  const cartItems = activeList.filter((i) => i.checked);
  const cartTotal = cartItems.reduce((s, i) => s + i.qty * i.unitPrice, 0);
  const estimatedTotal = activeList.reduce((s, i) => s + i.qty * i.unitPrice, 0);

  function handleCreate() {
    const name = query.trim();
    if (name.length < 2) return;
    addNewToList({ name, category: 'Outros', unit: 'un' });
    setQuery('');
  }

  function handleFinalize() {
    const res = finalizePurchase();
    if (!res.ok) {
      alertDialog('Ops', res.error ?? 'Não foi possível finalizar.');
      return;
    }
    alertDialog('Compra finalizada! 🎉', 'Os preços foram salvos no seu histórico.');
  }

  function confirmClear() {
    confirmDialog({
      title: 'Limpar lista',
      message: 'Remover todos os itens da lista atual?',
      confirmText: 'Limpar',
      destructive: true,
      onConfirm: clearList,
    });
  }

  return (
    <View style={[styles.screen, { paddingTop: spacing.md }]}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Olá, {user?.name} 👋</Text>
        {activeList.length > 0 ? (
          <Pressable onPress={confirmClear} hitSlop={10}>
            <Ionicons name="trash-outline" size={22} color={colors.textMuted} />
          </Pressable>
        ) : null}
      </View>

      {/* Adicionar item */}
      <View style={styles.addRow}>
        <Ionicons name="add-circle" size={22} color={colors.primary} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Adicionar item..."
          placeholderTextColor={colors.textMuted}
          style={styles.addInput}
          returnKeyType="done"
          onSubmitEditing={() => {
            if (query.trim().length >= 2 && !exactMatch) handleCreate();
          }}
        />
      </View>

      {query.trim().length > 0 ? (
        <View style={styles.suggestions}>
          {suggestions.map((p) => (
            <Pressable
              key={p.id}
              style={styles.suggestion}
              onPress={() => {
                addToList(p.id);
                setQuery('');
              }}
            >
              <Ionicons name="pricetag-outline" size={16} color={colors.textMuted} />
              <Text style={styles.suggestionText}>{p.name}</Text>
              {p.lastPrice != null ? (
                <Text style={styles.suggestionPrice}>
                  {formatBRL(p.lastPrice)}
                  {priceSuffix(p.unit)}
                </Text>
              ) : null}
            </Pressable>
          ))}
          {!exactMatch && query.trim().length >= 2 ? (
            <Pressable style={styles.suggestionCreate} onPress={handleCreate}>
              <Ionicons name="add" size={18} color={colors.primary} />
              <Text style={styles.suggestionCreateText}>
                Criar “{query.trim()}” e adicionar
              </Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}

      <FlatList
        data={activeList}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ paddingBottom: 220 }}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => (
          <ItemRow
            item={item}
            packSizes={packSizesByProduct.get(item.productId)}
            onToggle={() => toggleChecked(item.id)}
            onQty={(qty) => updateListItem(item.id, { qty })}
            onPrice={(unitPrice) => updateListItem(item.id, { unitPrice })}
            onPackSize={(packSize) => updateListItem(item.id, { packSize })}
            onRemove={() => removeListItem(item.id)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>📝</Text>
            <Text style={styles.emptyTitle}>Sua lista está vazia</Text>
            <Text style={styles.emptySubtitle}>
              Escolha produtos prontos da lista, ou digite acima o que precisa comprar.
            </Text>
            <Button
              title="🛒  Escolher produtos"
              onPress={() => router.push('/produtos')}
              style={{ marginTop: spacing.lg, alignSelf: 'stretch' }}
            />
          </View>
        }
      />

      {/* Rodapé com total e ação */}
      {activeList.length > 0 ? (
        <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
          <View style={styles.totalRow}>
            <View>
              <Text style={styles.totalLabel}>No carrinho ({cartItems.length})</Text>
              <Text style={styles.totalValue}>{formatBRL(cartTotal)}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.totalLabel}>Estimativa total</Text>
              <Text style={styles.estimateValue}>{formatBRL(estimatedTotal)}</Text>
            </View>
          </View>
          <Button title="Finalizar compra" onPress={handleFinalize} />
        </View>
      ) : null}
    </View>
  );
}

function ItemRow({
  item,
  packSizes,
  onToggle,
  onQty,
  onPrice,
  onPackSize,
  onRemove,
}: {
  item: ListItem;
  packSizes?: number[];
  onToggle: () => void;
  onQty: (qty: number) => void;
  onPrice: (price: number) => void;
  onPackSize: (packSize: number) => void;
  onRemove: () => void;
}) {
  const [priceText, setPriceText] = useState(
    item.unitPrice > 0 ? item.unitPrice.toFixed(2).replace('.', ',') : '',
  );

  const step = item.unit === 'kg' ? 0.5 : 1;
  const min = item.unit === 'kg' ? 0.5 : 1;
  const round = (n: number) => Math.round(n * 100) / 100;

  return (
    <View style={[styles.item, item.checked && styles.itemChecked]}>
      <Pressable onPress={onToggle} hitSlop={8} style={styles.checkbox}>
        <Ionicons
          name={item.checked ? 'checkmark-circle' : 'ellipse-outline'}
          size={26}
          color={item.checked ? colors.success : colors.textMuted}
        />
      </Pressable>

      <View style={{ flex: 1 }}>
        <Text style={[styles.itemName, item.checked && styles.itemNameChecked]} numberOfLines={1}>
          {item.name}
        </Text>

        {/* Seletor de tamanho do pacote (só para bebidas/packs) */}
        {item.unit === 'pacote' && packSizes && packSizes.length > 0 ? (
          <View style={styles.packRow}>
            {packSizes.map((size) => (
              <Pressable
                key={size}
                onPress={() => onPackSize(size)}
                style={[styles.packChip, item.packSize === size && styles.packChipActive]}
              >
                <Text
                  style={[
                    styles.packChipText,
                    item.packSize === size && styles.packChipTextActive,
                  ]}
                >
                  {size} un
                </Text>
              </Pressable>
            ))}
          </View>
        ) : null}

        <View style={styles.itemControls}>
          <View style={styles.qtyStepper}>
            <Pressable
              onPress={() => onQty(Math.max(min, round(item.qty - step)))}
              hitSlop={6}
              style={styles.qtyBtn}
            >
              <Ionicons name="remove" size={16} color={colors.text} />
            </Pressable>
            <Text style={styles.qtyText}>{qtyText(item)}</Text>
            <Pressable onPress={() => onQty(round(item.qty + step))} hitSlop={6} style={styles.qtyBtn}>
              <Ionicons name="add" size={16} color={colors.text} />
            </Pressable>
          </View>

          <View style={styles.priceBox}>
            <Text style={styles.priceCurrency}>R$</Text>
            <TextInput
              value={priceText}
              onChangeText={(t) => {
                setPriceText(t);
                onPrice(parsePrice(t));
              }}
              placeholder="0,00"
              placeholderTextColor={colors.textMuted}
              style={styles.priceInput}
              keyboardType="decimal-pad"
            />
            <Text style={styles.priceSuffix}>{priceSuffix(item.unit)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.itemRight}>
        <Text style={styles.lineTotal}>{formatBRL(item.qty * item.unitPrice)}</Text>
        <Pressable onPress={onRemove} hitSlop={8}>
          <Ionicons name="close" size={18} color={colors.textMuted} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: spacing.lg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  greeting: { ...fontFamily, fontSize: fontSize.lg, fontWeight: '700', color: colors.text },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  addInput: { ...fontFamily, flex: 1, paddingVertical: spacing.md, fontSize: fontSize.md, color: colors.text },
  suggestions: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    marginTop: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  suggestion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  suggestionText: { ...fontFamily, flex: 1, fontSize: fontSize.md, color: colors.text },
  suggestionPrice: { ...fontFamily, fontSize: fontSize.sm, color: colors.textMuted },
  suggestionCreate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.accentSoft,
  },
  suggestionCreateText: { ...fontFamily, fontSize: fontSize.md, color: colors.primary, fontWeight: '700' },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  itemChecked: { backgroundColor: colors.successSoft, borderColor: colors.successSoft },
  checkbox: { paddingRight: spacing.xs },
  itemName: { ...fontFamily, fontSize: fontSize.md, fontWeight: '700', color: colors.text },
  itemNameChecked: { textDecorationLine: 'line-through', color: colors.textMuted },
  packRow: { flexDirection: 'row', gap: spacing.xs, marginTop: spacing.sm },
  packChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  packChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  packChipText: { ...fontFamily, fontSize: fontSize.xs, color: colors.textMuted, fontWeight: '600' },
  packChipTextActive: { color: colors.textInverse },
  itemControls: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginTop: spacing.sm },
  qtyStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
  },
  qtyBtn: { padding: spacing.sm },
  qtyText: {
    ...fontFamily,
    minWidth: 56,
    textAlign: 'center',
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.text,
  },
  priceBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
  },
  priceCurrency: { ...fontFamily, fontSize: fontSize.sm, color: colors.textMuted, marginRight: 2 },
  priceInput: { ...fontFamily, minWidth: 50, paddingVertical: spacing.sm, fontSize: fontSize.md, color: colors.text },
  priceSuffix: { ...fontFamily, fontSize: fontSize.xs, color: colors.textMuted, marginLeft: 2 },
  itemRight: { alignItems: 'flex-end', gap: spacing.sm },
  lineTotal: { ...fontFamily, fontSize: fontSize.md, fontWeight: '800', color: colors.text },
  empty: { alignItems: 'center', paddingVertical: spacing.xxl * 1.5, paddingHorizontal: spacing.xl },
  emptyEmoji: { fontSize: 48, marginBottom: spacing.md },
  emptyTitle: { ...fontFamily, fontSize: fontSize.lg, fontWeight: '700', color: colors.text },
  emptySubtitle: {
    ...fontFamily,
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.md,
  },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  totalLabel: { ...fontFamily, fontSize: fontSize.xs, color: colors.textMuted },
  totalValue: { ...fontFamily, fontSize: fontSize.xxl, fontWeight: '800', color: colors.success },
  estimateValue: { ...fontFamily, fontSize: fontSize.lg, fontWeight: '700', color: colors.text },
});

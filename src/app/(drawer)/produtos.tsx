import { useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '@/context/AppContext';
import { Button, Pill } from '@/components/ui';
import { Sparkline } from '@/components/Charts';
import { colors, fontFamily, fontSize, radius, spacing } from '@/theme';
import { formatBRL, parsePrice } from '@/lib/format';
import { CATEGORIES, unitLabel, type Product, type Unit } from '@/types';

const DEFAULT_PACKS = [4, 6, 12];

type SaveInput = {
  name: string;
  category: string;
  unit: Unit;
  packSizes?: number[];
  price: number | null;
};

function priceSuffix(unit: Unit): string {
  if (unit === 'kg') return '/kg';
  if (unit === 'pacote') return '/pac';
  return '/un';
}

export default function ProdutosScreen() {
  const { products, activeList, addProduct, updateProduct, removeProduct, addToList } = useApp();
  const insets = useSafeAreaInsets();

  const [filter, setFilter] = useState<string>('Todos');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);

  const inList = useMemo(() => new Set(activeList.map((i) => i.productId)), [activeList]);

  const filtered = useMemo(() => {
    const list = filter === 'Todos' ? products : products.filter((p) => p.category === filter);
    return [...list].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  }, [products, filter]);

  function openAdd() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(p: Product) {
    setEditing(p);
    setModalOpen(true);
  }

  function confirmDelete(p: Product) {
    Alert.alert('Excluir produto', `Remover “${p.name}” do catálogo?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: () => removeProduct(p.id) },
    ]);
  }

  return (
    <View style={[styles.screen, { paddingTop: spacing.md }]}>
      <View style={styles.header}>
        <Text style={styles.headerHint}>
          {products.length} {products.length === 1 ? 'produto' : 'produtos'} no catálogo
        </Text>
        <Pressable onPress={openAdd} style={styles.addBtn} hitSlop={8}>
          <Ionicons name="add" size={22} color={colors.textInverse} />
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filters}
        style={{ flexGrow: 0, marginBottom: spacing.sm }}
      >
        <Pill label="Todos" active={filter === 'Todos'} onPress={() => setFilter('Todos')} />
        {CATEGORIES.map((c) => (
          <Pill key={c} label={c} active={filter === c} onPress={() => setFilter(c)} />
        ))}
      </ScrollView>

      <FlatList
        data={filtered}
        keyExtractor={(p) => p.id}
        contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xl }}
        renderItem={({ item }) => {
          const already = inList.has(item.id);
          return (
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.name}</Text>
                <View style={styles.metaRow}>
                  <Text style={styles.category}>{item.category}</Text>
                  <Text style={styles.unitTag}>{unitLabel(item.unit)}</Text>
                  <Text style={styles.price}>
                    {item.lastPrice != null
                      ? `${formatBRL(item.lastPrice)}${priceSuffix(item.unit)}`
                      : 'sem preço'}
                  </Text>
                </View>
              </View>

              <Sparkline values={item.priceHistory.map((h) => h.price)} />

              <Pressable onPress={() => openEdit(item)} hitSlop={6} style={styles.iconBtn}>
                <Ionicons name="create-outline" size={20} color={colors.textMuted} />
              </Pressable>
              <Pressable onPress={() => confirmDelete(item)} hitSlop={6} style={styles.iconBtn}>
                <Ionicons name="trash-outline" size={20} color={colors.textMuted} />
              </Pressable>
              <Pressable
                onPress={() => addToList(item.id)}
                disabled={already}
                hitSlop={6}
                style={[styles.iconBtn, styles.cartBtn, already && styles.cartBtnDisabled]}
              >
                <Ionicons name={already ? 'checkmark' : 'cart'} size={18} color={colors.textInverse} />
              </Pressable>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🏷️</Text>
            <Text style={styles.emptyTitle}>Nenhum produto nesta categoria</Text>
            <Text style={styles.emptySubtitle}>
              Toque no botão + para adicionar um produto novo.
            </Text>
          </View>
        }
      />

      <ProductModal
        visible={modalOpen}
        product={editing}
        onClose={() => setModalOpen(false)}
        onSave={(input) => {
          if (editing) {
            updateProduct(editing.id, {
              name: input.name,
              category: input.category,
              unit: input.unit,
              packSizes: input.packSizes,
              lastPrice: input.price,
              // Se o preço mudou manualmente, registra no histórico.
              priceHistory:
                input.price != null && input.price !== editing.lastPrice
                  ? [...editing.priceHistory, { price: input.price, date: new Date().toISOString() }]
                  : editing.priceHistory,
            });
          } else {
            addProduct(input);
          }
          setModalOpen(false);
        }}
      />
    </View>
  );
}

function ProductModal({
  visible,
  product,
  onClose,
  onSave,
}: {
  visible: boolean;
  product: Product | null;
  onClose: () => void;
  onSave: (input: SaveInput) => void;
}) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<string>('Outros');
  const [unit, setUnit] = useState<Unit>('un');
  const [packs, setPacks] = useState<number[]>(DEFAULT_PACKS);
  const [priceText, setPriceText] = useState('');

  // Reinicializa os campos quando o modal abre.
  const [lastVisible, setLastVisible] = useState(false);
  if (visible !== lastVisible) {
    setLastVisible(visible);
    if (visible) {
      setName(product?.name ?? '');
      setCategory(product?.category ?? 'Outros');
      setUnit(product?.unit ?? 'un');
      setPacks(product?.packSizes ?? DEFAULT_PACKS);
      setPriceText(
        product?.lastPrice != null ? product.lastPrice.toFixed(2).replace('.', ',') : '',
      );
    }
  }

  const valid = name.trim().length >= 2 && (unit !== 'pacote' || packs.length > 0);

  function togglePack(size: number) {
    setPacks((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size].sort((a, b) => a - b),
    );
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.modalBackdrop}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{product ? 'Editar produto' : 'Novo produto'}</Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <Ionicons name="close" size={24} color={colors.textMuted} />
            </Pressable>
          </View>

          <Text style={styles.label}>Nome</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Ex.: Arroz 5kg"
            placeholderTextColor={colors.textMuted}
            style={styles.input}
            autoCapitalize="sentences"
          />

          <Text style={styles.label}>Categoria</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
            {CATEGORIES.map((c) => (
              <Pill key={c} label={c} active={category === c} onPress={() => setCategory(c)} />
            ))}
          </ScrollView>

          <Text style={styles.label}>Como é vendido?</Text>
          <View style={styles.unitRow}>
            <Pill label="Por unidade" active={unit === 'un'} onPress={() => setUnit('un')} />
            <Pill label="Por quilo (kg)" active={unit === 'kg'} onPress={() => setUnit('kg')} />
            <Pill label="Pacote / fardo" active={unit === 'pacote'} onPress={() => setUnit('pacote')} />
          </View>

          {unit === 'pacote' ? (
            <>
              <Text style={styles.label}>Tamanhos de pacote (unidades por fardo)</Text>
              <View style={styles.unitRow}>
                {DEFAULT_PACKS.map((size) => (
                  <Pill
                    key={size}
                    label={`${size} un`}
                    active={packs.includes(size)}
                    onPress={() => togglePack(size)}
                  />
                ))}
              </View>
            </>
          ) : null}

          <Text style={styles.label}>
            Preço {unit === 'kg' ? 'por kg' : unit === 'pacote' ? 'por pacote' : 'por unidade'}{' '}
            (opcional)
          </Text>
          <View style={styles.priceField}>
            <Text style={styles.priceCurrency}>R$</Text>
            <TextInput
              value={priceText}
              onChangeText={setPriceText}
              placeholder="0,00"
              placeholderTextColor={colors.textMuted}
              style={styles.priceInput}
              keyboardType="decimal-pad"
            />
          </View>

          <Button
            title={product ? 'Salvar' : 'Adicionar'}
            disabled={!valid}
            onPress={() => {
              const price = priceText.trim() ? parsePrice(priceText) : null;
              onSave({
                name: name.trim(),
                category,
                unit,
                packSizes: unit === 'pacote' ? packs : undefined,
                price,
              });
            }}
            style={{ marginTop: spacing.lg }}
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
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
  headerHint: { ...fontFamily, fontSize: fontSize.sm, color: colors.textMuted, fontWeight: '600' },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filters: { gap: spacing.sm, paddingRight: spacing.lg },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  name: { ...fontFamily, fontSize: fontSize.md, fontWeight: '700', color: colors.text },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: 4, flexWrap: 'wrap' },
  category: {
    ...fontFamily,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
    overflow: 'hidden',
  },
  unitTag: {
    ...fontFamily,
    fontSize: fontSize.xs,
    color: colors.accent,
    backgroundColor: colors.accentSoft,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
    overflow: 'hidden',
    fontWeight: '700',
  },
  price: { ...fontFamily, fontSize: fontSize.sm, color: colors.text, fontWeight: '600' },
  iconBtn: { padding: spacing.xs },
  cartBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBtnDisabled: { backgroundColor: colors.success },
  empty: { alignItems: 'center', paddingVertical: spacing.xxl * 1.5, paddingHorizontal: spacing.xl },
  emptyEmoji: { fontSize: 48, marginBottom: spacing.md },
  emptyTitle: { ...fontFamily, fontSize: fontSize.lg, fontWeight: '700', color: colors.text, textAlign: 'center' },
  emptySubtitle: {
    ...fontFamily,
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  // Modal
  modalBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  modalCard: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.xl,
    gap: spacing.sm,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  modalTitle: { ...fontFamily, fontSize: fontSize.xl, fontWeight: '800', color: colors.text },
  label: { ...fontFamily, fontSize: fontSize.sm, fontWeight: '600', color: colors.text, marginTop: spacing.sm },
  input: {
    ...fontFamily,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: fontSize.md,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  unitRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  priceField: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  priceCurrency: { ...fontFamily, fontSize: fontSize.md, color: colors.textMuted, marginRight: spacing.xs },
  priceInput: { ...fontFamily, flex: 1, paddingVertical: spacing.md, fontSize: fontSize.md, color: colors.text },
});

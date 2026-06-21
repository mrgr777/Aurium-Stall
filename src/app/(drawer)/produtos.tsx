import { useEffect, useMemo, useRef, useState } from 'react';
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
import { useRouter } from 'expo-router';
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
  const {
    products,
    activeList,
    addProduct,
    updateProduct,
    removeProduct,
    restoreSeed,
    addToList,
  } = useApp();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [filter, setFilter] = useState<string>('Todos');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const inList = useMemo(() => new Set(activeList.map((i) => i.productId)), [activeList]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = products.filter(
      (p) =>
        (filter === 'Todos' || p.category === filter) &&
        (q === '' || p.name.toLowerCase().includes(q)),
    );
    return [...list].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  }, [products, filter, search]);

  useEffect(() => () => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
  }, []);

  function showToast(msg: string) {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 1800);
  }

  function handleAdd(p: Product) {
    if (inList.has(p.id)) {
      router.push('/lista');
      return;
    }
    addToList(p.id);
    showToast(`“${p.name}” foi para a lista`);
  }

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
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: () => {
          removeProduct(p.id);
          setModalOpen(false);
        },
      },
    ]);
  }

  return (
    <View style={[styles.screen, { paddingTop: spacing.md }]}>
      {/* Busca + criar novo */}
      <View style={styles.topBar}>
        <View style={styles.search}>
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Buscar produto..."
            placeholderTextColor={colors.textMuted}
            style={styles.searchInput}
          />
          {search.length > 0 ? (
            <Pressable onPress={() => setSearch('')} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </Pressable>
          ) : null}
        </View>
        <Pressable onPress={openAdd} style={styles.addBtn} hitSlop={8}>
          <Ionicons name="add" size={24} color={colors.textInverse} />
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
        style={{ flex: 1 }}
        data={filtered}
        keyExtractor={(p) => p.id}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: insets.bottom + 90 }}
        renderItem={({ item }) => {
          const already = inList.has(item.id);
          return (
            <View style={[styles.row, already && styles.rowAdded]}>
              <Pressable style={styles.rowMain} onPress={() => handleAdd(item)}>
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
                {item.priceHistory.length >= 2 ? (
                  <Sparkline values={item.priceHistory.map((h) => h.price)} />
                ) : null}
              </Pressable>

              <Pressable
                onPress={() => handleAdd(item)}
                style={[styles.addPill, already && styles.addPillDone]}
              >
                <Ionicons
                  name={already ? 'checkmark' : 'add'}
                  size={18}
                  color={already ? colors.success : colors.textInverse}
                />
                <Text style={[styles.addPillText, already && styles.addPillTextDone]}>
                  {already ? 'Na lista' : 'Adicionar'}
                </Text>
              </Pressable>

              <Pressable onPress={() => openEdit(item)} hitSlop={8} style={styles.editBtn}>
                <Ionicons name="ellipsis-vertical" size={18} color={colors.textMuted} />
              </Pressable>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🏷️</Text>
            <Text style={styles.emptyTitle}>
              {search || filter !== 'Todos'
                ? 'Nenhum produto encontrado'
                : 'Seu catálogo está vazio'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {search || filter !== 'Todos'
                ? 'Tente outra busca ou categoria.'
                : 'Toque abaixo para trazer de volta os produtos comuns.'}
            </Text>
            {!search && filter === 'Todos' ? (
              <Button
                title="Restaurar produtos comuns"
                variant="secondary"
                onPress={restoreSeed}
                style={{ marginTop: spacing.lg }}
              />
            ) : null}
          </View>
        }
      />

      {/* Toast de confirmação */}
      {toast ? (
        <View style={[styles.toast, { bottom: insets.bottom + 84 }]}>
          <Ionicons name="checkmark-circle" size={18} color={colors.textInverse} />
          <Text style={styles.toastText}>{toast}</Text>
        </View>
      ) : null}

      {/* Botão flutuante: ver minha lista */}
      {activeList.length > 0 ? (
        <Pressable
          style={[styles.fab, { bottom: insets.bottom + spacing.md }]}
          onPress={() => router.push('/lista')}
        >
          <Ionicons name="cart" size={20} color={colors.textInverse} />
          <Text style={styles.fabText}>Ver minha lista ({activeList.length})</Text>
        </Pressable>
      ) : null}

      <ProductModal
        visible={modalOpen}
        product={editing}
        onClose={() => setModalOpen(false)}
        onDelete={editing ? () => confirmDelete(editing) : undefined}
        onSave={(input) => {
          if (editing) {
            updateProduct(editing.id, {
              name: input.name,
              category: input.category,
              unit: input.unit,
              packSizes: input.packSizes,
              lastPrice: input.price,
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
  onDelete,
}: {
  visible: boolean;
  product: Product | null;
  onClose: () => void;
  onSave: (input: SaveInput) => void;
  onDelete?: () => void;
}) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<string>('Outros');
  const [unit, setUnit] = useState<Unit>('un');
  const [packs, setPacks] = useState<number[]>(DEFAULT_PACKS);
  const [priceText, setPriceText] = useState('');

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

          {onDelete ? (
            <Pressable onPress={onDelete} style={styles.deleteBtn} hitSlop={8}>
              <Ionicons name="trash-outline" size={18} color={colors.danger} />
              <Text style={styles.deleteText}>Excluir produto</Text>
            </Pressable>
          ) : null}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: spacing.lg },
  topBar: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  search: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: { ...fontFamily, flex: 1, paddingVertical: spacing.md, fontSize: fontSize.md, color: colors.text },
  addBtn: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
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
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rowAdded: { borderColor: colors.success, backgroundColor: colors.successSoft },
  rowMain: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, minHeight: 44 },
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
  addPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    minHeight: 40,
  },
  addPillDone: { backgroundColor: colors.successSoft },
  addPillText: { ...fontFamily, fontSize: fontSize.sm, color: colors.textInverse, fontWeight: '700' },
  addPillTextDone: { color: colors.success },
  editBtn: { padding: spacing.sm, minWidth: 36, alignItems: 'center' },
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
  toast: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.text,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
  },
  toastText: { ...fontFamily, color: colors.textInverse, fontSize: fontSize.sm, fontWeight: '600' },
  fab: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
  },
  fabText: { ...fontFamily, color: colors.textInverse, fontSize: fontSize.md, fontWeight: '800' },
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
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    marginTop: spacing.xs,
  },
  deleteText: { ...fontFamily, color: colors.danger, fontSize: fontSize.md, fontWeight: '700' },
});

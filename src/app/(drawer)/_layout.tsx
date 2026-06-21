import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Slot, usePathname, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '@/context/AppContext';
import { colors, fontFamily, fontSize, radius, spacing } from '@/theme';

type IconName = keyof typeof Ionicons.glyphMap;

const NAV: { path: string; label: string; icon: IconName }[] = [
  { path: '/lista', label: 'Lista de compras', icon: 'cart-outline' },
  { path: '/produtos', label: 'Produtos', icon: 'pricetags-outline' },
  { path: '/painel', label: 'Painel', icon: 'stats-chart-outline' },
];

function titleFor(pathname: string): string {
  return NAV.find((n) => pathname.startsWith(n.path))?.label ?? 'Aurium-Stall';
}

/**
 * Layout do app logado: cabeçalho navy fixo + conteúdo da rota (Slot) +
 * menu suspenso que abre pela lateral direita.
 */
export default function DrawerLayout() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();
  const { signOut } = useApp();
  const [open, setOpen] = useState(false);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <StatusBar style="light" />

      {/* Cabeçalho navy */}
      <View style={[styles.header, { paddingTop: insets.top, height: 56 + insets.top }]}>
        <View style={{ width: 40 }} />
        <Text style={styles.title} numberOfLines={1}>
          {titleFor(pathname)}
        </Text>
        <Pressable onPress={() => setOpen(true)} hitSlop={10} style={styles.menuBtn}>
          <Ionicons name="menu" size={26} color={colors.textInverse} />
        </Pressable>
      </View>

      {/* Conteúdo da tela atual */}
      <View style={{ flex: 1 }}>
        <Slot />
      </View>

      {/* Menu suspenso (lateral direita) */}
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable
            style={[styles.panel, { paddingTop: insets.top + spacing.xl, paddingBottom: insets.bottom + spacing.lg }]}
            onPress={() => {}}
          >
            <Text style={styles.panelBrand}>Aurium-Stall</Text>

            <View style={{ marginTop: spacing.lg, gap: spacing.xs }}>
              {NAV.map((n) => {
                const active = pathname.startsWith(n.path);
                return (
                  <Pressable
                    key={n.path}
                    style={[styles.navItem, active && styles.navItemActive]}
                    onPress={() => {
                      setOpen(false);
                      router.replace(n.path as never);
                    }}
                  >
                    <Ionicons
                      name={n.icon}
                      size={20}
                      color={active ? colors.primary : colors.textMuted}
                    />
                    <Text style={[styles.navLabel, active && styles.navLabelActive]}>
                      {n.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={{ flex: 1 }} />

            <Pressable
              style={styles.signOut}
              onPress={() => {
                setOpen(false);
                signOut();
              }}
            >
              <Ionicons name="log-out-outline" size={20} color={colors.danger} />
              <Text style={styles.signOutText}>Sair da conta</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
  },
  title: { ...fontFamily, flex: 1, textAlign: 'center', color: colors.textInverse, fontSize: fontSize.lg, fontWeight: '800' },
  menuBtn: { width: 40, alignItems: 'flex-end' },
  backdrop: { flex: 1, flexDirection: 'row', justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  panel: {
    width: '76%',
    maxWidth: 320,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
  },
  panelBrand: { ...fontFamily, fontSize: fontSize.xl, fontWeight: '800', color: colors.primary },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
  },
  navItemActive: { backgroundColor: colors.accentSoft },
  navLabel: { ...fontFamily, fontSize: fontSize.md, color: colors.textMuted, fontWeight: '600' },
  navLabelActive: { color: colors.primary, fontWeight: '800' },
  signOut: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  signOutText: { ...fontFamily, fontSize: fontSize.md, color: colors.danger, fontWeight: '700' },
});

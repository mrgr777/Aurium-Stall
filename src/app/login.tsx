import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '@/context/AppContext';
import { Button, Card } from '@/components/ui';
import { colors, fontSize, radius, spacing } from '@/theme';
import type { User } from '@/types';

export default function LoginScreen() {
  const { signIn, signUp, listUsers } = useApp();
  const insets = useSafeAreaInsets();

  const [users, setUsers] = useState<User[]>([]);
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    listUsers().then((u) => {
      setUsers(u);
      if (u.length === 0) setMode('signup');
      else setSelectedUser(u[0]);
    });
  }, [listUsers]);

  async function handleSubmit() {
    setError('');
    setLoading(true);
    try {
      if (mode === 'signup') {
        const res = await signUp(name, pin);
        if (!res.ok) setError(res.error ?? 'Não foi possível criar a conta.');
      } else {
        if (!selectedUser) {
          setError('Escolha um perfil.');
          return;
        }
        const res = await signIn(selectedUser.id, pin);
        if (!res.ok) setError(res.error ?? 'Não foi possível entrar.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingTop: insets.top + spacing.xxl, paddingBottom: insets.bottom + spacing.xl },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.brand}>
          <Text style={styles.logo}>🛒</Text>
          <Text style={styles.title}>Aurium-Stall</Text>
          <Text style={styles.subtitle}>Sua lista de compras inteligente</Text>
        </View>

        <Card style={{ gap: spacing.md }}>
          {mode === 'signin' && users.length > 0 ? (
            <>
              <Text style={styles.label}>Quem é você?</Text>
              <View style={styles.profiles}>
                {users.map((u) => (
                  <Pressable
                    key={u.id}
                    onPress={() => {
                      setSelectedUser(u);
                      setPin('');
                      setError('');
                    }}
                    style={[
                      styles.profile,
                      selectedUser?.id === u.id && styles.profileActive,
                    ]}
                  >
                    <Text style={styles.profileAvatar}>{u.name.charAt(0).toUpperCase()}</Text>
                    <Text
                      style={[
                        styles.profileName,
                        selectedUser?.id === u.id && styles.profileNameActive,
                      ]}
                      numberOfLines={1}
                    >
                      {u.name}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </>
          ) : (
            <>
              <Text style={styles.label}>Seu nome</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Ex.: Maria"
                placeholderTextColor={colors.textMuted}
                style={styles.input}
                autoCapitalize="words"
              />
            </>
          )}

          <Text style={styles.label}>PIN de 4 dígitos</Text>
          <TextInput
            value={pin}
            onChangeText={(t) => setPin(t.replace(/\D/g, '').slice(0, 4))}
            placeholder="••••"
            placeholderTextColor={colors.textMuted}
            style={[styles.input, styles.pinInput]}
            keyboardType="number-pad"
            secureTextEntry
            maxLength={4}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Button
            title={mode === 'signup' ? 'Criar conta' : 'Entrar'}
            onPress={handleSubmit}
            loading={loading}
          />
        </Card>

        <Pressable
          onPress={() => {
            setMode((m) => (m === 'signup' ? 'signin' : 'signup'));
            setError('');
            setPin('');
            setName('');
          }}
          style={styles.switchBtn}
        >
          <Text style={styles.switchText}>
            {mode === 'signup'
              ? users.length > 0
                ? 'Já tenho uma conta — entrar'
                : ''
              : 'Criar uma nova conta'}
          </Text>
        </Pressable>

        <Text style={styles.note}>
          Seus dados ficam guardados apenas neste aparelho.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: spacing.xl, gap: spacing.xl },
  brand: { alignItems: 'center', gap: spacing.xs },
  logo: { fontSize: 56 },
  title: { fontSize: fontSize.display, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: fontSize.md, color: colors.textMuted },
  label: { fontSize: fontSize.sm, fontWeight: '600', color: colors.text },
  input: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: fontSize.md,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pinInput: { letterSpacing: 8, fontSize: fontSize.xl, textAlign: 'center' },
  profiles: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  profile: {
    alignItems: 'center',
    gap: spacing.xs,
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: 'transparent',
    width: 76,
  },
  profileActive: { borderColor: colors.primary, backgroundColor: colors.accentSoft },
  profileAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.accent,
    color: colors.textInverse,
    textAlign: 'center',
    lineHeight: 48,
    fontSize: fontSize.xl,
    fontWeight: '800',
    overflow: 'hidden',
  },
  profileName: { fontSize: fontSize.sm, color: colors.textMuted, fontWeight: '600' },
  profileNameActive: { color: colors.text },
  error: { color: colors.danger, fontSize: fontSize.sm, fontWeight: '600' },
  switchBtn: { alignItems: 'center' },
  switchText: { color: colors.primary, fontSize: fontSize.md, fontWeight: '700' },
  note: { textAlign: 'center', color: colors.textMuted, fontSize: fontSize.xs },
});

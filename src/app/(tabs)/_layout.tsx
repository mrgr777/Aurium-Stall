import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts } from '@/theme';

/**
 * Navegação principal do app logado: abas fixas na parte inferior
 * (Lista, Produtos, Painel), com cabeçalho navy em cada tela.
 */
export default function TabsLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Tabs
        screenOptions={{
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: colors.textInverse,
          headerTitleStyle: { fontFamily: fonts.sans, fontWeight: '800' },
          headerTitleAlign: 'center',
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
            height: 60,
            paddingBottom: 6,
            paddingTop: 6,
          },
          tabBarLabelStyle: { fontFamily: fonts.sans, fontWeight: '600', fontSize: 12 },
        }}
      >
        <Tabs.Screen
          name="lista"
          options={{
            title: 'Lista',
            headerTitle: 'Lista de compras',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="cart-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="produtos"
          options={{
            title: 'Produtos',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="pricetags-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="painel"
          options={{
            title: 'Painel',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="stats-chart-outline" size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </>
  );
}

import { Redirect } from 'expo-router';
import { useApp } from '@/context/AppContext';

/** Rota inicial: leva ao app se logado, senão à tela de login. */
export default function Index() {
  const { user } = useApp();
  return <Redirect href={user ? '/(tabs)' : '/login'} />;
}

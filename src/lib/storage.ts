/** Camada de persistência local usando AsyncStorage. */
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User, UserData } from '@/types';

const USERS_KEY = 'aurium:users';
const SESSION_KEY = 'aurium:session';
const dataKey = (userId: string) => `aurium:data:${userId}`;

const EMPTY_DATA: UserData = { products: [], activeList: [], purchases: [] };

export async function loadUsers(): Promise<User[]> {
  try {
    const raw = await AsyncStorage.getItem(USERS_KEY);
    return raw ? (JSON.parse(raw) as User[]) : [];
  } catch {
    return [];
  }
}

export async function saveUsers(users: User[]): Promise<void> {
  await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export async function loadSession(): Promise<string | null> {
  return AsyncStorage.getItem(SESSION_KEY);
}

export async function saveSession(userId: string | null): Promise<void> {
  if (userId) await AsyncStorage.setItem(SESSION_KEY, userId);
  else await AsyncStorage.removeItem(SESSION_KEY);
}

export async function loadData(userId: string): Promise<UserData> {
  try {
    const raw = await AsyncStorage.getItem(dataKey(userId));
    if (!raw) return { ...EMPTY_DATA };
    const parsed = JSON.parse(raw) as Partial<UserData>;
    return {
      products: parsed.products ?? [],
      activeList: parsed.activeList ?? [],
      purchases: parsed.purchases ?? [],
      seeded: parsed.seeded ?? false,
    };
  } catch {
    return { ...EMPTY_DATA };
  }
}

export async function saveData(userId: string, data: UserData): Promise<void> {
  await AsyncStorage.setItem(dataKey(userId), JSON.stringify(data));
}

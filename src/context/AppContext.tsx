/**
 * Estado central do Aurium-Stall: autenticação local + dados do usuário.
 * Todas as alterações são persistidas automaticamente no aparelho.
 */
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { uid } from '@/lib/id';
import * as storage from '@/lib/storage';
import { makeSeedProducts } from '@/lib/seed';
import type { ListItem, Product, Purchase, Unit, User, UserData } from '@/types';

/** Dados de entrada para criar um produto. */
type ProductInput = {
  name: string;
  category: string;
  unit: Unit;
  packSizes?: number[];
  price?: number | null;
};

/** Garante que o catálogo nunca fique vazio: se estiver, carrega o inicial. */
function withSeed(data: UserData): UserData {
  if (data.products.length === 0) {
    return { ...data, products: makeSeedProducts() };
  }
  return data;
}

type AppState = {
  ready: boolean;
  user: User | null;
  products: Product[];
  activeList: ListItem[];
  purchases: Purchase[];
};

type AppContextValue = AppState & {
  // Autenticação
  hasAnyUser: () => Promise<boolean>;
  signUp: (name: string, pin: string) => Promise<{ ok: boolean; error?: string }>;
  signIn: (userId: string, pin: string) => Promise<{ ok: boolean; error?: string }>;
  signOut: () => Promise<void>;
  listUsers: () => Promise<User[]>;

  // Produtos (catálogo pessoal)
  addProduct: (input: ProductInput) => Product;
  updateProduct: (id: string, patch: Partial<Omit<Product, 'id'>>) => void;
  removeProduct: (id: string) => void;
  /** Repõe os produtos comuns que ainda não estão no catálogo. */
  restoreSeed: () => void;

  // Lista de compras
  addToList: (productId: string) => void;
  addNewToList: (input: ProductInput) => void;
  updateListItem: (id: string, patch: Partial<Omit<ListItem, 'id'>>) => void;
  removeListItem: (id: string) => void;
  toggleChecked: (id: string) => void;
  clearList: () => void;
  finalizePurchase: () => { ok: boolean; error?: string };
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [data, setData] = useState<UserData>({
    products: [],
    activeList: [],
    purchases: [],
  });

  // Restaura a sessão ao abrir o app.
  useEffect(() => {
    (async () => {
      const sessionId = await storage.loadSession();
      if (sessionId) {
        const users = await storage.loadUsers();
        const found = users.find((u) => u.id === sessionId) ?? null;
        if (found) {
          setUser(found);
          setData(withSeed(await storage.loadData(found.id)));
        }
      }
      setReady(true);
    })();
  }, []);

  // Persiste os dados sempre que mudam (com um usuário logado).
  useEffect(() => {
    if (user) {
      storage.saveData(user.id, data);
    }
  }, [user, data]);

  const hasAnyUser = useCallback(async () => {
    const users = await storage.loadUsers();
    return users.length > 0;
  }, []);

  const listUsers = useCallback(() => storage.loadUsers(), []);

  const signUp = useCallback(async (name: string, pin: string) => {
    const trimmed = name.trim();
    if (trimmed.length < 2) return { ok: false, error: 'Digite um nome válido.' };
    if (!/^\d{4}$/.test(pin)) return { ok: false, error: 'O PIN deve ter 4 dígitos.' };
    const users = await storage.loadUsers();
    if (users.some((u) => u.name.toLowerCase() === trimmed.toLowerCase())) {
      return { ok: false, error: 'Já existe uma conta com esse nome.' };
    }
    const newUser: User = {
      id: uid(),
      name: trimmed,
      pin,
      createdAt: new Date().toISOString(),
    };
    await storage.saveUsers([...users, newUser]);
    await storage.saveSession(newUser.id);
    // Conta nova já começa com um catálogo de produtos comuns.
    const seeded: UserData = {
      products: makeSeedProducts(),
      activeList: [],
      purchases: [],
    };
    await storage.saveData(newUser.id, seeded);
    setUser(newUser);
    setData(seeded);
    return { ok: true };
  }, []);

  const signIn = useCallback(async (userId: string, pin: string) => {
    const users = await storage.loadUsers();
    const found = users.find((u) => u.id === userId);
    if (!found) return { ok: false, error: 'Conta não encontrada.' };
    if (found.pin !== pin) return { ok: false, error: 'PIN incorreto.' };
    await storage.saveSession(found.id);
    setUser(found);
    setData(withSeed(await storage.loadData(found.id)));
    return { ok: true };
  }, []);

  const signOut = useCallback(async () => {
    await storage.saveSession(null);
    setUser(null);
    setData({ products: [], activeList: [], purchases: [] });
  }, []);

  // ----- Produtos -----
  const addProduct = useCallback((input: ProductInput) => {
    const price = input.price ?? null;
    const product: Product = {
      id: uid(),
      name: input.name.trim(),
      category: input.category,
      unit: input.unit,
      packSizes: input.packSizes,
      lastPrice: price,
      priceHistory: price != null ? [{ price, date: new Date().toISOString() }] : [],
    };
    setData((d) => ({ ...d, products: [...d.products, product] }));
    return product;
  }, []);

  const updateProduct = useCallback(
    (id: string, patch: Partial<Omit<Product, 'id'>>) => {
      setData((d) => ({
        ...d,
        products: d.products.map((p) => (p.id === id ? { ...p, ...patch } : p)),
      }));
    },
    [],
  );

  const removeProduct = useCallback((id: string) => {
    setData((d) => ({
      ...d,
      products: d.products.filter((p) => p.id !== id),
      activeList: d.activeList.filter((i) => i.productId !== id),
    }));
  }, []);

  const restoreSeed = useCallback(() => {
    setData((d) => {
      const existing = new Set(d.products.map((p) => p.name.toLowerCase()));
      const toAdd = makeSeedProducts().filter((p) => !existing.has(p.name.toLowerCase()));
      return { ...d, products: [...d.products, ...toAdd] };
    });
  }, []);

  // ----- Lista de compras -----
  const addToList = useCallback((productId: string) => {
    setData((d) => {
      if (d.activeList.some((i) => i.productId === productId)) return d;
      const product = d.products.find((p) => p.id === productId);
      if (!product) return d;
      const item: ListItem = {
        id: uid(),
        productId,
        name: product.name,
        unit: product.unit,
        qty: 1,
        packSize: product.unit === 'pacote' ? product.packSizes?.[0] : undefined,
        unitPrice: product.lastPrice ?? 0,
        checked: false,
      };
      return { ...d, activeList: [...d.activeList, item] };
    });
  }, []);

  const addNewToList = useCallback((input: ProductInput) => {
    const price = input.price ?? null;
    setData((d) => {
      const product: Product = {
        id: uid(),
        name: input.name.trim(),
        category: input.category,
        unit: input.unit,
        packSizes: input.packSizes,
        lastPrice: price,
        priceHistory: price != null ? [{ price, date: new Date().toISOString() }] : [],
      };
      const item: ListItem = {
        id: uid(),
        productId: product.id,
        name: product.name,
        unit: product.unit,
        qty: 1,
        packSize: product.unit === 'pacote' ? product.packSizes?.[0] : undefined,
        unitPrice: price ?? 0,
        checked: false,
      };
      return {
        ...d,
        products: [...d.products, product],
        activeList: [...d.activeList, item],
      };
    });
  }, []);

  const updateListItem = useCallback(
    (id: string, patch: Partial<Omit<ListItem, 'id'>>) => {
      setData((d) => ({
        ...d,
        activeList: d.activeList.map((i) => (i.id === id ? { ...i, ...patch } : i)),
      }));
    },
    [],
  );

  const removeListItem = useCallback((id: string) => {
    setData((d) => ({
      ...d,
      activeList: d.activeList.filter((i) => i.id !== id),
    }));
  }, []);

  const toggleChecked = useCallback((id: string) => {
    setData((d) => ({
      ...d,
      activeList: d.activeList.map((i) =>
        i.id === id ? { ...i, checked: !i.checked } : i,
      ),
    }));
  }, []);

  const clearList = useCallback(() => {
    setData((d) => ({ ...d, activeList: [] }));
  }, []);

  /**
   * Finaliza a compra: transforma os itens marcados (no carrinho) em uma compra,
   * registra o preço no histórico de cada produto e remove esses itens da lista.
   */
  const finalizePurchase = useCallback(() => {
    let result: { ok: boolean; error?: string } = { ok: true };
    setData((d) => {
      const bought = d.activeList.filter((i) => i.checked);
      if (bought.length === 0) {
        result = { ok: false, error: 'Marque os itens que você comprou.' };
        return d;
      }
      const now = new Date().toISOString();
      const total = bought.reduce((s, i) => s + i.qty * i.unitPrice, 0);
      const purchase: Purchase = {
        id: uid(),
        date: now,
        items: bought.map((i) => ({
          productId: i.productId,
          name: i.name,
          qty: i.qty,
          unitPrice: i.unitPrice,
        })),
        total,
      };
      // Atualiza histórico de preços dos produtos comprados (preço > 0).
      const products = d.products.map((p) => {
        const item = bought.find((i) => i.productId === p.id);
        if (!item || item.unitPrice <= 0) return p;
        return {
          ...p,
          lastPrice: item.unitPrice,
          priceHistory: [...p.priceHistory, { price: item.unitPrice, date: now }],
        };
      });
      return {
        products,
        activeList: d.activeList.filter((i) => !i.checked),
        purchases: [purchase, ...d.purchases],
      };
    });
    return result;
  }, []);

  const value = useMemo<AppContextValue>(
    () => ({
      ready,
      user,
      products: data.products,
      activeList: data.activeList,
      purchases: data.purchases,
      hasAnyUser,
      signUp,
      signIn,
      signOut,
      listUsers,
      addProduct,
      updateProduct,
      removeProduct,
      restoreSeed,
      addToList,
      addNewToList,
      updateListItem,
      removeListItem,
      toggleChecked,
      clearList,
      finalizePurchase,
    }),
    [
      ready,
      user,
      data,
      hasAnyUser,
      signUp,
      signIn,
      signOut,
      listUsers,
      addProduct,
      updateProduct,
      removeProduct,
      restoreSeed,
      addToList,
      addNewToList,
      updateListItem,
      removeListItem,
      toggleChecked,
      clearList,
      finalizePurchase,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp deve ser usado dentro de <AppProvider>.');
  return ctx;
}

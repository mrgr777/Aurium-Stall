/** Modelos de dados do Aurium-Stall. Tudo é guardado localmente no aparelho. */

/** Conta de usuário (cada pessoa tem suas próprias compras). */
export type User = {
  id: string;
  name: string;
  /** PIN de 4 dígitos. Guardado localmente apenas — app pessoal, sem servidor. */
  pin: string;
  createdAt: string;
};

/** Um ponto no histórico de preços de um produto. */
export type PricePoint = {
  price: number;
  date: string; // ISO
};

/** Produto do catálogo pessoal do usuário. Persiste entre compras. */
export type Product = {
  id: string;
  name: string;
  category: string;
  /** Último preço conhecido (preenchido ao finalizar uma compra). */
  lastPrice: number | null;
  /** Histórico de preços, em ordem cronológica. */
  priceHistory: PricePoint[];
};

/** Item dentro da lista de compras atual. */
export type ListItem = {
  id: string;
  productId: string;
  name: string; // cópia do nome para exibição
  qty: number;
  unitPrice: number;
  /** Marcado quando já está no carrinho. */
  checked: boolean;
};

/** Uma compra finalizada (vira histórico para os indicadores). */
export type Purchase = {
  id: string;
  date: string; // ISO
  items: {
    productId: string;
    name: string;
    qty: number;
    unitPrice: number;
  }[];
  total: number;
};

/** Todos os dados de um usuário, guardados sob a chave do seu id. */
export type UserData = {
  products: Product[];
  activeList: ListItem[];
  purchases: Purchase[];
};

export const CATEGORIES = [
  'Hortifrúti',
  'Carnes',
  'Laticínios',
  'Padaria',
  'Mercearia',
  'Bebidas',
  'Limpeza',
  'Higiene',
  'Outros',
] as const;

export type Category = (typeof CATEGORIES)[number];

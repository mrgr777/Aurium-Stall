/** Modelos de dados do Aurium-Stall. Tudo é guardado localmente no aparelho. */

/** Conta de usuário (cada pessoa tem suas próprias compras). */
export type User = {
  id: string;
  name: string;
  /** PIN de 4 dígitos. Guardado localmente apenas — app pessoal, sem servidor. */
  pin: string;
  createdAt: string;
};

/**
 * Unidade de venda de um produto:
 * - 'un'     → por unidade (ex.: 1 sabonete)
 * - 'kg'     → por quilo (ex.: hortifruti; permite peso fracionado como 0,5 kg)
 * - 'pacote' → fardo/pack com várias unidades (ex.: bebidas em packs de 4, 6, 12)
 */
export type Unit = 'un' | 'kg' | 'pacote';

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
  unit: Unit;
  /** Tamanhos de pacote disponíveis (só para unit === 'pacote'). Ex.: [4, 6, 12]. */
  packSizes?: number[];
  /** Último preço conhecido, por unidade de venda (por kg / por unidade / por pacote). */
  lastPrice: number | null;
  /** Histórico de preços, em ordem cronológica. */
  priceHistory: PricePoint[];
};

/** Item dentro da lista de compras atual. */
export type ListItem = {
  id: string;
  productId: string;
  name: string; // cópia do nome para exibição
  unit: Unit;
  /** Quantidade: nº de unidades, peso em kg, ou nº de pacotes (conforme a unit). */
  qty: number;
  /** Tamanho do pacote escolhido (só para unit === 'pacote'). */
  packSize?: number;
  /** Preço por unidade de venda (por kg / por unidade / por pacote). */
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
  /** Indica que o catálogo comum inicial já foi aplicado a esta conta. */
  seeded?: boolean;
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

/** Rótulo curto da unidade, para exibição. */
export function unitLabel(unit: Unit): string {
  switch (unit) {
    case 'kg':
      return 'kg';
    case 'pacote':
      return 'pacote';
    default:
      return 'un';
  }
}

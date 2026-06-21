/**
 * Catálogo inicial de produtos comuns, já organizado por categoria e com a
 * unidade de medida certa. É carregado quando o usuário cria a conta, para
 * que ele não comece com o app vazio.
 */
import { uid } from '@/lib/id';
import type { Product, Unit } from '@/types';

type SeedItem = {
  name: string;
  category: string;
  unit: Unit;
  packSizes?: number[];
};

const PACKS = [4, 6, 12];

const SEED: SeedItem[] = [
  // Hortifrúti — vendido por quilo
  { name: 'Banana', category: 'Hortifrúti', unit: 'kg' },
  { name: 'Maçã', category: 'Hortifrúti', unit: 'kg' },
  { name: 'Tomate', category: 'Hortifrúti', unit: 'kg' },
  { name: 'Batata', category: 'Hortifrúti', unit: 'kg' },
  { name: 'Cebola', category: 'Hortifrúti', unit: 'kg' },
  { name: 'Cenoura', category: 'Hortifrúti', unit: 'kg' },
  { name: 'Laranja', category: 'Hortifrúti', unit: 'kg' },
  { name: 'Alface', category: 'Hortifrúti', unit: 'un' },

  // Carnes — vendido por quilo
  { name: 'Carne moída', category: 'Carnes', unit: 'kg' },
  { name: 'Frango', category: 'Carnes', unit: 'kg' },
  { name: 'Bife', category: 'Carnes', unit: 'kg' },
  { name: 'Linguiça', category: 'Carnes', unit: 'kg' },
  { name: 'Peixe', category: 'Carnes', unit: 'kg' },

  // Laticínios
  { name: 'Leite', category: 'Laticínios', unit: 'un' },
  { name: 'Queijo', category: 'Laticínios', unit: 'kg' },
  { name: 'Manteiga', category: 'Laticínios', unit: 'un' },
  { name: 'Iogurte', category: 'Laticínios', unit: 'un' },
  { name: 'Requeijão', category: 'Laticínios', unit: 'un' },

  // Padaria
  { name: 'Pão francês', category: 'Padaria', unit: 'kg' },
  { name: 'Pão de forma', category: 'Padaria', unit: 'un' },
  { name: 'Bolo', category: 'Padaria', unit: 'un' },
  { name: 'Biscoito', category: 'Padaria', unit: 'un' },

  // Mercearia
  { name: 'Arroz', category: 'Mercearia', unit: 'un' },
  { name: 'Feijão', category: 'Mercearia', unit: 'un' },
  { name: 'Açúcar', category: 'Mercearia', unit: 'un' },
  { name: 'Café', category: 'Mercearia', unit: 'un' },
  { name: 'Óleo', category: 'Mercearia', unit: 'un' },
  { name: 'Macarrão', category: 'Mercearia', unit: 'un' },
  { name: 'Sal', category: 'Mercearia', unit: 'un' },
  { name: 'Farinha de trigo', category: 'Mercearia', unit: 'un' },
  { name: 'Ovos', category: 'Mercearia', unit: 'un' },

  // Bebidas — fardo/pack (4, 6 ou 12)
  { name: 'Água mineral', category: 'Bebidas', unit: 'pacote', packSizes: PACKS },
  { name: 'Refrigerante (lata)', category: 'Bebidas', unit: 'pacote', packSizes: PACKS },
  { name: 'Cerveja (lata)', category: 'Bebidas', unit: 'pacote', packSizes: PACKS },
  { name: 'Suco', category: 'Bebidas', unit: 'pacote', packSizes: PACKS },
  { name: 'Refrigerante 2L', category: 'Bebidas', unit: 'un' },

  // Limpeza
  { name: 'Detergente', category: 'Limpeza', unit: 'un' },
  { name: 'Sabão em pó', category: 'Limpeza', unit: 'un' },
  { name: 'Amaciante', category: 'Limpeza', unit: 'un' },
  { name: 'Água sanitária', category: 'Limpeza', unit: 'un' },
  { name: 'Papel higiênico', category: 'Limpeza', unit: 'pacote', packSizes: [4, 12] },

  // Higiene
  { name: 'Sabonete', category: 'Higiene', unit: 'un' },
  { name: 'Shampoo', category: 'Higiene', unit: 'un' },
  { name: 'Creme dental', category: 'Higiene', unit: 'un' },
  { name: 'Desodorante', category: 'Higiene', unit: 'un' },
];

/** Gera a lista de produtos iniciais (com ids únicos). */
export function makeSeedProducts(): Product[] {
  return SEED.map((s) => ({
    id: uid(),
    name: s.name,
    category: s.category,
    unit: s.unit,
    packSizes: s.packSizes,
    lastPrice: null,
    priceHistory: [],
  }));
}

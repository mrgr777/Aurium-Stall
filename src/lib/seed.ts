/**
 * Catálogo inicial de produtos comuns no Brasil, organizado por categoria e
 * com a unidade de medida certa. É carregado quando o usuário cria a conta
 * (ou quando o catálogo está vazio), para que ele escolha os itens sem
 * precisar digitar.
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
  // Hortifrúti — em geral por quilo
  { name: 'Banana', category: 'Hortifrúti', unit: 'kg' },
  { name: 'Maçã', category: 'Hortifrúti', unit: 'kg' },
  { name: 'Laranja', category: 'Hortifrúti', unit: 'kg' },
  { name: 'Mamão', category: 'Hortifrúti', unit: 'kg' },
  { name: 'Tomate', category: 'Hortifrúti', unit: 'kg' },
  { name: 'Batata', category: 'Hortifrúti', unit: 'kg' },
  { name: 'Batata-doce', category: 'Hortifrúti', unit: 'kg' },
  { name: 'Cebola', category: 'Hortifrúti', unit: 'kg' },
  { name: 'Cenoura', category: 'Hortifrúti', unit: 'kg' },
  { name: 'Alho', category: 'Hortifrúti', unit: 'kg' },
  { name: 'Limão', category: 'Hortifrúti', unit: 'kg' },
  { name: 'Mandioca', category: 'Hortifrúti', unit: 'kg' },
  { name: 'Alface', category: 'Hortifrúti', unit: 'un' },
  { name: 'Couve', category: 'Hortifrúti', unit: 'un' },
  { name: 'Cheiro-verde', category: 'Hortifrúti', unit: 'un' },

  // Carnes — por quilo
  { name: 'Carne moída', category: 'Carnes', unit: 'kg' },
  { name: 'Patinho', category: 'Carnes', unit: 'kg' },
  { name: 'Acém', category: 'Carnes', unit: 'kg' },
  { name: 'Costela bovina', category: 'Carnes', unit: 'kg' },
  { name: 'Peito de frango', category: 'Carnes', unit: 'kg' },
  { name: 'Coxa de frango', category: 'Carnes', unit: 'kg' },
  { name: 'Frango inteiro', category: 'Carnes', unit: 'kg' },
  { name: 'Linguiça', category: 'Carnes', unit: 'kg' },
  { name: 'Bacon', category: 'Carnes', unit: 'kg' },
  { name: 'Bisteca suína', category: 'Carnes', unit: 'kg' },
  { name: 'Filé de peixe', category: 'Carnes', unit: 'kg' },
  { name: 'Salsicha', category: 'Carnes', unit: 'kg' },

  // Laticínios
  { name: 'Leite', category: 'Laticínios', unit: 'un' },
  { name: 'Leite condensado', category: 'Laticínios', unit: 'un' },
  { name: 'Creme de leite', category: 'Laticínios', unit: 'un' },
  { name: 'Queijo mussarela', category: 'Laticínios', unit: 'kg' },
  { name: 'Queijo prato', category: 'Laticínios', unit: 'kg' },
  { name: 'Manteiga', category: 'Laticínios', unit: 'un' },
  { name: 'Margarina', category: 'Laticínios', unit: 'un' },
  { name: 'Iogurte', category: 'Laticínios', unit: 'un' },
  { name: 'Requeijão', category: 'Laticínios', unit: 'un' },
  { name: 'Presunto', category: 'Laticínios', unit: 'kg' },

  // Padaria
  { name: 'Pão francês', category: 'Padaria', unit: 'kg' },
  { name: 'Pão de forma', category: 'Padaria', unit: 'un' },
  { name: 'Pão de queijo', category: 'Padaria', unit: 'kg' },
  { name: 'Bolo', category: 'Padaria', unit: 'un' },
  { name: 'Bolacha / Biscoito', category: 'Padaria', unit: 'un' },
  { name: 'Torrada', category: 'Padaria', unit: 'un' },
  { name: 'Rosca', category: 'Padaria', unit: 'un' },

  // Mercearia
  { name: 'Arroz', category: 'Mercearia', unit: 'un' },
  { name: 'Feijão', category: 'Mercearia', unit: 'un' },
  { name: 'Açúcar', category: 'Mercearia', unit: 'un' },
  { name: 'Café', category: 'Mercearia', unit: 'un' },
  { name: 'Óleo de soja', category: 'Mercearia', unit: 'un' },
  { name: 'Azeite', category: 'Mercearia', unit: 'un' },
  { name: 'Sal', category: 'Mercearia', unit: 'un' },
  { name: 'Macarrão', category: 'Mercearia', unit: 'un' },
  { name: 'Farinha de trigo', category: 'Mercearia', unit: 'un' },
  { name: 'Farinha de mandioca', category: 'Mercearia', unit: 'un' },
  { name: 'Molho de tomate', category: 'Mercearia', unit: 'un' },
  { name: 'Milho / Ervilha em lata', category: 'Mercearia', unit: 'un' },
  { name: 'Sardinha / Atum em lata', category: 'Mercearia', unit: 'un' },
  { name: 'Maionese', category: 'Mercearia', unit: 'un' },
  { name: 'Ketchup', category: 'Mercearia', unit: 'un' },
  { name: 'Leite em pó', category: 'Mercearia', unit: 'un' },
  { name: 'Achocolatado', category: 'Mercearia', unit: 'un' },
  { name: 'Aveia', category: 'Mercearia', unit: 'un' },
  { name: 'Tempero / Caldo', category: 'Mercearia', unit: 'un' },
  { name: 'Ovos (dúzia)', category: 'Mercearia', unit: 'un' },

  // Bebidas — fardo/pack (4, 6 ou 12)
  { name: 'Água mineral', category: 'Bebidas', unit: 'pacote', packSizes: PACKS },
  { name: 'Refrigerante (lata)', category: 'Bebidas', unit: 'pacote', packSizes: PACKS },
  { name: 'Cerveja (lata)', category: 'Bebidas', unit: 'pacote', packSizes: PACKS },
  { name: 'Suco (caixinha)', category: 'Bebidas', unit: 'pacote', packSizes: PACKS },
  { name: 'Refrigerante 2L', category: 'Bebidas', unit: 'un' },
  { name: 'Suco (garrafa)', category: 'Bebidas', unit: 'un' },
  { name: 'Água de coco', category: 'Bebidas', unit: 'un' },
  { name: 'Café solúvel', category: 'Bebidas', unit: 'un' },

  // Limpeza
  { name: 'Detergente', category: 'Limpeza', unit: 'un' },
  { name: 'Sabão em pó', category: 'Limpeza', unit: 'un' },
  { name: 'Sabão em barra', category: 'Limpeza', unit: 'un' },
  { name: 'Amaciante', category: 'Limpeza', unit: 'un' },
  { name: 'Água sanitária', category: 'Limpeza', unit: 'un' },
  { name: 'Desinfetante', category: 'Limpeza', unit: 'un' },
  { name: 'Multiuso', category: 'Limpeza', unit: 'un' },
  { name: 'Esponja de cozinha', category: 'Limpeza', unit: 'un' },
  { name: 'Saco de lixo', category: 'Limpeza', unit: 'un' },
  { name: 'Papel toalha', category: 'Limpeza', unit: 'un' },
  { name: 'Papel higiênico', category: 'Limpeza', unit: 'pacote', packSizes: [4, 12] },

  // Higiene
  { name: 'Sabonete', category: 'Higiene', unit: 'un' },
  { name: 'Shampoo', category: 'Higiene', unit: 'un' },
  { name: 'Condicionador', category: 'Higiene', unit: 'un' },
  { name: 'Creme dental', category: 'Higiene', unit: 'un' },
  { name: 'Escova de dente', category: 'Higiene', unit: 'un' },
  { name: 'Desodorante', category: 'Higiene', unit: 'un' },
  { name: 'Fio dental', category: 'Higiene', unit: 'un' },
  { name: 'Absorvente', category: 'Higiene', unit: 'un' },
  { name: 'Fralda', category: 'Higiene', unit: 'un' },
  { name: 'Lâmina de barbear', category: 'Higiene', unit: 'un' },
  { name: 'Lenço umedecido', category: 'Higiene', unit: 'un' },
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

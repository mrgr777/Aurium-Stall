/** Cálculo dos indicadores (KPIs) a partir do histórico de compras. */
import type { Product, Purchase } from '@/types';
import { monthKey, monthLabel, percentChange } from '@/lib/format';
import type { BarDatum } from '@/components/Charts';

/** Total gasto no mês atual. */
export function spentThisMonth(purchases: Purchase[]): number {
  const key = monthKey(new Date());
  return purchases
    .filter((p) => monthKey(new Date(p.date)) === key)
    .reduce((s, p) => s + p.total, 0);
}

/** Gasto nos últimos `count` meses, do mais antigo para o mais recente. */
export function monthlySpend(purchases: Purchase[], count = 6): BarDatum[] {
  const now = new Date();
  const buckets: BarDatum[] = [];
  const totals = new Map<string, number>();
  for (const p of purchases) {
    const k = monthKey(new Date(p.date));
    totals.set(k, (totals.get(k) ?? 0) + p.total);
  }
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({ label: monthLabel(d), value: totals.get(monthKey(d)) ?? 0 });
  }
  return buckets;
}

export type ProductSpend = { name: string; total: number; share: number };

/** Produtos que mais pesaram na cesta (por valor total gasto). */
export function topProducts(purchases: Purchase[], limit = 5): ProductSpend[] {
  const totals = new Map<string, { name: string; total: number }>();
  let grand = 0;
  for (const p of purchases) {
    for (const it of p.items) {
      const line = it.qty * it.unitPrice;
      grand += line;
      const cur = totals.get(it.productId);
      totals.set(it.productId, {
        name: it.name,
        total: (cur?.total ?? 0) + line,
      });
    }
  }
  return [...totals.values()]
    .sort((a, b) => b.total - a.total)
    .slice(0, limit)
    .map((x) => ({ ...x, share: grand > 0 ? x.total / grand : 0 }));
}

export type PriceMover = {
  name: string;
  previous: number;
  current: number;
  changePct: number;
  values: number[];
};

/** Produtos com pelo menos 2 preços registrados, com a variação do último período. */
export function priceMovers(products: Product[]): PriceMover[] {
  return products
    .filter((p) => p.priceHistory.length >= 2)
    .map((p) => {
      const values = p.priceHistory.map((h) => h.price);
      const previous = values[values.length - 2];
      const current = values[values.length - 1];
      return {
        name: p.name,
        previous,
        current,
        changePct: percentChange(previous, current),
        values,
      };
    })
    .filter((m) => m.changePct !== 0);
}

/** Maiores altas (positivas) ordenadas da maior para a menor. */
export function biggestRisers(products: Product[], limit = 3): PriceMover[] {
  return priceMovers(products)
    .filter((m) => m.changePct > 0)
    .sort((a, b) => b.changePct - a.changePct)
    .slice(0, limit);
}

/** Maiores quedas (negativas) ordenadas da maior queda para a menor. */
export function biggestFallers(products: Product[], limit = 3): PriceMover[] {
  return priceMovers(products)
    .filter((m) => m.changePct < 0)
    .sort((a, b) => a.changePct - b.changePct)
    .slice(0, limit);
}

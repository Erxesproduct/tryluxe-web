"use client";

import { getLiteVariant, isSoldOut } from "@/lib/lite";
import { createStore } from "@/lib/store";

/** One cart line per size (Zochil product id). */
export type CartItem = { id: number; qty: number };
export const MAX_QTY = 10;

/** Most units a customer can order: stock when counted (pre-orders are not), never more than MAX_QTY. */
export function maxQty(id: number) {
  const v = getLiteVariant(id);
  if (!v || isSoldOut(v)) return 0;
  return v.k == null || v.r ? MAX_QTY : Math.min(MAX_QTY, v.k);
}

const EMPTY: CartItem[] = [];
const store = createStore<CartItem[]>("tryluxe.cart.v1", EMPTY, (raw) =>
  Array.isArray(raw)
    ? raw
        .filter((i): i is CartItem => !!i && Number.isInteger(i.id) && Number.isInteger(i.qty) && i.qty > 0 && maxQty(i.id) > 0)
        .map((i) => ({ id: i.id, qty: Math.min(i.qty, maxQty(i.id)) }))
    : EMPTY,
);

export const useCart = store.use;

export const cart = {
  add(id: number, qty = 1) {
    const cap = maxQty(id);
    if (cap <= 0) return;
    const items = store.get();
    const has = items.some((i) => i.id === id);
    store.set(has ? items.map((i) => (i.id === id ? { ...i, qty: Math.min(cap, i.qty + qty) } : i)) : [...items, { id, qty: Math.min(cap, qty) }]);
    if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("tryluxe:added", { detail: { id } }));
  },
  setQty(id: number, qty: number) {
    const items = store.get();
    store.set(qty <= 0 ? items.filter((i) => i.id !== id) : items.map((i) => (i.id === id ? { ...i, qty: Math.min(maxQty(id), qty) } : i)));
  },
  clear() {
    store.set(EMPTY);
  },
};

export const cartCount = (list: CartItem[]) => list.reduce((n, i) => n + i.qty, 0);
export const cartSubtotal = (list: CartItem[]) => list.reduce((s, i) => s + (getLiteVariant(i.id)?.p ?? 0) * i.qty, 0);
export const hasPreorder = (list: CartItem[]) => list.some((i) => getLiteVariant(i.id)?.r);

"use client";

import { createStore } from "@/lib/store";

/**
 * Orders placed from this browser (no customer accounts yet). Holds what the confirmation, payment status and
 * tracking pages need: reference, totals, lines and the erxes invoice to check.
 */
export type LocalOrder = {
  reference: string;
  createdAt: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  preorder: boolean;
  lines: { name: string; label: string; qty: number; total: number }[];
  invoiceId: string | null;
  payUrl: string | null;
  /** last known erxes invoice status */
  status: string | null;
};

const EMPTY: LocalOrder[] = [];
const store = createStore<LocalOrder[]>("tryluxe.orders.v1", EMPTY, (raw) => (Array.isArray(raw) ? (raw.filter((o) => o && typeof o.reference === "string") as LocalOrder[]).slice(0, 20) : EMPTY));

export const useLocalOrders = store.use;
export const localOrders = {
  save(o: LocalOrder) {
    store.set([o, ...store.get().filter((x) => x.reference !== o.reference)].slice(0, 20));
  },
  setStatus(reference: string, status: string) {
    store.set(store.get().map((o) => (o.reference === reference ? { ...o, status } : o)));
  },
  get: (reference: string) => store.get().find((o) => o.reference === reference) ?? null,
};

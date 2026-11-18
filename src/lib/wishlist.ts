"use client";

import { getLiteLine } from "@/lib/lite";
import { createStore } from "@/lib/store";

/** Saved fragrance lines (slugs), kept on this device only: there are no customer accounts yet. */
const EMPTY: string[] = [];
const store = createStore<string[]>("tryluxe.wishlist.v1", EMPTY, (raw) => (Array.isArray(raw) ? raw.filter((s): s is string => typeof s === "string" && !!getLiteLine(s)).slice(0, 200) : EMPTY));

export const useWishlist = store.use;
export const wishlist = {
  toggle(slug: string) {
    const list = store.get();
    store.set(list.includes(slug) ? list.filter((s) => s !== slug) : [slug, ...list]);
  },
  remove(slug: string) {
    store.set(store.get().filter((s) => s !== slug));
  },
};

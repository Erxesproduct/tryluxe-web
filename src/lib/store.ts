"use client";

import { useSyncExternalStore } from "react";

/**
 * A tiny localStorage-backed store shared by every component on the page and kept in sync across tabs.
 * Storage may be blocked (private mode): the store then lives for the page view only.
 */
export function createStore<T>(key: string, empty: T, sanitize: (raw: unknown) => T) {
  let value = empty;
  let loaded = false;
  const listeners = new Set<() => void>();

  function load() {
    if (loaded || typeof window === "undefined") return;
    loaded = true;
    try {
      const raw = window.localStorage.getItem(key);
      value = raw ? sanitize(JSON.parse(raw)) : empty;
    } catch {
      value = empty;
    }
  }
  function set(next: T) {
    value = next;
    try {
      window.localStorage.setItem(key, JSON.stringify(next));
    } catch {
      /* storage blocked */
    }
    listeners.forEach((l) => l());
  }
  function subscribe(listener: () => void) {
    load();
    listeners.add(listener);
    const onStorage = (e: StorageEvent) => {
      if (e.key !== key) return;
      loaded = false;
      load();
      listener();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", onStorage);
    };
  }
  const get = () => (load(), value);
  const use = () =>
    useSyncExternalStore(
      subscribe,
      get,
      () => empty,
    );
  return { get, set, use };
}

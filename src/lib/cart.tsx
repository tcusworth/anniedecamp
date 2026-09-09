import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type CartItem = {
  artworkId: string;
  printOptionId: string | null;
  kind: "original" | "print" | "merchandise";
  label: string;
  priceCents: number;
  imageUrl: string;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  totalCents: number;
  open: boolean;
  setOpen: (open: boolean) => void;
  add: (item: CartItem) => void;
  setQuantity: (artworkId: string, printOptionId: string | null, quantity: number) => void;
  remove: (artworkId: string, printOptionId: string | null) => void;
  clear: () => void;
};

const STORAGE_KEY = "adc-cart-v1";
const CartContext = createContext<CartContextValue | null>(null);

function sameLine(a: CartItem, artworkId: string, printOptionId: string | null) {
  return a.artworkId === artworkId && (a.printOptionId ?? null) === (printOptionId ?? null);
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw) as CartItem[]);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* ignore */
    }
  }, [items]);

  const add = useCallback((item: CartItem) => {
    setItems((prev) => {
      const found = prev.find((p) => sameLine(p, item.artworkId, item.printOptionId));
      if (!found) return [...prev, item];
      if (item.kind === "original") return prev;
      return prev.map((p) =>
        sameLine(p, item.artworkId, item.printOptionId)
          ? { ...p, quantity: Math.min(10, p.quantity + item.quantity) }
          : p,
      );
    });
    setOpen(true);
  }, []);

  const setQuantity = useCallback(
    (artworkId: string, printOptionId: string | null, quantity: number) => {
      setItems((prev) =>
        prev.map((p) =>
          sameLine(p, artworkId, printOptionId)
            ? { ...p, quantity: Math.min(10, Math.max(1, quantity)) }
            : p,
        ),
      );
    },
    [],
  );

  const remove = useCallback((artworkId: string, printOptionId: string | null) => {
    setItems((prev) => prev.filter((p) => !sameLine(p, artworkId, printOptionId)));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      count: items.reduce((n, i) => n + i.quantity, 0),
      totalCents: items.reduce((n, i) => n + i.quantity * i.priceCents, 0),
      open,
      setOpen,
      add,
      setQuantity,
      remove,
      clear,
    }),
    [items, open, add, setQuantity, remove, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}

export function money(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

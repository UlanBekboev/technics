import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartProduct {
  id: number;
  name: string;
  slug: string;
  price: number;
  images: { url: string; isMain: boolean }[];
}

export interface CartItem {
  id: number;
  quantity: number;
  productId: number;
  product: CartProduct;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  setItems: (items: CartItem[]) => void;
  addItem: (item: CartItem) => void;
  updateItem: (productId: number, quantity: number) => void;
  removeItem: (productId: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  total: () => number;
  count: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      setItems: (items) => set({ items }),
      addItem: (item) => {
        const existing = get().items.find((i) => i.productId === item.productId);
        if (existing) {
          set({
            items: get().items.map((i) =>
              i.productId === item.productId ? { ...i, quantity: i.quantity + item.quantity } : i,
            ),
          });
        } else {
          set({ items: [...get().items, item] });
        }
      },
      updateItem: (productId, quantity) =>
        set({ items: get().items.map((i) => (i.productId === productId ? { ...i, quantity } : i)) }),
      removeItem: (productId) =>
        set({ items: get().items.filter((i) => i.productId !== productId) }),
      clearCart: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      total: () => get().items.reduce((s, i) => s + Number(i.product.price) * i.quantity, 0),
      count: () => get().items.reduce((s, i) => s + i.quantity, 0),
    }),
    { name: 'cart' },
  ),
);

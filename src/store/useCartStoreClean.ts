import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image_url: string | null;
}

interface CartState {
  items: CartItem[];
  addItem: (product: any) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      total: 0,
      addItem: (product) => {
        const items = get().items;
        const existingItem = items.find((item) => item.id === product.id);

        if (existingItem) {
          const updatedItems = items.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
          set({ items: updatedItems, total: calculateTotal(updatedItems) });
        } else {
          const newItems = [...items, { ...product, quantity: 1 }];
          set({ items: newItems, total: calculateTotal(newItems) });
        }
      },
      removeItem: (productId) => {
        const updatedItems = get().items.filter((item) => item.id !== productId);
        set({ items: updatedItems, total: calculateTotal(updatedItems) });
      },
      updateQuantity: (productId, quantity) => {
        if (quantity < 1) return;
        const updatedItems = get().items.map((item) =>
          item.id === productId ? { ...item, quantity } : item
        );
        set({ items: updatedItems, total: calculateTotal(updatedItems) });
      },
      clearCart: () => set({ items: [], total: 0 }),
    }),
    {
      name: 'nexacart-cart',
    }
  )
);

const calculateTotal = (items: CartItem[]) => {
  return items.reduce((acc, item) => acc + item.price * item.quantity, 0);
};

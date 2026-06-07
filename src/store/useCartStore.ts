import { create } from "zustand";
import { Product, PaymentMethod, CartItem } from "@/types";

// Re-export CartItem so existing imports from this file still work
export type { CartItem } from "@/types";

interface CartState {
  items: CartItem[];
  customer_id: string | null;
  customer_name: string | null;
  discount_amount: number;
  payment_method: PaymentMethod;
  notes: string;
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, qty: number) => void;
  updateItemDiscount: (productId: string, discount: number) => void;
  setCustomer: (id: string | null, name: string | null) => void;
  setDiscount: (amount: number) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  setNotes: (notes: string) => void;
  clearCart: () => void;
  subtotal: () => number;
  itemCount: () => number;
  total: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [], customer_id: null, customer_name: null,
  discount_amount: 0, payment_method: "cash", notes: "",

  addItem: (product) => {
    const items = get().items;
    const existing = items.find((i) => i.product.id === product.id);
    if (existing) {
      if (existing.quantity >= product.quantity) return;
      set({ items: items.map((i) => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i) });
    } else {
      if (product.quantity === 0) return;
      set({ items: [...items, { product, quantity: 1, unit_price: product.price, discount_amount: 0 }] });
    }
  },

  removeItem: (productId) => set({ items: get().items.filter((i) => i.product.id !== productId) }),

  updateQuantity: (productId, qty) => {
    if (qty <= 0) { get().removeItem(productId); return; }
    set({ items: get().items.map((i) => i.product.id === productId ? { ...i, quantity: Math.min(qty, i.product.quantity) } : i) });
  },

  updateItemDiscount: (productId, discount) =>
    set({ items: get().items.map((i) => i.product.id === productId ? { ...i, discount_amount: Math.max(0, Math.min(discount, i.unit_price * i.quantity)) } : i) }),

  setCustomer: (id, name) => set({ customer_id: id, customer_name: name }),
  setDiscount: (amount) => set({ discount_amount: Math.max(0, amount) }),
  setPaymentMethod: (method) => set({ payment_method: method }),
  setNotes: (notes) => set({ notes }),
  clearCart: () => set({ items: [], customer_id: null, customer_name: null, discount_amount: 0, payment_method: "cash", notes: "" }),
  subtotal: () => get().items.reduce((sum, i) => sum + i.unit_price * i.quantity - i.discount_amount, 0),
  itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
  total: () => Math.max(0, get().subtotal() - get().discount_amount),
}));
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// Define the shape of a product. Adjust this to match your actual Product type.
interface Product {
  id: string;
  name: string;
  price: number;
  photo?: string;
}

// The item as it will be stored in the cart, with a quantity.
export interface CartItem extends Product {
  quantity: number;
}

// Define the state and actions for your cart store.
interface CartState {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  orderIds: string[]; // Array to store created order IDs
  addItem: (item: Product) => void;
  removeItem: (itemId: string) => void;
  updateItemQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  addOrderId: (orderId: string) => void; // Action to save a new order ID
}

// A helper function to calculate totals to avoid code repetition.
const calculateTotals = (items: CartItem[]) => {
  const totalItems = items.reduce((total, item) => total + item.quantity, 0);
  const totalPrice = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  return { totalItems, totalPrice };
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      totalItems: 0,
      totalPrice: 0,
      orderIds: [], // Initialize the orderIds array

      // --- ACTIONS ---

      /**
       * Adds a product to the cart. If the item already exists, it increases its quantity.
       */
      addItem: (product: Product) => {
        const { items } = get();
        const existingItem = items.find((item) => item.id === product.id);

        let updatedItems;
        if (existingItem) {
          // If item exists, update its quantity
          updatedItems = items.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        } else {
          // If item is new, add it to the cart
          updatedItems = [...items, { ...product, quantity: 1 }];
        }

        const { totalItems, totalPrice } = calculateTotals(updatedItems);
        set({ items: updatedItems, totalItems, totalPrice });
      },

      /**
       * Removes an item completely from the cart.
       */
      removeItem: (itemId: string) => {
        const updatedItems = get().items.filter((item) => item.id !== itemId);
        const { totalItems, totalPrice } = calculateTotals(updatedItems);
        set({ items: updatedItems, totalItems, totalPrice });
      },

      /**
       * Updates the quantity of a specific item in the cart.
       * If quantity is 0 or less, the item is removed.
       */
      updateItemQuantity: (itemId: string, quantity: number) => {
        let updatedItems;
        if (quantity <= 0) {
          // Remove the item if quantity is zero or less
          updatedItems = get().items.filter((item) => item.id !== itemId);
        } else {
          // Otherwise, update the quantity
          updatedItems = get().items.map((item) =>
            item.id === itemId ? { ...item, quantity } : item
          );
        }

        const { totalItems, totalPrice } = calculateTotals(updatedItems);
        set({ items: updatedItems, totalItems, totalPrice });
      },

      /**
       * Clears all items from the cart.
       */
      clearCart: () => {
        set({ items: [], totalItems: 0, totalPrice: 0 });
      },

      /**
       * Adds a new order ID to the list for tracking.
       */
      addOrderId: (orderId: string) => {
        const { orderIds } = get();
        // Avoid adding duplicate IDs
        if (!orderIds.includes(orderId)) {
          set({ orderIds: [...orderIds, orderId] });
        }
      },
    }),
    {
      name: "digital-menu-cart-storage", //
      storage: createJSONStorage(() => localStorage), // Use localStorage for persistence
    }
  )
);

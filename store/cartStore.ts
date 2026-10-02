import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface CartItem {
    _id: string;       // product ID
    variantId: string;  // variant subdocument _id — unique key for cart dedup
    name: string;
    image: string;
    price: number;      // effective price (variant override or base)
    qty: number;
    stock: number;      // variant-level stock
    color?: string;
    size?: string;
    slug: string;
}

interface CartState {
    cartItems: CartItem[];
    addToCart: (item: CartItem) => void;
    removeFromCart: (variantId: string) => void;
    updateQty: (variantId: string, qty: number) => void;
    clearCart: () => void;
    itemsPrice: number;
    shippingPrice: number;
    taxPrice: number;
    totalPrice: number;
}

const recalc = (items: CartItem[]) => {
    const itemsPrice = items.reduce((acc, item) => acc + item.price * item.qty, 0);
    const shippingPrice = itemsPrice > 5000 ? 0 : 200;
    const totalPrice = itemsPrice + shippingPrice;
    return { itemsPrice, shippingPrice, totalPrice };
};

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            cartItems: [],
            itemsPrice: 0,
            shippingPrice: 0,
            taxPrice: 0,
            totalPrice: 0,

            addToCart: (item) => {
                const { cartItems } = get();
                const existItem = cartItems.find((x) => x.variantId === item.variantId);
                const maxStock = item.stock > 0 ? item.stock : 1;
                const safeIncomingQty = Math.max(1, Math.min(maxStock, item.qty));

                let newItems;
                if (existItem) {
                    const newQty = Math.min(maxStock, existItem.qty + safeIncomingQty);
                    newItems = cartItems.map((x) =>
                        x.variantId === existItem.variantId
                            ? { ...item, qty: newQty, stock: item.stock }
                            : x
                    );
                } else {
                    newItems = [...cartItems, { ...item, qty: safeIncomingQty }];
                }

                set({ cartItems: newItems, ...recalc(newItems) });
            },

            removeFromCart: (variantId) => {
                const { cartItems } = get();
                const newItems = cartItems.filter((x) => x.variantId !== variantId);
                set({ cartItems: newItems, ...recalc(newItems) });
            },

            updateQty: (variantId, qty) => {
                const { cartItems } = get();
                const newItems = cartItems.map((item) => {
                    if (item.variantId === variantId) {
                        const maxStock = item.stock > 0 ? item.stock : 1;
                        const safeQty = Math.max(1, Math.min(maxStock, qty));
                        return { ...item, qty: safeQty };
                    }
                    return item;
                });
                set({ cartItems: newItems, ...recalc(newItems) });
            },

            clearCart: () => {
                set({ cartItems: [], itemsPrice: 0, shippingPrice: 0, taxPrice: 0, totalPrice: 0 });
            }
        }),
        {
            name: 'cart-storage',
            storage: createJSONStorage(() => localStorage),
            onRehydrateStorage: () => (state) => {
                if (state && Array.isArray(state.cartItems)) {
                    let changed = false;
                    const cleanItems = state.cartItems.map((item) => {
                        const maxStock = item.stock > 0 ? item.stock : 1;
                        if (item.qty > maxStock) {
                            changed = true;
                            return { ...item, qty: maxStock };
                        }
                        return item;
                    });
                    if (changed) {
                        state.cartItems = cleanItems;
                        const { itemsPrice, shippingPrice, totalPrice } = recalc(cleanItems);
                        state.itemsPrice = itemsPrice;
                        state.shippingPrice = shippingPrice;
                        state.totalPrice = totalPrice;
                    }
                }
            }
        }
    )
);

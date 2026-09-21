import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface CartItem {
    _id: string;
    name: string;
    image: string;
    price: number;
    qty: number;
    stock: number;
    color?: string;
    size?: string;
    slug: string;
}

interface CartState {
    cartItems: CartItem[];
    addToCart: (item: CartItem) => void;
    removeFromCart: (id: string) => void;
    updateQty: (id: string, qty: number) => void;
    clearCart: () => void;
    itemsPrice: number;
    shippingPrice: number;
    taxPrice: number;
    totalPrice: number;
}

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
                const existItem = cartItems.find((x) => x._id === item._id);

                let newItems;
                if (existItem) {
                    newItems = cartItems.map((x) =>
                        x._id === existItem._id ? item : x
                    );
                } else {
                    newItems = [...cartItems, item];
                }

                // Recalculate prices
                const itemsPrice = newItems.reduce((acc, item) => acc + item.price * item.qty, 0);
                const shippingPrice = itemsPrice > 5000 ? 0 : 200;
                const totalPrice = itemsPrice + shippingPrice;

                set({ cartItems: newItems, itemsPrice, shippingPrice, totalPrice });
            },

            removeFromCart: (id) => {
                const { cartItems } = get();
                const newItems = cartItems.filter((x) => x._id !== id);

                // Recalculate prices
                const itemsPrice = newItems.reduce((acc, item) => acc + item.price * item.qty, 0);
                const shippingPrice = itemsPrice > 5000 ? 0 : 200;
                const totalPrice = itemsPrice + shippingPrice;

                set({ cartItems: newItems, itemsPrice, shippingPrice, totalPrice });
            },

            updateQty: (id, qty) => {
                const { cartItems } = get();
                const newItems = cartItems.map((item) =>
                    item._id === id ? { ...item, qty } : item
                );

                // Recalculate prices
                const itemsPrice = newItems.reduce((acc, item) => acc + item.price * item.qty, 0);
                const shippingPrice = itemsPrice > 5000 ? 0 : 200;
                const totalPrice = itemsPrice + shippingPrice;

                set({ cartItems: newItems, itemsPrice, shippingPrice, totalPrice });
            },

            clearCart: () => {
                set({ cartItems: [], itemsPrice: 0, shippingPrice: 0, totalPrice: 0 });
            }
        }),
        {
            name: 'cart-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);

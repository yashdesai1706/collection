import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface WishlistItem {
    _id: string;
    name: string;
    image: string;
    price: number;
    stock: number;
    slug: string;
}

interface WishlistState {
    wishlistItems: WishlistItem[];
    addToWishlist: (item: WishlistItem) => void;
    removeFromWishlist: (id: string) => void;
    clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>()(
    persist(
        (set, get) => ({
            wishlistItems: [],

            addToWishlist: (item) => {
                const { wishlistItems } = get();
                const existItem = wishlistItems.find((x) => x._id === item._id);

                if (!existItem) {
                    set({ wishlistItems: [...wishlistItems, item] });
                }
            },

            removeFromWishlist: (id) => {
                const { wishlistItems } = get();
                set({ wishlistItems: wishlistItems.filter((x) => x._id !== id) });
            },

            clearWishlist: () => {
                set({ wishlistItems: [] });
            }
        }),
        {
            name: 'wishlist-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);

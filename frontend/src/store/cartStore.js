// src/store/cartStore.js
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import useAuthStore from './authStore'

const useCartStore = create(
    persist(
        (set, get) => ({
            items: [],
            totalItems: 0,
            totalPrice: 0,

            addItem: (newItem) => {
                const currentUser = useAuthStore.getState().user;
                console.log('Current user:', currentUser); // Добавить
                console.log('Adding item:', newItem);     // Добавить
                if (!currentUser) {

                console.log('No user found, not adding item'); // Добавить
                return;
                }
                const items = get().items;
                const existingItem = items.find(item => item.id === newItem.id);

                let updatedItems;
                if (existingItem) {
                    updatedItems = items.map(item =>
                        item.id === newItem.id
                            ? { ...item, quantity: item.quantity + newItem.quantity }
                            : item
                    );
                } else {
                    updatedItems = [...items, newItem];
                }

                const totalItems = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
                const totalPrice = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

                set({ items: updatedItems, totalItems, totalPrice });
            },

            removeItem: (productId) => {
                const items = get().items.filter(item => item.id !== productId);
                const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
                const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

                set({ items, totalItems, totalPrice });
            },

            updateQuantity: (productId, newQuantity) => {
                const items = get().items.map(item =>
                    item.id === productId
                        ? { ...item, quantity: newQuantity }
                        : item
                );
                const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
                const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

                set({ items, totalItems, totalPrice });
            },

            clearCart: () => {
                set({ items: [], totalItems: 0, totalPrice: 0 });
            },

            // Метод для очистки корзины при выходе
            resetCart: () => {
                set({ items: [], totalItems: 0, totalPrice: 0 });
            }
        }),
        {
            name: 'shopping-cart',
            // Добавляем версионирование для хранилища
            version: 1,
            // Добавляем пользователя в ключ хранилища
            partialize: (state) => ({
                ...state,
                user: useAuthStore.getState().user?.id
            })
        }
    )
);

// Подписываемся на изменения в authStore
useAuthStore.subscribe(
    (state) => state.user,
    (user) => {
        if (!user) {
            useCartStore.getState().resetCart();
        }
    }
);

export default useCartStore;
// src/store/authStore.js
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useAuthStore = create(
    persist(
        (set) => ({
            token: null,
            user: null,
            setToken: (token, user) => {
                localStorage.setItem('token', token)
                set({ token, user })
            },
            setUser: (user) => set({ user }),
            logout: () => {
                localStorage.removeItem('token')
                set({ token: null, user: null })
            },
            isAuthenticated: () => {
                const token = localStorage.getItem('token')
                return !!token
            },
            isAdmin: () => {
                const state = useAuthStore.getState()
                return state.user?.is_admin || false
            }
        }),
        {
            name: 'auth-storage',
            getStorage: () => localStorage,
        }
    )
)

export default useAuthStore
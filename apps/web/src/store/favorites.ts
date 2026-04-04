import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface FavoritesState {
  petIds: string[]
  toggle: (id: string) => void
  isFavorite: (id: string) => boolean
  count: () => number
  clear: () => void
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      petIds: [],
      toggle: (id) =>
        set((state) => ({
          petIds: state.petIds.includes(id)
            ? state.petIds.filter((p) => p !== id)
            : [...state.petIds, id],
        })),
      isFavorite: (id) => get().petIds.includes(id),
      count: () => get().petIds.length,
      clear: () => set({ petIds: [] }),
    }),
    { name: 'adoptame-favorites' }
  )
)

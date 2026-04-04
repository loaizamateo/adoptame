import { act } from '@testing-library/react'
import { useFavoritesStore } from '../../store/favorites'

beforeEach(() => {
  useFavoritesStore.setState({ petIds: [] })
  localStorage.clear()
})

describe('useFavoritesStore — toggle', () => {
  it('adds a pet id that is not yet a favorite', () => {
    act(() => useFavoritesStore.getState().toggle('pet-1'))
    expect(useFavoritesStore.getState().petIds).toContain('pet-1')
  })

  it('removes a pet id that is already a favorite', () => {
    act(() => useFavoritesStore.getState().toggle('pet-1'))
    act(() => useFavoritesStore.getState().toggle('pet-1'))
    expect(useFavoritesStore.getState().petIds).not.toContain('pet-1')
  })

  it('preserves other favorites when toggling one off', () => {
    act(() => useFavoritesStore.getState().toggle('pet-1'))
    act(() => useFavoritesStore.getState().toggle('pet-2'))
    act(() => useFavoritesStore.getState().toggle('pet-1'))

    const state = useFavoritesStore.getState()
    expect(state.petIds).not.toContain('pet-1')
    expect(state.petIds).toContain('pet-2')
  })
})

describe('useFavoritesStore — isFavorite', () => {
  it('returns false for an unknown id', () => {
    expect(useFavoritesStore.getState().isFavorite('pet-99')).toBe(false)
  })

  it('returns true after toggling in', () => {
    act(() => useFavoritesStore.getState().toggle('pet-1'))
    expect(useFavoritesStore.getState().isFavorite('pet-1')).toBe(true)
  })

  it('returns false after toggling out', () => {
    act(() => useFavoritesStore.getState().toggle('pet-1'))
    act(() => useFavoritesStore.getState().toggle('pet-1'))
    expect(useFavoritesStore.getState().isFavorite('pet-1')).toBe(false)
  })
})

describe('useFavoritesStore — count', () => {
  it('starts at 0', () => {
    expect(useFavoritesStore.getState().count()).toBe(0)
  })

  it('increments as pets are added', () => {
    act(() => useFavoritesStore.getState().toggle('pet-1'))
    act(() => useFavoritesStore.getState().toggle('pet-2'))
    expect(useFavoritesStore.getState().count()).toBe(2)
  })

  it('decrements when a pet is removed', () => {
    act(() => useFavoritesStore.getState().toggle('pet-1'))
    act(() => useFavoritesStore.getState().toggle('pet-2'))
    act(() => useFavoritesStore.getState().toggle('pet-1'))
    expect(useFavoritesStore.getState().count()).toBe(1)
  })
})

describe('useFavoritesStore — clear', () => {
  it('removes all favorites', () => {
    act(() => useFavoritesStore.getState().toggle('pet-1'))
    act(() => useFavoritesStore.getState().toggle('pet-2'))
    act(() => useFavoritesStore.getState().clear())

    expect(useFavoritesStore.getState().petIds).toHaveLength(0)
    expect(useFavoritesStore.getState().count()).toBe(0)
  })
})

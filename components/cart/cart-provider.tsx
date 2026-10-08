"use client"

import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react"

export interface CartLine {
  id: string
  slug: string
  name: string
  brand: string
  priceCents: number
  image: string
  quantity: number
}

interface CartContextValue {
  lines: CartLine[]
  count: number
  subtotalCents: number
  isOpen: boolean
  addItem: (item: Omit<CartLine, "quantity">, quantity?: number) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clear: () => void
  openCart: () => void
  closeCart: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

const STORAGE_KEY = "voltika-cart-v1"
const MAX_QTY = 20

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setLines(JSON.parse(raw))
    } catch {
      // ignore malformed storage
    }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines))
    } catch {
      // storage may be unavailable (private mode) — cart still works in-memory
    }
  }, [lines, hydrated])

  const addItem = useCallback((item: Omit<CartLine, "quantity">, quantity = 1) => {
    setLines((prev) => {
      const existing = prev.find((l) => l.id === item.id)
      if (existing) {
        return prev.map((l) =>
          l.id === item.id ? { ...l, quantity: Math.min(MAX_QTY, l.quantity + quantity) } : l,
        )
      }
      return [...prev, { ...item, quantity: Math.min(MAX_QTY, quantity) }]
    })
    setIsOpen(true)
  }, [])

  const removeItem = useCallback((id: string) => {
    setLines((prev) => prev.filter((l) => l.id !== id))
  }, [])

  const updateQuantity = useCallback((id: string, quantity: number) => {
    setLines((prev) =>
      quantity <= 0
        ? prev.filter((l) => l.id !== id)
        : prev.map((l) => (l.id === id ? { ...l, quantity: Math.min(MAX_QTY, quantity) } : l)),
    )
  }, [])

  const clear = useCallback(() => {
    setLines([])
    try {
      localStorage.setItem(STORAGE_KEY, "[]")
    } catch {
      // storage may be unavailable; the in-memory cart is still cleared
    }
  }, [])
  const openCart = useCallback(() => setIsOpen(true), [])
  const closeCart = useCallback(() => setIsOpen(false), [])

  const value = useMemo<CartContextValue>(() => {
    const count = lines.reduce((sum, l) => sum + l.quantity, 0)
    const subtotalCents = lines.reduce((sum, l) => sum + l.priceCents * l.quantity, 0)
    return { lines, count, subtotalCents, isOpen, addItem, removeItem, updateQuantity, clear, openCart, closeCart }
  }, [lines, isOpen, addItem, removeItem, updateQuantity, clear, openCart, closeCart])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("useCart must be used within CartProvider")
  return ctx
}


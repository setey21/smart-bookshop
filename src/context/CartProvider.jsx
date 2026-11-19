import { useCallback, useEffect, useMemo, useState } from 'react'
import { CartContext } from './CartState.js'

const STORAGE_KEY = 'little-bookshop-cart'

function readCart() {
  try {
    const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]')
    if (!Array.isArray(stored)) throw new Error('Saved cart data is not a list.')
    return stored.filter((item) => item
      && typeof item.id === 'string'
      && Number.isInteger(item.quantity)
      && item.quantity > 0
      && item.quantity <= 10
      && Number.isFinite(Number(item.price)))
  } catch (error) {
    console.error('Could not restore the saved cart.', error)
    return []
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(readCart)

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch (error) {
      console.error('Could not save the cart in this browser.', error)
    }
  }, [items])

  const addItem = useCallback((book) => {
    setItems((current) => {
      const existing = current.find((item) => item.id === book.id)
      if (existing) return current.map((item) => item.id === book.id ? { ...item, quantity: Math.min(item.quantity + 1, 10) } : item)
      return [...current, {
        id: book.id,
        title: book.title,
        author: book.author,
        price: Number(book.price),
        cover_url: book.cover_url,
        quantity: 1,
      }]
    })
  }, [])

  const setQuantity = useCallback((bookId, quantity) => {
    setItems((current) => quantity < 1
      ? current.filter((item) => item.id !== bookId)
      : current.map((item) => item.id === bookId ? { ...item, quantity } : item))
  }, [])

  const removeItem = useCallback((bookId) => {
    setItems((current) => current.filter((item) => item.id !== bookId))
  }, [])

  const clearCart = useCallback(() => setItems([]), [])
  const value = useMemo(() => ({ items, addItem, setQuantity, removeItem, clearCart }), [items, addItem, setQuantity, removeItem, clearCart])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

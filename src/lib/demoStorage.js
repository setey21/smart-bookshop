export const DEMO_KEYS = {
  users: 'little-bookshop-users',
  session: 'little-bookshop-session',
  books: 'little-bookshop-books',
  categories: 'little-bookshop-categories',
  favorites: 'little-bookshop-favorites',
  orders: 'little-bookshop-orders',
}

export function readDemoData(key, fallback = null) {
  try {
    const stored = window.localStorage.getItem(key)
    return stored === null ? fallback : JSON.parse(stored)
  } catch (error) {
    console.error(`Could not read local demo data (${key}).`, error)
    throw new Error('The local demo data could not be read. Clear this site’s saved data and reload.')
  }
}

export function writeDemoData(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error(`Could not save local demo data (${key}).`, error)
    throw new Error('The browser could not save demo data. Check your browser storage settings.')
  }
}

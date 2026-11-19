import { DEMO_KEYS, readDemoData, writeDemoData } from '../lib/demoStorage.js'

const starterCategories = [
  { id: 'fiction', name: 'Fiction', description: 'Stories to get lost in.' },
  { id: 'adventure', name: 'Adventure', description: 'For curious readers.' },
  { id: 'nonfiction', name: 'Nonfiction', description: 'Ideas from the wider world.' },
]

const starterBooks = [
  { id: 'book-quiet-compass', title: 'The Quiet Compass', author: 'Mira Ellery', description: 'A young mapmaker follows a trail of small clues through a changing coastal town.', price: 520, stock: 12, category_id: 'adventure', cover_url: '', is_archived: false },
  { id: 'book-garden-at-dusk', title: 'The Garden at Dusk', author: 'Noah Wren', description: 'A gentle story about neighbors, old gardens, and making a place your own.', price: 460, stock: 8, category_id: 'fiction', cover_url: '', is_archived: false },
  { id: 'book-small-wonders', title: 'A Field Guide to Small Wonders', author: 'Lina Moss', description: 'A thoughtful collection of observations for everyday explorers.', price: 610, stock: 6, category_id: 'nonfiction', cover_url: '', is_archived: false },
  { id: 'book-moonlit-library', title: 'The Moonlit Library', author: 'Ari Rowan', description: 'An unexpected key opens a door to a library that appears only after dark.', price: 575, stock: 10, category_id: 'fiction', cover_url: '', is_archived: false },
  { id: 'book-river-road', title: 'The River Road', author: 'Tessa Vale', description: 'Two friends set out to trace a river from its quiet source to the sea.', price: 490, stock: 9, category_id: 'adventure', cover_url: '', is_archived: false },
]

function ensureCatalog() {
  if (readDemoData(DEMO_KEYS.categories) === null) writeDemoData(DEMO_KEYS.categories, starterCategories)
  if (readDemoData(DEMO_KEYS.books) === null) writeDemoData(DEMO_KEYS.books, starterBooks)
}

function addCategory(book, categories) {
  const category = categories.find((item) => item.id === book.category_id)
  return { ...book, categories: category ? { id: category.id, name: category.name } : null }
}

export const bookApi = {
  async listBooks({ search = '', includeArchived = false } = {}) {
    ensureCatalog()
    const categories = readDemoData(DEMO_KEYS.categories, [])
    const term = search.trim().toLocaleLowerCase()
    return readDemoData(DEMO_KEYS.books, [])
      .filter((book) => includeArchived || !book.is_archived)
      .filter((book) => !term || `${book.title} ${book.author}`.toLocaleLowerCase().includes(term))
      .sort((left, right) => left.title.localeCompare(right.title))
      .map((book) => addCategory(book, categories))
  },

  async getBook(id) {
    ensureCatalog()
    const categories = readDemoData(DEMO_KEYS.categories, [])
    const book = readDemoData(DEMO_KEYS.books, []).find((item) => item.id === id && !item.is_archived)
    return book ? addCategory(book, categories) : null
  },

  async saveBook(book) {
    ensureCatalog()
    const books = readDemoData(DEMO_KEYS.books, [])
    const payload = {
      id: book.id || crypto.randomUUID(),
      title: book.title.trim(),
      author: book.author.trim(),
      description: book.description.trim() || '',
      cover_url: book.cover_url.trim() || '',
      price: Number(book.price),
      stock: Number(book.stock),
      category_id: book.category_id || null,
      is_archived: Boolean(book.is_archived),
    }
    const nextBooks = book.id
      ? books.map((item) => item.id === book.id ? { ...item, ...payload } : item)
      : [...books, payload]
    writeDemoData(DEMO_KEYS.books, nextBooks)
  },

  async archiveBook(id) {
    ensureCatalog()
    const books = readDemoData(DEMO_KEYS.books, [])
    if (!books.some((book) => book.id === id)) throw new Error('This book no longer exists.')
    writeDemoData(DEMO_KEYS.books, books.map((book) => book.id === id ? { ...book, is_archived: true } : book))
  },

  async listCategories() {
    ensureCatalog()
    return readDemoData(DEMO_KEYS.categories, []).sort((left, right) => left.name.localeCompare(right.name))
  },

  async saveCategory(category) {
    ensureCatalog()
    const categories = readDemoData(DEMO_KEYS.categories, [])
    const name = category.name.trim()
    if (categories.some((item) => item.name.toLowerCase() === name.toLowerCase() && item.id !== category.id)) {
      throw new Error('A category with this name already exists.')
    }
    const payload = { id: category.id || crypto.randomUUID(), name, description: category.description.trim() }
    writeDemoData(DEMO_KEYS.categories, category.id
      ? categories.map((item) => item.id === category.id ? payload : item)
      : [...categories, payload])
  },

  async listFavorites(userId) {
    ensureCatalog()
    const favorites = readDemoData(DEMO_KEYS.favorites, [])
    const books = readDemoData(DEMO_KEYS.books, [])
    const categories = readDemoData(DEMO_KEYS.categories, [])
    return favorites
      .filter((item) => item.user_id === userId)
      .map((item) => books.find((book) => book.id === item.book_id && !book.is_archived))
      .filter(Boolean)
      .map((book) => addCategory(book, categories))
  },

  async setFavorite(userId, bookId, isFavorite) {
    ensureCatalog()
    const favorites = readDemoData(DEMO_KEYS.favorites, [])
    const exists = favorites.some((item) => item.user_id === userId && item.book_id === bookId)
    if (isFavorite) {
      writeDemoData(DEMO_KEYS.favorites, favorites.filter((item) => item.user_id !== userId || item.book_id !== bookId))
    } else if (!exists) {
      writeDemoData(DEMO_KEYS.favorites, [...favorites, { user_id: userId, book_id: bookId }])
    }
  },

  async createDemoOrder(userId, items, customer = {}) {
    ensureCatalog()
    if (!Array.isArray(items) || items.length === 0) throw new Error('Your cart is empty.')
    const books = readDemoData(DEMO_KEYS.books, [])
    const requestedIds = items.map((item) => item.id)
    if (new Set(requestedIds).size !== requestedIds.length) throw new Error('Your cart contains duplicate books.')

    let totalCents = 0
    const orderItems = items.map((item) => {
      if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 10) {
        throw new Error('Each book quantity must be between 1 and 10.')
      }
      const book = books.find((entry) => entry.id === item.id && !entry.is_archived)
      if (!book) throw new Error('One or more books are no longer available.')
      if (book.stock < item.quantity) throw new Error(`There are not enough copies of "${book.title}" in stock.`)
      const unitPriceCents = Math.round(Number(book.price) * 100)
      if (!Number.isSafeInteger(unitPriceCents) || unitPriceCents < 1) throw new Error(`"${book.title}" has an invalid demo price.`)
      totalCents += unitPriceCents * item.quantity
      return {
        book_id: book.id,
        title: book.title,
        unit_price: unitPriceCents / 100,
        quantity: item.quantity,
      }
    })
    if (!Number.isSafeInteger(totalCents)) throw new Error('Your cart total is too large.')

    const order = {
      tx_ref: crypto.randomUUID(),
      user_id: userId,
      customer_name: customer.name || 'Demo customer',
      customer_email: customer.email || '',
      total_amount: totalCents / 100,
      currency: 'ETB',
      status: 'pending',
      items: orderItems,
      created_at: new Date().toISOString(),
    }
    const orders = readDemoData(DEMO_KEYS.orders, [])
    writeDemoData(DEMO_KEYS.orders, [...orders, order])
    return order
  },

  async completeDemoPayment(userId, txRef) {
    ensureCatalog()
    const orders = readDemoData(DEMO_KEYS.orders, [])
    const order = orders.find((item) => item.tx_ref === txRef && item.user_id === userId)
    if (!order) throw new Error('Demo order not found.')
    if (order.status === 'demo-paid') return order
    if (order.status !== 'pending') throw new Error('This demo payment is no longer pending.')

    const books = readDemoData(DEMO_KEYS.books, [])
    for (const item of order.items) {
      const book = books.find((entry) => entry.id === item.book_id && !entry.is_archived)
      if (!book) throw new Error(`"${item.title}" is no longer available. Cancel this order and return to your cart.`)
      if (book.stock < item.quantity) throw new Error(`There are not enough copies of "${item.title}" in stock now.`)
    }

    const paidOrder = { ...order, status: 'demo-paid', paid_at: new Date().toISOString() }
    writeDemoData(DEMO_KEYS.books, books.map((book) => {
      const orderedItem = order.items.find((item) => item.book_id === book.id)
      return orderedItem ? { ...book, stock: book.stock - orderedItem.quantity } : book
    }))
    writeDemoData(DEMO_KEYS.orders, orders.map((item) => item.tx_ref === txRef ? paidOrder : item))
    return paidOrder
  },

  async cancelDemoOrder(userId, txRef) {
    const orders = readDemoData(DEMO_KEYS.orders, [])
    const order = orders.find((item) => item.tx_ref === txRef && item.user_id === userId)
    if (!order) throw new Error('Demo order not found.')
    if (order.status === 'demo-paid') throw new Error('A completed demo order cannot be cancelled here.')
    if (order.status === 'pending') {
      const cancelledOrder = { ...order, status: 'demo-cancelled', cancelled_at: new Date().toISOString() }
      writeDemoData(DEMO_KEYS.orders, orders.map((item) => item.tx_ref === txRef ? cancelledOrder : item))
      return cancelledOrder
    }
    return order
  },

  async getDemoOrder(userId, txRef) {
    return readDemoData(DEMO_KEYS.orders, [])
      .find((order) => order.tx_ref === txRef && order.user_id === userId) || null
  },

  async listDemoOrders() {
    return readDemoData(DEMO_KEYS.orders, [])
      .slice()
      .sort((left, right) => right.created_at.localeCompare(left.created_at))
  },
}

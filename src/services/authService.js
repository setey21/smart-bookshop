import { DEMO_KEYS, readDemoData, writeDemoData } from '../lib/demoStorage.js'

const AUTH_EVENT = 'little-bookshop-auth-change'
const PASSWORD_ITERATIONS = 120000
const demoAccounts = [
  { email: 'reader@little-bookshop.demo', name: 'Demo Reader', password: 'reader12345', role: 'customer' },
  { email: 'admin@little-bookshop.demo', name: 'Demo Admin', password: 'admin12345', role: 'admin' },
]

function bytesToBase64(bytes) {
  return btoa(String.fromCharCode(...bytes))
}

function base64ToBytes(value) {
  return Uint8Array.from(atob(value), (character) => character.charCodeAt(0))
}

async function hashPassword(password, salt = crypto.getRandomValues(new Uint8Array(16))) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits'])
  const hash = await crypto.subtle.deriveBits({
    name: 'PBKDF2',
    salt,
    iterations: PASSWORD_ITERATIONS,
    hash: 'SHA-256',
  }, key, 256)
  return { salt: bytesToBase64(salt), password_hash: bytesToBase64(new Uint8Array(hash)) }
}

async function ensureDemoAccounts() {
  const savedUsers = readDemoData(DEMO_KEYS.users)
  if (savedUsers !== null) return savedUsers

  const users = await Promise.all(demoAccounts.map(async (account) => ({
    id: crypto.randomUUID(),
    email: account.email,
    full_name: account.name,
    role: account.role,
    ...await hashPassword(account.password),
  })))
  writeDemoData(DEMO_KEYS.users, users)
  return users
}

function toSessionUser(user) {
  return {
    id: user.id,
    email: user.email,
    user_metadata: { full_name: user.full_name },
  }
}

function dispatchAuthChange(session) {
  window.dispatchEvent(new CustomEvent(AUTH_EVENT, { detail: { session } }))
}

export const authService = {
  async signUp({ name, email, password }) {
    const users = await ensureDemoAccounts()
    const normalizedEmail = email.trim().toLowerCase()
    if (!name.trim() || !normalizedEmail || password.length < 8) {
      throw new Error('Enter your name, a valid email address, and a password with at least 8 characters.')
    }
    if (users.some((user) => user.email === normalizedEmail)) throw new Error('An account already exists for this email.')

    const credentials = await hashPassword(password)
    const user = {
      id: crypto.randomUUID(),
      email: normalizedEmail,
      full_name: name.trim(),
      role: 'customer',
      ...credentials,
    }
    writeDemoData(DEMO_KEYS.users, [...users, user])
    return { session: null, user: toSessionUser(user) }
  },

  async signIn({ email, password }) {
    const users = await ensureDemoAccounts()
    const user = users.find((item) => item.email === email.trim().toLowerCase())
    if (!user) throw new Error('Email or password is incorrect.')
    const { password_hash: candidate } = await hashPassword(password, base64ToBytes(user.salt))
    if (candidate !== user.password_hash) throw new Error('Email or password is incorrect.')

    const session = { user: toSessionUser(user) }
    writeDemoData(DEMO_KEYS.session, session)
    dispatchAuthChange(session)
    return { session, user: session.user }
  },

  async getSession() {
    await ensureDemoAccounts()
    return readDemoData(DEMO_KEYS.session, null)
  },

  async getProfile(userId) {
    const users = await ensureDemoAccounts()
    const user = users.find((item) => item.id === userId)
    return user ? { id: user.id, full_name: user.full_name, role: user.role } : null
  },

  onAuthStateChange(callback) {
    const handleAuthChange = (event) => callback('SIGNED_IN', event.detail.session)
    const handleStorageChange = (event) => {
      if (event.key === DEMO_KEYS.session) callback('SIGNED_IN', readDemoData(DEMO_KEYS.session, null))
    }
    window.addEventListener(AUTH_EVENT, handleAuthChange)
    window.addEventListener('storage', handleStorageChange)
    return {
      data: {
        subscription: {
          unsubscribe() {
            window.removeEventListener(AUTH_EVENT, handleAuthChange)
            window.removeEventListener('storage', handleStorageChange)
          },
        },
      },
    }
  },

  async signOut() {
    writeDemoData(DEMO_KEYS.session, null)
    window.localStorage.removeItem(DEMO_KEYS.session)
    dispatchAuthChange(null)
  },

  async requestPasswordReset() {
    throw new Error('Email password reset is unavailable in this browser-only demo.')
  },

  async updatePassword(password) {
    const session = await this.getSession()
    if (!session?.user) throw new Error('Sign in before changing your password.')
    const users = await ensureDemoAccounts()
    const credentials = await hashPassword(password)
    const nextUsers = users.map((user) => user.id === session.user.id ? { ...user, ...credentials } : user)
    writeDemoData(DEMO_KEYS.users, nextUsers)
  },

  async updateName(fullName) {
    const session = await this.getSession()
    if (!session?.user) throw new Error('Sign in before updating your profile.')
    const users = await ensureDemoAccounts()
    const nextUsers = users.map((user) => user.id === session.user.id ? { ...user, full_name: fullName.trim() } : user)
    writeDemoData(DEMO_KEYS.users, nextUsers)
    const updated = nextUsers.find((user) => user.id === session.user.id)
    const nextSession = { user: toSessionUser(updated) }
    writeDemoData(DEMO_KEYS.session, nextSession)
    dispatchAuthChange(nextSession)
    return { id: updated.id, full_name: updated.full_name, role: updated.role }
  },
}

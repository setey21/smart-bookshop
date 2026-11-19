import { useState } from 'react'
import { Link, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { BookOpen, Heart, Menu, ShieldCheck, X } from 'lucide-react'
import { useAuth } from './context/AuthContext.jsx'
import { useCart } from './context/useCart.js'
import { authService } from './services/authService.js'
import { RoleRoute } from './components.jsx'
import {
  AccountPage, AdminBooksPage, AdminCategoriesPage, AdminDashboardPage, AdminInventoryPage, AdminOrdersPage,
  BookDetailsPage, BooksPage, CartPage, DemoPaymentPage, DiscoverPage, FavoritesPage, ForgotPasswordPage, HomePage,
  LoginPage, PaymentResultPage, ResetPasswordPage, SignupPage,
} from './Pages.jsx'

function Header() {
  const { user, role, profile } = useAuth()
  const { items } = useCart()
  const [menuOpen, setMenuOpen] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  async function signOut() {
    setError('')
    try { await authService.signOut(); navigate('/') } catch (issue) { setError(issue.message || 'Could not sign out.') }
    setMenuOpen(false)
  }
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0)
  const customerLinks = [['Books', '/books'], [`Cart${cartCount ? ` (${cartCount})` : ''}`, '/cart'], ['Favorites', '/favorites'], ['Account', '/account']]
  const adminLinks = [['Dashboard', '/admin'], ['Orders', '/admin/orders'], ['Books', '/admin/books'], ['Categories', '/admin/categories'], ['Inventory', '/admin/inventory']]
  const links = user ? (role === 'admin' ? adminLinks : customerLinks) : [['Discover', '/discover']]
  return <header className="site-header"><div className="header-inner">
    <Link to="/" className="brand" onClick={() => setMenuOpen(false)}><span className="brand-icon"><BookOpen size={20} /></span><span>little <b>bookshop</b><small>a place for stories</small></span></Link>
    <button className="mobile-menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? 'Close menu' : 'Open menu'}>{menuOpen ? <X /> : <Menu />}</button>
    <nav className={`main-nav ${menuOpen ? 'nav-open' : ''}`} aria-label="Main navigation">
      {links.map(([label, path]) => <Link key={path} to={path} onClick={() => setMenuOpen(false)}>{label}</Link>)}
      {!user ? <><Link to="/login" onClick={() => setMenuOpen(false)}>Sign in</Link><Link className="nav-join" to="/signup" onClick={() => setMenuOpen(false)}>Join us <span>↗</span></Link></>
        : <div className="nav-account"><span className="role-tag">{role === 'admin' ? <ShieldCheck size={13} /> : <Heart size={13} />}{profile?.full_name || (role === 'admin' ? 'Shop admin' : 'Reader')}</span><button className="nav-signout" onClick={signOut}>Sign out</button></div>}
    </nav>
  </div>{error && <div className="header-error" role="alert">{error}</div>}</header>
}

function Footer() {
  return <footer className="site-footer"><div className="container footer-inner"><Link to="/" className="footer-brand">little bookshop <span>✿</span></Link><p>Made for the love of a good story.</p><span>© {new Date().getFullYear()} Little Bookshop</span></div></footer>
}

export default function App() {
  return <><Header /><Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/signup" element={<SignupPage />} />
    <Route path="/demo-payment" element={<RoleRoute role="customer"><DemoPaymentPage /></RoleRoute>} />
    <Route path="/payment-result" element={<RoleRoute role="customer"><PaymentResultPage /></RoleRoute>} />
    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
    <Route path="/reset-password" element={<ResetPasswordPage />} />
    <Route path="/discover" element={<DiscoverPage />} />
    <Route path="/books" element={<RoleRoute role="customer"><BooksPage /></RoleRoute>} />
    <Route path="/books/:id" element={<RoleRoute role="customer"><BookDetailsPage /></RoleRoute>} />
    <Route path="/cart" element={<RoleRoute role="customer"><CartPage /></RoleRoute>} />
    <Route path="/favorites" element={<RoleRoute role="customer"><FavoritesPage /></RoleRoute>} />
    <Route path="/account" element={<RoleRoute role="customer"><AccountPage /></RoleRoute>} />
    <Route path="/admin" element={<RoleRoute role="admin"><AdminDashboardPage /></RoleRoute>} />
    <Route path="/admin/orders" element={<RoleRoute role="admin"><AdminOrdersPage /></RoleRoute>} />
    <Route path="/admin/books" element={<RoleRoute role="admin"><AdminBooksPage /></RoleRoute>} />
    <Route path="/admin/categories" element={<RoleRoute role="admin"><AdminCategoriesPage /></RoleRoute>} />
    <Route path="/admin/inventory" element={<RoleRoute role="admin"><AdminInventoryPage /></RoleRoute>} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes><Footer /></>
}

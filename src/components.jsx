import { Link, Navigate, useLocation } from 'react-router-dom'
import { ArrowRight, BookOpen, Heart, LoaderCircle, ShieldAlert, Sparkles } from 'lucide-react'
import { useAuth } from './context/AuthContext.jsx'
import { useCart } from './context/useCart.js'
import { formatEtb } from './lib/currency.js'

export function RoleRoute({ role, children }) {
  const { user, profile, loading, profileError } = useAuth()
  const location = useLocation()
  if (loading) return <LoadingState label="Checking your account…" />
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  if (profileError || !profile || !['customer', 'admin'].includes(profile.role)) {
    return <AccessDenied message={profileError || 'Your account does not have an approved role. Please contact the shop owner.'} />
  }
  if (role && profile.role !== role) return <Navigate to={profile.role === 'admin' ? '/admin' : '/books'} replace />
  return children
}

export function LoadingState({ label = 'Loading…' }) {
  return <div className="loading-state"><LoaderCircle className="spin" size={22} />{label}</div>
}

export function Notice({ children, tone = 'error' }) {
  if (!children) return null
  return <div className={`notice notice-${tone}`} role={tone === 'error' ? 'alert' : 'status'}>{children}</div>
}

export function PageHeading({ eyebrow, title, description, action }) {
  return <div className="page-heading"><div>{eyebrow && <span className="eyebrow">{eyebrow}</span>}<h1>{title}</h1>{description && <p>{description}</p>}</div>{action}</div>
}

export function EmptyState({ title, children, action }) {
  return <div className="empty-state"><span className="empty-icon"><BookOpen size={23} /></span><h3>{title}</h3><p>{children}</p>{action}</div>
}

export function AccessDenied({ message }) {
  return <main className="container narrow"><div className="access-card"><ShieldAlert size={30} /><h1>Protected area</h1><p>{message}</p><Link className="button button-secondary" to="/">Back to home</Link></div></main>
}

export function BookCard({ book, favorite = false, onToggleFavorite, showPrice = true }) {
  const { addItem } = useCart()
  const cover = book.cover_url || (book.cover_i ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg` : '')
  return <article className="book-card">
    <Link className="book-cover" to={book.id ? `/books/${book.id}` : '#'} aria-label={`View ${book.title}`}>
      {cover ? <img src={cover} alt={`Cover of ${book.title}`} loading="lazy" /> : <div className="cover-placeholder"><BookOpen size={34} /><span>Little Bookshop</span></div>}
    </Link>
    <div className="book-card-body"><span className="book-category">{book.categories?.name || book.category || 'A good read'}</span>
      <Link to={book.id ? `/books/${book.id}` : '#'} className="book-title">{book.title}</Link>
      <p className="book-author">{book.author || book.author_name?.[0] || 'Unknown author'}</p>
      <div className="book-card-bottom">{showPrice && book.price != null && <strong>{formatEtb(book.price)}</strong>}
        {onToggleFavorite && <button className={`icon-button ${favorite ? 'is-favorite' : ''}`} onClick={() => onToggleFavorite(book)} aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}><Heart size={18} fill={favorite ? 'currentColor' : 'none'} /></button>}
      </div>
      {book.id && <button className="button button-small cart-add-button" disabled={!book.stock || book.is_archived} onClick={() => addItem(book)}>Add to cart</button>}
    </div>
  </article>
}

export function OpenLibraryCard({ book }) {
  const cover = book.cover_i ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg` : ''
  return <article className="book-card">
    <a className="book-cover" href={`https://openlibrary.org${book.key}`} target="_blank" rel="noreferrer" aria-label={`Discover ${book.title} on Open Library`}>
      {cover ? <img src={cover} alt={`Cover of ${book.title}`} loading="lazy" /> : <div className="cover-placeholder"><Sparkles size={31} /><span>Open Library</span></div>}
    </a>
    <div className="book-card-body"><span className="book-category">Open Library</span><a className="book-title" href={`https://openlibrary.org${book.key}`} target="_blank" rel="noreferrer">{book.title}</a><p className="book-author">{book.author_name?.[0] || 'Unknown author'}</p></div>
  </article>
}

export function CTA({ to, children, secondary = false }) {
  return <Link className={`button ${secondary ? 'button-secondary' : ''}`} to={to}>{children}<ArrowRight size={17} /></Link>
}

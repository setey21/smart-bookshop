import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, BookPlus, Check, Heart, Pencil, Search, Trash2 } from 'lucide-react'
import { useAuth } from './context/AuthContext.jsx'
import { useCart } from './context/useCart.js'
import { authService } from './services/authService.js'
import { bookApi } from './services/bookApi.js'
import { searchOpenLibrary } from './services/openLibraryApi.js'
import { BookCard, CTA, EmptyState, LoadingState, Notice, OpenLibraryCard, PageHeading } from './components.jsx'
import { formatEtb } from './lib/currency.js'

export function HomePage() {
  const { user, role } = useAuth()
  return <main className="container">
    <section className="hero">
      <div className="hero-copy"><span className="eyebrow"><span className="tiny-spark">✳</span> A small shop for big imaginations</span>
        <h1>Find your next<br /><em>favorite story.</em></h1>
        <p>Thoughtfully picked books, a cozy corner of the internet, and a little something for every kind of reader.</p>
        <div className="hero-actions"><CTA to={role === 'admin' ? '/admin' : user ? '/books' : '/books'}>Explore the shelves</CTA><Link className="text-link" to="/discover">Discover books <span>↗</span></Link></div>
      </div>
      <div className="hero-art" aria-label="Illustration of books"><div className="sun-shape" /><div className="hero-label">a story<br />starts here</div>
        <div className="book-stack"><div className="illustrated-book book-one"><span>THE<br />WILD<br />GARDEN</span><i>✿</i></div><div className="illustrated-book book-two"><i>☾</i><span>MOON<br />& MOSS</span></div><div className="illustrated-book book-three"><span>little<br />worlds</span><i>✳</i></div></div>
      </div>
    </section>
    <section className="home-note"><div><span className="eyebrow">Good books, good company</span><h2>For the pages you’ll<br />want to keep.</h2></div><p>Browse our little collection, save the books you love, and let your next adventure find you. Our shelves are always growing.</p></section>
    <section className="home-bottom"><div><span>✦</span><h3>Made for curious minds.</h3><p>Every reader belongs here.</p></div><Link to={user ? '/books' : '/signup'} className="round-link">{user ? 'Browse books' : 'Join the book club'} <span>↗</span></Link></section>
  </main>
}

function AuthShell({ title, subtitle, children }) {
  return <main className="container auth-layout"><div className="auth-aside"><span className="eyebrow">Little Bookshop</span><h2>Make room<br />for a <em>new story.</em></h2><p>A good book is always in season.</p><div className="auth-decoration">✿</div></div><section className="auth-card"><span className="eyebrow">Welcome in</span><h1>{title}</h1><p className="auth-subtitle">{subtitle}</p>{children}</section></main>
}

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const navigate = useNavigate()
  const { user, role, loading } = useAuth()
  useEffect(() => {
    if (!loading && user && ['customer', 'admin'].includes(role)) navigate(role === 'admin' ? '/admin' : '/books', { replace: true })
  }, [loading, user, role, navigate])
  async function submit(event) {
    event.preventDefault()
    setError('')
    setBusy(true)
    try { await authService.signIn({ email, password }) } catch (issue) { setError(issue.message || 'Could not sign in.') } finally { setBusy(false) }
  }
  return <AuthShell title="Welcome back." subtitle="Sign in to find your way back to the shelves.">
    <Notice tone="success">Demo customer: reader@little-bookshop.demo / reader12345. Demo admin: admin@little-bookshop.demo / admin12345. Demo accounts and data stay in this browser only.</Notice>
    <Notice>{error}</Notice><form onSubmit={submit} className="form-stack">
      <label>Email address<input type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" /></label>
      <label>Password<input type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your password" /></label>
      <div className="form-row"><span /> <Link className="small-link" to="/forgot-password">Forgot password?</Link></div>
      <button className="button button-full" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'} <span>→</span></button>
    </form><p className="auth-switch">New to our shelves? <Link to="/signup">Create an account</Link></p>
  </AuthShell>
}

export function SignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [busy, setBusy] = useState(false)
  async function submit(event) {
    event.preventDefault()
    setError('')
    setBusy(true)
    try {
      const data = await authService.signUp({ name, email, password })
      setSuccess(data.user ? 'Your demo customer account has been created in this browser. You can sign in now.' : 'Your customer account is ready. You can sign in now.')
    } catch (issue) { setError(issue.message || 'Could not create your account.') } finally { setBusy(false) }
  }
  return <AuthShell title="Join our shelves." subtitle="Create a customer account to save the books you love.">
    <Notice tone="success">This is a browser-only demo. New accounts are saved on this device and are not secure for real customer data.</Notice>
    <Notice>{error}</Notice><Notice tone="success">{success}</Notice><form onSubmit={submit} className="form-stack">
      <label>Your name<input autoComplete="name" required maxLength="80" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jamie Reader" /></label>
      <label>Email address<input type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" /></label>
      <label>Password<input type="password" autoComplete="new-password" minLength="8" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" /><small>Use at least 8 characters.</small></label>
      <button className="button button-full" disabled={busy}>{busy ? 'Creating account…' : 'Create customer account'} <span>→</span></button>
    </form><p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
  </AuthShell>
}

export function ForgotPasswordPage() {
  return <AuthShell title="Demo password help." subtitle="This demo does not send emails or use a password-reset server.">
    <Notice tone="success">Use the demo account details on the sign-in page, or create a new local demo account.</Notice>
    <p className="auth-switch"><Link to="/login">← Back to sign in</Link></p>
  </AuthShell>
}

export function ResetPasswordPage() {
  return <AuthShell title="Demo password help." subtitle="Password recovery is not available in the browser-only demo.">
    <Notice tone="success">No password reset email was sent. Sign in with a demo account or create a new local account.</Notice>
    <p className="auth-switch"><Link to="/login">← Back to sign in</Link></p>
  </AuthShell>
}

function useBooksLoader(search = '', includeArchived = false) {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reload, setReload] = useState(0)
  useEffect(() => {
    let active = true
    setLoading(true); setError('')
    bookApi.listBooks({ search, includeArchived }).then((result) => { if (active) setBooks(result) })
      .catch((issue) => { if (active) setError(issue.message || 'Could not load books.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [search, includeArchived, reload])
  return { books, setBooks, loading, error, reload: () => setReload((value) => value + 1) }
}

export function BooksPage() {
  const { user } = useAuth()
  const [search, setSearch] = useState('')
  const { books, loading, error, reload } = useBooksLoader(search)
  const [favoriteIds, setFavoriteIds] = useState(new Set())
  const [favoriteError, setFavoriteError] = useState('')
  const [discovery, setDiscovery] = useState(false)
  const [externalBooks, setExternalBooks] = useState([])
  const [externalLoading, setExternalLoading] = useState(false)
  const [externalError, setExternalError] = useState('')
  useEffect(() => {
    bookApi.listFavorites(user.id).then((items) => setFavoriteIds(new Set(items.map((item) => item.id)))).catch((issue) => setFavoriteError(issue.message))
  }, [user.id])
  async function toggleFavorite(book) {
    setFavoriteError('')
    const wasFavorite = favoriteIds.has(book.id)
    setFavoriteIds((current) => { const next = new Set(current); wasFavorite ? next.delete(book.id) : next.add(book.id); return next })
    try { await bookApi.setFavorite(user.id, book.id, wasFavorite) }
    catch (issue) { setFavoriteIds((current) => { const next = new Set(current); wasFavorite ? next.add(book.id) : next.delete(book.id); return next }); setFavoriteError(issue.message || 'Could not update favorites.') }
  }
  async function discover() {
    if (!search.trim()) { setExternalError('Type a title or author to search Open Library.'); return }
    setDiscovery(true); setExternalLoading(true); setExternalError('')
    try { setExternalBooks(await searchOpenLibrary(search)) } catch (issue) { setExternalError(issue.message) } finally { setExternalLoading(false) }
  }
  return <main className="container content-page">
    <PageHeading eyebrow="Take your time" title="Browse the shelves." description="A little something for your next chapter." />
    <div className="search-bar"><Search size={19} /><input value={search} onChange={(e) => { setSearch(e.target.value); setDiscovery(false) }} placeholder="Search by title or author…" aria-label="Search books" /><button onClick={discover}>Search Open Library</button></div>
    <Notice>{error || favoriteError}</Notice>
    {loading ? <LoadingState label="Gathering the books…" /> : books.length ? <div className="book-grid">{books.map((book) => <BookCard key={book.id} book={book} favorite={favoriteIds.has(book.id)} onToggleFavorite={toggleFavorite} />)}</div> : <EmptyState title="No books on this shelf just yet." action={<Link className="text-link" to="/discover">Discover books on Open Library →</Link>}>Try another search, or check back as our little collection grows.</EmptyState>}
    {discovery && <section className="discovery-section"><PageHeading eyebrow="Beyond our shelves" title="Open Library discoveries." description="These books are from the public Open Library catalog—not items for sale in our store." />{externalError && <Notice>{externalError}</Notice>}{externalLoading ? <LoadingState label="Searching Open Library…" /> : externalBooks.length ? <div className="book-grid">{externalBooks.map((book) => <OpenLibraryCard key={book.key} book={book} />)}</div> : !externalError && <p className="muted">No matching discoveries yet.</p>}</section>}
  </main>
}

export function DiscoverPage() {
  const [query, setQuery] = useState('')
  const [books, setBooks] = useState([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  async function submit(event) {
    event.preventDefault()
    if (!query.trim()) { setError('Enter a title, author or subject to search.'); return }
    setBusy(true); setError('')
    try { setBooks(await searchOpenLibrary(query)) } catch (issue) { setError(issue.message) } finally { setBusy(false) }
  }
  return <main className="container content-page"><PageHeading eyebrow="A world of stories" title="Discover books." description="Explore the public Open Library catalog. These books are for discovery, not our store inventory." />
    <form className="search-bar" onSubmit={submit}><Search size={19} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Try a title, author or subject…" /><button disabled={busy}>{busy ? 'Searching…' : 'Search'}</button></form>
    <Notice>{error}</Notice>{busy ? <LoadingState /> : books.length ? <div className="book-grid">{books.map((book) => <OpenLibraryCard key={book.key} book={book} />)}</div> : <EmptyState title="Where shall we start?" >Search by a book title, author, or subject to discover more.</EmptyState>}
  </main>
}

export function BookDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { addItem } = useCart()
  const [book, setBook] = useState(null)
  const [favorite, setFavorite] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  useEffect(() => {
    let active = true
    Promise.all([bookApi.getBook(id), bookApi.listFavorites(user.id)]).then(([found, favorites]) => {
      if (active) { setBook(found); setFavorite(favorites.some((item) => item.id === id)) }
    }).catch((issue) => { if (active) setError(issue.message || 'Could not load this book.') }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [id, user.id])
  async function toggle() {
    try { await bookApi.setFavorite(user.id, id, favorite); setFavorite(!favorite) } catch (issue) { setError(issue.message) }
  }
  if (loading) return <main className="container content-page"><LoadingState /></main>
  if (!book) return <main className="container content-page"><Notice>{error || 'This book is not available.'}</Notice><Link to="/books" className="text-link">← Back to books</Link></main>
  return <main className="container content-page"><Link to="/books" className="back-link"><ArrowLeft size={16} /> Back to books</Link><Notice>{error}</Notice>
    <section className="detail-layout"><div className="detail-cover">{book.cover_url ? <img src={book.cover_url} alt={`Cover of ${book.title}`} /> : <div className="cover-placeholder"><span>Little Bookshop</span><BookPlus size={35} /></div>}</div><div className="detail-copy"><span className="eyebrow">{book.categories?.name || 'From our shelves'}</span><h1>{book.title}</h1><p className="detail-author">by {book.author}</p><p className="detail-description">{book.description || 'A new favorite, waiting to be discovered.'}</p><strong className="detail-price">{formatEtb(book.price)}</strong><p className="stock-note">{book.stock > 0 ? `${book.stock} in stock` : 'Currently out of stock'}</p><div className="detail-actions"><button className="button button-secondary" onClick={toggle}><Heart size={17} fill={favorite ? 'currentColor' : 'none'} />{favorite ? 'Saved to favorites' : 'Add to favorites'}</button><button className="button button-secondary" disabled={!book.stock} onClick={() => addItem(book)}>Add to cart</button><button className="button" disabled={!book.stock} onClick={() => { addItem(book); navigate('/cart') }}>Buy now</button></div></div></section>
  </main>
}

export function CartPage() {
  const { user } = useAuth()
  const { items, setQuantity, removeItem, clearCart } = useCart()
  const navigate = useNavigate()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  async function checkout() {
    setError('')
    setBusy(true)
    try {
      const order = await bookApi.createDemoOrder(user.id, items, {
        name: user.user_metadata?.full_name,
        email: user.email,
      })
      navigate(`/demo-payment?tx_ref=${encodeURIComponent(order.tx_ref)}`)
    } catch (issue) {
      setError(issue.message || 'Could not complete the demo checkout.')
      setBusy(false)
    }
  }

  return <main className="container content-page">
    <PageHeading eyebrow="Your next chapter" title="Your cart." description="Review your books and try the local demo checkout." />
    <Notice>{error}</Notice>
    {!items.length ? <EmptyState title="Your cart is empty." action={<Link to="/books" className="text-link">Browse books →</Link>}>Add books from the shop catalogue and they will be saved here.</EmptyState> : <>
      <div className="cart-list">{items.map((item) => <article className="cart-item" key={item.id}>
        {item.cover_url ? <img src={item.cover_url} alt={`Cover of ${item.title}`} /> : <div className="cart-cover-placeholder"><BookPlus size={24} /></div>}
        <div className="cart-item-info"><h2>{item.title}</h2><p>by {item.author}</p><strong>{formatEtb(item.price)}</strong></div>
        <label className="cart-quantity">Quantity<input type="number" min="1" max="10" value={item.quantity} onChange={(event) => {
          const quantity = Number(event.target.value)
          if (Number.isInteger(quantity) && quantity <= 10) setQuantity(item.id, quantity)
        }} /></label>
        <button className="text-link" onClick={() => removeItem(item.id)}>Remove</button>
      </article>)}</div>
      <section className="cart-summary"><div><span>Estimated total (ETB)</span><strong>{formatEtb(subtotal)}</strong></div><p>Continue to the Chapa demo payment step. This simulation never collects payment details or charges money.</p><div className="form-actions"><button className="button button-secondary" onClick={clearCart} disabled={busy}>Clear cart</button><button className="button" onClick={checkout} disabled={busy}>{busy ? 'Preparing demo payment…' : 'Continue to Chapa demo'}</button></div></section>
    </>}
  </main>
}

export function DemoPaymentPage() {
  const { user } = useAuth()
  const { clearCart } = useCart()
  const navigate = useNavigate()
  const txRef = new URLSearchParams(window.location.search).get('tx_ref')
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    if (!txRef) {
      setError('This demo checkout is missing its order reference. Return to your cart and try again.')
      setLoading(false)
      return () => { active = false }
    }
    bookApi.getDemoOrder(user.id, txRef)
      .then((found) => {
        if (!active) return
        if (!found || found.status !== 'pending') {
          setError(found ? 'This demo payment is no longer pending.' : 'Demo order not found in this browser.')
          return
        }
        setOrder(found)
      })
      .catch((issue) => { if (active) setError(issue.message || 'Could not load the demo order.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [user.id, txRef])

  async function confirmDemoPayment() {
    if (!txRef) return
    setBusy(true)
    setError('')
    try {
      await bookApi.completeDemoPayment(user.id, txRef)
      navigate(`/payment-result?tx_ref=${encodeURIComponent(txRef)}`)
    } catch (issue) {
      setError(issue.message || 'Could not complete the Chapa demo payment.')
    } finally {
      setBusy(false)
    }
  }

  async function cancelDemoPayment() {
    if (!txRef) return
    setBusy(true)
    setError('')
    try {
      await bookApi.cancelDemoOrder(user.id, txRef)
      navigate('/cart')
    } catch (issue) {
      setError(issue.message || 'Could not cancel this demo order.')
      setBusy(false)
    }
  }

  return <main className="container content-page">
    <PageHeading eyebrow="Chapa payment demo" title="Review your payment." description="This is a simulated checkout step; no payment details or real money are involved." />
    <Notice>{error}</Notice>
    {loading ? <LoadingState label="Loading your demo order…" /> : order && <section className="settings-card demo-payment-card">
      <div className="demo-payment-brand"><span className="eyebrow">Demo hosted checkout</span><strong>Chapa</strong></div>
      <p>Paying Little Bookshop</p>
      <p>Order reference <b>{order.tx_ref.slice(0, 12)}</b></p>
      <div className="demo-payment-items">{order.items.map((item) => <div key={item.book_id}><span>{item.title} × {item.quantity}</span><strong>{formatEtb(item.unit_price * item.quantity)}</strong></div>)}</div>
      <div className="demo-payment-total"><span>Total</span><strong>{formatEtb(order.total_amount)}</strong></div>
      <div className="demo-payment-method"><span className="status-pill">Selected payment method</span><b>Chapa demo</b></div>
      <Notice tone="success">Demo only. This button will simulate a successful payment. Do not enter card, bank, mobile-money, or OTP details.</Notice>
      <div className="form-actions">
        <button className="button button-secondary" onClick={cancelDemoPayment} disabled={busy}>Cancel</button>
        <button className="button" onClick={confirmDemoPayment} disabled={busy}>{busy ? 'Confirming…' : 'Simulate successful payment'}</button>
      </div>
    </section>}
  </main>
}

export function PaymentResultPage() {
  const { clearCart } = useCart()
  const { user } = useAuth()
  const [status, setStatus] = useState('Checking your demo order…')
  const [error, setError] = useState('')
  useEffect(() => {
    let active = true
    const txRef = new URLSearchParams(window.location.search).get('tx_ref')
    if (!txRef) {
      setStatus('')
      setError('This payment link is missing its transaction reference. Open your cart to start again.')
      return () => { active = false }
    }
    bookApi.getDemoOrder(user.id, txRef)
      .then((order) => {
        if (!active) return
        if (order) {
          if (order.status === 'demo-paid') {
            clearCart()
            setStatus(`Chapa demo payment successful — ${formatEtb(order.total_amount)}. No money was charged.`)
          } else if (order.status === 'demo-cancelled') {
            setStatus('')
            setError('Demo payment was cancelled. No money was charged and your cart was not changed.')
          } else {
            setStatus('')
            setError('This demo order has not been paid yet. Return to checkout to confirm it.')
          }
        } else {
          setStatus('')
          setError('Demo order not found in this browser. Return to your cart and try again.')
        }
      })
      .catch((issue) => {
        if (active) {
          setStatus('')
          setError(issue.message || 'Could not load this demo order.')
        }
      })
    return () => { active = false }
  }, [clearCart, user.id])
  return <main className="container content-page"><PageHeading eyebrow="Chapa payment demo" title="Order status." description="This simulated payment never contacts Chapa or moves real money." />
    {status && <Notice tone="success">{status}</Notice>}{error && <Notice>{error}</Notice>}
    <Link className="button button-secondary" to="/books">Continue browsing</Link>
  </main>
}

export function FavoritesPage() {
  const { user } = useAuth()
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  useEffect(() => {
    let active = true
    bookApi.listFavorites(user.id).then((data) => { if (active) setBooks(data) }).catch((issue) => { if (active) setError(issue.message) }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [user.id])
  async function remove(book) {
    try { await bookApi.setFavorite(user.id, book.id, true); setBooks((current) => current.filter((item) => item.id !== book.id)) }
    catch (issue) { setError(issue.message || 'Could not remove favorite.') }
  }
  return <main className="container content-page"><PageHeading eyebrow="Saved just for you" title="Your favorites." description="All the stories you want to come back to." />
    <Notice>{error}</Notice>{loading ? <LoadingState /> : books.length ? <div className="book-grid">{books.map((book) => <BookCard key={book.id} book={book} favorite onToggleFavorite={remove} />)}</div> : <EmptyState title="Your favorites shelf is waiting." action={<Link to="/books" className="text-link">Browse books →</Link>}>Tap the heart on a book to save it here for later.</EmptyState>}
  </main>
}

export function AccountPage() {
  const { user, profile, refreshProfile } = useAuth()
  const [name, setName] = useState(profile?.full_name || '')
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  async function submit(event) {
    event.preventDefault(); setBusy(true); setNotice(''); setError('')
    try { await authService.updateName(name); await refreshProfile(); setNotice('Your profile has been updated.') }
    catch (issue) { setError(issue.message || 'Could not update your profile.') } finally { setBusy(false) }
  }
  return <main className="container content-page"><PageHeading eyebrow="Your little corner" title="Account." description="Manage the details connected to your account." />
    <section className="settings-card"><Notice>{error}</Notice><Notice tone="success">{notice}</Notice><form onSubmit={submit} className="form-stack"><label>Your name<input required maxLength="80" value={name} onChange={(e) => setName(e.target.value)} /></label><label>Email address<input value={user.email || ''} disabled /><small>This email belongs to your local demo account.</small></label><div><button className="button" disabled={busy}>{busy ? 'Saving…' : 'Save changes'} <Check size={17} /></button></div></form><hr /><p className="muted">Need a new password? <Link to="/forgot-password" className="small-link">Password help</Link></p></section>
  </main>
}

function BookEditor({ book, categories, onSave, onCancel }) {
  const [form, setForm] = useState({ title: book?.title || '', author: book?.author || '', description: book?.description || '', cover_url: book?.cover_url || '', price: book?.price ?? '', stock: book?.stock ?? 0, category_id: book?.category_id || '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  function change(key, value) { setForm((current) => ({ ...current, [key]: value })) }
  async function submit(event) {
    event.preventDefault(); setError('')
    if (!Number.isFinite(Number(form.price)) || Number(form.price) < 0 || !Number.isInteger(Number(form.stock)) || Number(form.stock) < 0) { setError('Price must be zero or more and stock must be a whole number of zero or more.'); return }
    setBusy(true)
    try { await onSave({ ...form, id: book?.id }); onCancel() } catch (issue) { setError(issue.message || 'Could not save this book.') } finally { setBusy(false) }
  }
  return <form className="editor-card form-stack" onSubmit={submit}><h2>{book ? 'Edit book' : 'Add a book'}</h2><Notice>{error}</Notice>
    <label>Title<input required maxLength="180" value={form.title} onChange={(e) => change('title', e.target.value)} /></label>
    <label>Author<input required maxLength="140" value={form.author} onChange={(e) => change('author', e.target.value)} /></label>
    <label>Description<textarea rows="3" maxLength="3000" value={form.description} onChange={(e) => change('description', e.target.value)} /></label>
    <label>Cover image URL<input type="url" value={form.cover_url} onChange={(e) => change('cover_url', e.target.value)} placeholder="https://…" /></label>
    <div className="form-grid"><label>Price (ETB)<input type="number" step="0.01" min="0" required value={form.price} onChange={(e) => change('price', e.target.value)} /></label><label>Stock<input type="number" step="1" min="0" required value={form.stock} onChange={(e) => change('stock', e.target.value)} /></label></div>
    <label>Category<select value={form.category_id} onChange={(e) => change('category_id', e.target.value)}><option value="">Uncategorized</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
    <div className="form-actions"><button type="button" className="button button-secondary" onClick={onCancel}>Cancel</button><button className="button" disabled={busy}>{busy ? 'Saving…' : 'Save book'}</button></div>
  </form>
}

export function AdminDashboardPage() {
  const { books, loading, error } = useBooksLoader('', true)
  const [categories, setCategories] = useState([])
  const [orders, setOrders] = useState([])
  const [categoryError, setCategoryError] = useState('')
  useEffect(() => {
    Promise.all([bookApi.listCategories(), bookApi.listDemoOrders()])
      .then(([nextCategories, nextOrders]) => { setCategories(nextCategories); setOrders(nextOrders) })
      .catch((issue) => setCategoryError(issue.message || 'Could not load the demo shop data.'))
  }, [])
  const active = books.filter((book) => !book.is_archived)
  const inventory = active.reduce((sum, book) => sum + Number(book.stock || 0), 0)
  return <main className="container content-page"><PageHeading eyebrow="A good day at the shop" title="Shop dashboard." description="A quick look at the little bookshop." />
    <Notice>{error || categoryError}</Notice>{loading ? <LoadingState /> : <><div className="stats-grid"><div className="stat-card"><span>Active books</span><strong>{active.length}</strong><small>on the shelves</small></div><div className="stat-card"><span>Categories</span><strong>{categories.length}</strong><small>ways to explore</small></div><div className="stat-card"><span>Books in stock</span><strong>{inventory}</strong><small>across active titles</small></div></div><div className="admin-shortcuts"><Link to="/admin/orders"><span className="shortcut-letter">↗</span><span><b>Demo orders ({orders.length})</b><small>Review local demo checkouts</small></span><span>→</span></Link><Link to="/admin/books"><BookPlus size={20} /><span><b>Manage books</b><small>Add, edit or archive titles</small></span><span>→</span></Link><Link to="/admin/categories"><span className="shortcut-letter">Aa</span><span><b>Manage categories</b><small>Organize your shelves</small></span><span>→</span></Link><Link to="/admin/inventory"><span className="shortcut-letter">#</span><span><b>Inventory</b><small>Update available stock</small></span><span>→</span></Link></div></>}
  </main>
}

export function AdminOrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  useEffect(() => {
    bookApi.listDemoOrders()
      .then(setOrders)
      .catch((issue) => setError(issue.message || 'Could not load demo orders.'))
      .finally(() => setLoading(false))
  }, [])
  return <main className="container content-page">
    <PageHeading eyebrow="Behind the counter" title="Demo orders." description="Orders created by the simulated checkout in this browser." />
    <Notice>{error}</Notice>
    {loading ? <LoadingState /> : orders.length ? <div className="table-wrap"><table><thead><tr><th>Order</th><th>Customer</th><th>Items</th><th>Total</th><th>Type</th><th>Created</th></tr></thead><tbody>{orders.map((order) => <tr key={order.tx_ref}>
      <td><b>{order.tx_ref.slice(0, 8)}</b></td>
      <td><b>{order.customer_name}</b><small>{order.customer_email}</small></td>
      <td>{order.items.map((item) => `${item.title} × ${item.quantity}`).join(', ')}</td>
      <td>{formatEtb(order.total_amount)}</td>
      <td><span className="status-pill">{order.status === 'demo-paid' ? 'Demo paid' : order.status === 'demo-cancelled' ? 'Cancelled' : 'Pending'}</span></td>
      <td>{new Date(order.created_at).toLocaleString()}</td>
    </tr>)}</tbody></table></div> : <EmptyState title="No demo orders yet."><Link to="/books" className="text-link">Browse books</Link> and complete a test checkout to see it here.</EmptyState>}
  </main>
}

export function AdminBooksPage() {
  const { books, loading, error, reload } = useBooksLoader('', true)
  const [categories, setCategories] = useState([])
  const [editing, setEditing] = useState(null)
  const [notice, setNotice] = useState('')
  const [actionError, setActionError] = useState('')
  useEffect(() => { bookApi.listCategories().then(setCategories).catch((issue) => setActionError(issue.message)) }, [])
  async function save(book) { await bookApi.saveBook(book); setNotice(book.id ? 'Book details updated.' : 'Book added to the shelves.'); reload() }
  async function archive(book) {
    if (!window.confirm(`Archive “${book.title}”? It will no longer appear in the customer catalogue.`)) return
    setActionError(''); setNotice('')
    try { await bookApi.archiveBook(book.id); setNotice('Book archived.'); reload() } catch (issue) { setActionError(issue.message || 'Could not archive book.') }
  }
  return <main className="container content-page"><PageHeading eyebrow="Keep the shelves fresh" title="Manage books." description="Add titles, update details, or archive books no longer for sale." action={<button className="button" onClick={() => setEditing({})}><BookPlus size={17} /> Add book</button>} />
    <Notice>{error || actionError}</Notice><Notice tone="success">{notice}</Notice>{editing !== null && <BookEditor book={editing.id ? editing : null} categories={categories} onSave={save} onCancel={() => setEditing(null)} />}
    {loading ? <LoadingState /> : books.length ? <div className="table-wrap"><table><thead><tr><th>Title</th><th>Category</th><th>Price (ETB)</th><th>Stock</th><th>Status</th><th>Actions</th></tr></thead><tbody>{books.map((book) => <tr key={book.id}><td><b>{book.title}</b><small>{book.author}</small></td><td>{book.categories?.name || '—'}</td><td>{formatEtb(book.price)}</td><td>{book.stock}</td><td><span className={`status-pill ${book.is_archived ? 'archived' : ''}`}>{book.is_archived ? 'Archived' : 'Active'}</span></td><td><div className="table-actions"><button aria-label={`Edit ${book.title}`} title="Edit" onClick={() => setEditing(book)}><Pencil size={16} /></button>{!book.is_archived && <button aria-label={`Archive ${book.title}`} title="Archive" onClick={() => archive(book)}><Trash2 size={16} /></button>}</div></td></tr>)}</tbody></table></div> : <EmptyState title="Your shelves are empty." action={<button className="text-link" onClick={() => setEditing({})}>Add your first book →</button>}>Add your first book to start building the shop catalogue.</EmptyState>}
  </main>
}

export function AdminCategoriesPage() {
  const [categories, setCategories] = useState([])
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [editing, setEditing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)
  async function reload() { setLoading(true); try { setCategories(await bookApi.listCategories()); setError('') } catch (issue) { setError(issue.message) } finally { setLoading(false) } }
  useEffect(() => { reload() }, [])
  function startEdit(category) { setEditing(category); setName(category.name); setDescription(category.description || '') }
  function cancelEdit() { setEditing(null); setName(''); setDescription('') }
  async function submit(event) {
    event.preventDefault(); setError(''); setNotice(''); setBusy(true)
    try { await bookApi.saveCategory({ id: editing?.id, name, description }); setNotice(editing ? 'Category updated.' : 'Category added.'); cancelEdit(); await reload() }
    catch (issue) { setError(issue.message || 'Could not save category.') } finally { setBusy(false) }
  }
  return <main className="container content-page"><PageHeading eyebrow="Neat little shelves" title="Manage categories." description="Group books so customers can find their next favorite." /><Notice>{error}</Notice><Notice tone="success">{notice}</Notice>
    <form className="category-form" onSubmit={submit}><div className="form-grid"><label>Category name<input required maxLength="80" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Fiction" /></label><label>Description<input maxLength="240" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="A short introduction" /></label></div><div className="form-actions">{editing && <button type="button" className="button button-secondary" onClick={cancelEdit}>Cancel</button>}<button className="button" disabled={busy}>{busy ? 'Saving…' : editing ? 'Update category' : 'Add category'}</button></div></form>
    {loading ? <LoadingState /> : categories.length ? <div className="category-list">{categories.map((category) => <div key={category.id} className="category-row"><div><b>{category.name}</b><p>{category.description || 'No description yet.'}</p></div><button className="text-link" onClick={() => startEdit(category)}>Edit</button></div>)}</div> : <EmptyState title="No categories yet.">Create your first category above.</EmptyState>}
  </main>
}

export function AdminInventoryPage() {
  const { books, loading, error, reload } = useBooksLoader('', true)
  const [stocks, setStocks] = useState({})
  const [notice, setNotice] = useState('')
  const [actionError, setActionError] = useState('')
  useEffect(() => { const initial = {}; books.forEach((book) => { initial[book.id] = book.stock }); setStocks(initial) }, [books])
  async function saveStock(book) {
    const stock = Number(stocks[book.id])
    if (!Number.isInteger(stock) || stock < 0) { setActionError('Stock must be a whole number of zero or more.'); return }
    setActionError(''); setNotice('')
    try { await bookApi.saveBook({ ...book, stock }); setNotice(`Stock updated for ${book.title}.`); reload() } catch (issue) { setActionError(issue.message || 'Could not update stock.') }
  }
  const activeBooks = books.filter((book) => !book.is_archived)
  return <main className="container content-page"><PageHeading eyebrow="Behind the counter" title="Inventory." description="Update how many copies are available on the shelves." /><Notice>{error || actionError}</Notice><Notice tone="success">{notice}</Notice>
    {loading ? <LoadingState /> : activeBooks.length ? <div className="table-wrap"><table><thead><tr><th>Book</th><th>Current stock</th><th>Update quantity</th><th /></tr></thead><tbody>{activeBooks.map((book) => <tr key={book.id}><td><b>{book.title}</b><small>{book.author}</small></td><td><span className={book.stock > 0 ? 'stock-good' : 'stock-zero'}>{book.stock} copies</span></td><td><input className="stock-input" type="number" min="0" step="1" value={stocks[book.id] ?? book.stock} onChange={(e) => setStocks((current) => ({ ...current, [book.id]: e.target.value }))} aria-label={`Stock for ${book.title}`} /></td><td><button className="button button-small" onClick={() => saveStock(book)}>Save</button></td></tr>)}</tbody></table></div> : <EmptyState title="Nothing to count yet." action={<Link to="/admin/books" className="text-link">Add a book →</Link>}>Add active titles to the catalogue before updating inventory.</EmptyState>}
  </main>
}

import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from './hooks/useAuth.jsx'
import { useState, useEffect, useRef } from 'react'

import Splash from './pages/Splash'
import Onboarding from './pages/Onboarding'
import Auth from './pages/Auth'
import Home from './pages/Home'
import Explore from './pages/Explore'
import BookDetail from './pages/BookDetail'
import Read from './pages/Read'
import Profile from './pages/Profile'
import MyList from './pages/MyList'
import Clubs from './pages/Clubs'
import Ranking from './pages/Ranking'
import Catalog from './pages/Catalog'
import Search from './pages/Search'
import ShareQuote from './pages/ShareQuote'

const NAV_ORDER = ['/', '/explore', '/mylist', '/clubs', '/profile']

function NavBar() {
  const navigate = useNavigate()
  const location = useLocation()
  const current = location.pathname
  const navItems = [
    { id: '/',        icon: '🏠', label: 'Início' },
    { id: '/explore', icon: '🔭', label: 'Explorar' },
    { id: '/mylist',  icon: '📚', label: 'Lista' },
    { id: '/clubs',   icon: '👥', label: 'Clubes' },
    { id: '/profile', icon: '👤', label: 'Perfil' },
  ]
  return (
    <nav className="bottom-nav">
      {navItems.map((item) => (
        <button key={item.id} onClick={() => navigate(item.id)}
          className={`nav-item${current === item.id ? ' active' : ''}`}>
          <span style={{ fontSize: current === item.id ? 22 : 20, filter: current === item.id ? 'none' : 'grayscale(1) opacity(0.5)' }}>{item.icon}</span>
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  )
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div style={{ minHeight: '100vh', background: 'var(--bg)' }} />
  if (!user) return <Navigate to="/auth" replace />
  return children
}

// Detecta direção da animação com base na ordem das rotas
function usePageAnimation() {
  const location = useLocation()
  const prevPathRef = useRef(location.pathname)
  const [animClass, setAnimClass] = useState('')

  useEffect(() => {
    const prev = prevPathRef.current
    const curr = location.pathname
    if (prev === curr) return

    const prevIdx = NAV_ORDER.indexOf(prev)
    const currIdx = NAV_ORDER.indexOf(curr)

    if (prevIdx !== -1 && currIdx !== -1) {
      // Navegação no nav: slide horizontal
      setAnimClass(currIdx > prevIdx ? 'page-enter' : 'page-back')
    } else if (NAV_ORDER.includes(prev) && !NAV_ORDER.includes(curr)) {
      // Indo para página interna: slide para dentro
      setAnimClass('page-enter')
    } else {
      // Voltando: slide para fora
      setAnimClass('page-back')
    }
    prevPathRef.current = curr
  }, [location.pathname])

  return animClass
}

export default function App() {
  const { user, loading } = useAuth()
  const location = useLocation()
  const [shareQuoteData, setShareQuoteData] = useState(null)
  const animClass = usePageAnimation()

  const navPages = ['/', '/explore', '/mylist', '/clubs', '/profile']
  const showNav = navPages.includes(location.pathname)

  if (loading) return <div style={{ minHeight: '100vh', background: 'var(--bg)' }} />

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', minHeight: '100vh', background: 'var(--bg)', position: 'relative' }}>
      {shareQuoteData && (
        <ShareQuote
          quote={shareQuoteData.quote}
          bookTitle={shareQuoteData.bookTitle}
          author={shareQuoteData.author}
          onClose={() => setShareQuoteData(null)}
        />
      )}

      <div key={location.pathname} className={animClass} style={{ minHeight: '100vh' }}>
        <Routes location={location}>
          <Route path="/auth"       element={user ? <Navigate to="/" replace /> : <Auth />} />
          <Route path="/splash"     element={<Splash onDone={() => {}} />} />
          <Route path="/onboarding" element={<Onboarding onDone={() => {}} />} />

          <Route path="/"        element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/explore" element={<ProtectedRoute><Explore /></ProtectedRoute>} />
          <Route path="/mylist"  element={<ProtectedRoute><MyList /></ProtectedRoute>} />
          <Route path="/clubs"   element={<ProtectedRoute><Clubs /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/ranking" element={<ProtectedRoute><Ranking /></ProtectedRoute>} />
          <Route path="/catalog" element={<ProtectedRoute><Catalog /></ProtectedRoute>} />
          <Route path="/search"  element={<ProtectedRoute><Search /></ProtectedRoute>} />
          <Route path="/book/:id" element={
            <ProtectedRoute>
              <BookDetail onShareQuote={(q,t,a) => setShareQuoteData({quote:q,bookTitle:t,author:a})} />
            </ProtectedRoute>
          } />
          <Route path="/read/:id" element={
            <ProtectedRoute>
              <Read onShareQuote={(q,t,a) => setShareQuoteData({quote:q,bookTitle:t,author:a})} />
            </ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      {showNav && user && <NavBar />}
    </div>
  )
}

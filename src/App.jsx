import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from './hooks/useAuth.jsx'
import { useState } from 'react'

// Pages
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

function NavBar() {
  const navigate = useNavigate()
  const location = useLocation()
  const current = location.pathname
  const navItems = [
    { id: '/', icon: '🏠', label: 'Início' },
    { id: '/explore', icon: '🔭', label: 'Explorar' },
    { id: '/mylist', icon: '📚', label: 'Lista' },
    { id: '/clubs', icon: '👥', label: 'Clubes' },
    { id: '/profile', icon: '👤', label: 'Perfil' },
  ]
  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
      width: '100%', maxWidth: 480, background: 'rgba(15,14,12,0.95)',
      backdropFilter: 'blur(12px)', borderTop: '1px solid #2a2820',
      display: 'flex', zIndex: 100, paddingBottom: 'env(safe-area-inset-bottom, 0px)'
    }}>
      {navItems.map((item) => (
        <button key={item.id} onClick={() => navigate(item.id)} style={{
          flex: 1, padding: '10px 4px 8px', background: 'none', border: 'none',
          cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2
        }}>
          <span style={{ fontSize: current === item.id ? 22 : 20, filter: current === item.id ? 'none' : 'grayscale(1) opacity(0.5)' }}>{item.icon}</span>
          <span style={{ fontSize: 10, color: current === item.id ? '#e8c97a' : '#6b6860', fontFamily: 'DM Sans, sans-serif' }}>{item.label}</span>
        </button>
      ))}
    </nav>
  )
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div style={{ minHeight: '100vh', background: '#0f0e0c' }} />
  if (!user) return <Navigate to="/auth" replace />
  return children
}

function Layout({ children, showNav }) {
  return (
    <div style={{ maxWidth: 480, margin: '0 auto', minHeight: '100vh', background: '#0f0e0c', position: 'relative' }}>
      {children}
      {showNav && <NavBar />}
    </div>
  )
}

export default function App() {
  const { user, loading } = useAuth()
  const [shareQuoteData, setShareQuoteData] = useState(null)
  const location = useLocation()

  const navPages = ['/', '/explore', '/mylist', '/clubs', '/profile']
  const showNav = navPages.includes(location.pathname)

  if (loading) return <div style={{ minHeight: '100vh', background: '#0f0e0c' }} />

  return (
    <Layout showNav={showNav && !!user}>
      {shareQuoteData && (
        <ShareQuote
          quote={shareQuoteData.quote}
          bookTitle={shareQuoteData.bookTitle}
          author={shareQuoteData.author}
          onClose={() => setShareQuoteData(null)}
        />
      )}
      <Routes>
        <Route path="/auth" element={user ? <Navigate to="/" replace /> : <Auth />} />
        <Route path="/splash" element={<Splash onDone={() => {}} />} />
        <Route path="/onboarding" element={<Onboarding onDone={() => {}} />} />

        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/explore" element={<ProtectedRoute><Explore /></ProtectedRoute>} />
        <Route path="/mylist" element={<ProtectedRoute><MyList /></ProtectedRoute>} />
        <Route path="/clubs" element={<ProtectedRoute><Clubs /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/ranking" element={<ProtectedRoute><Ranking /></ProtectedRoute>} />
        <Route path="/catalog" element={<ProtectedRoute><Catalog /></ProtectedRoute>} />
        <Route path="/search" element={
          <ProtectedRoute>
            <Search onBack={() => window.history.back()} onBookSelect={(book) => {
              window.location.href = `/book/${book.id}`
            }} />
          </ProtectedRoute>
        } />
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
    </Layout>
  )
}

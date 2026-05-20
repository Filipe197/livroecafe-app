import { useEffect, useState } from 'react'
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { supabase } from './lib/supabase'

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

function NavBar({ current }) {
  const navigate = useNavigate()
  const navItems = [
    { id: '/', icon: '🏠', label: 'Início' },
    { id: '/explore', icon: '🔭', label: 'Explorar' },
    { id: '/mylist', icon: '📚', label: 'Minha Lista' },
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
        <button
          key={item.id}
          onClick={() => navigate(item.id)}
          style={{
            flex: 1, padding: '10px 4px 8px', background: 'none', border: 'none',
            cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2
          }}
        >
          <span style={{ fontSize: current === item.id ? 22 : 20, filter: current === item.id ? 'none' : 'grayscale(1) opacity(0.5)' }}>{item.icon}</span>
          <span style={{ fontSize: 10, color: current === item.id ? '#e8c97a' : '#6b6860', fontFamily: 'DM Sans, sans-serif' }}>{item.label}</span>
        </button>
      ))}
    </nav>
  )
}

function ProtectedLayout({ children }) {
  const [user, setUser] = useState(undefined)
  const [shareQuoteData, setShareQuoteData] = useState(null)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  if (user === undefined) return <div style={{ minHeight: '100vh', background: '#0f0e0c' }} />
  if (user === null) return <Navigate to="/auth" replace />

  const navPages = ['/', '/explore', '/mylist', '/clubs', '/profile']
  const showNav = navPages.includes(location.pathname)

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', minHeight: '100vh', position: 'relative', background: '#0f0e0c' }}>
      {shareQuoteData && (
        <ShareQuote
          quote={shareQuoteData.quote}
          bookTitle={shareQuoteData.bookTitle}
          author={shareQuoteData.author}
          onClose={() => setShareQuoteData(null)}
        />
      )}
      {children({ user, supabase, onShareQuote: (q, t, a) => setShareQuoteData({ quote: q, bookTitle: t, author: a }) })}
      {showNav && <NavBar current={location.pathname} />}
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/splash" element={<Splash onDone={() => {}} />} />
      <Route path="/onboarding" element={<Onboarding onDone={() => {}} />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/*" element={
        <ProtectedLayout>
          {({ user, supabase, onShareQuote }) => (
            <Routes>
              <Route path="/" element={<Home user={user} supabase={supabase} />} />
              <Route path="/explore" element={<Explore user={user} supabase={supabase} />} />
              <Route path="/mylist" element={<MyList user={user} supabase={supabase} />} />
              <Route path="/clubs" element={<Clubs user={user} supabase={supabase} />} />
              <Route path="/profile" element={<Profile user={user} supabase={supabase} onLogout={() => supabase.auth.signOut()} />} />
              <Route path="/ranking" element={<Ranking user={user} supabase={supabase} />} />
              <Route path="/catalog" element={<Catalog user={user} supabase={supabase} />} />
              <Route path="/search" element={<Search user={user} supabase={supabase} onBookSelect={() => {}} onBack={() => window.history.back()} />} />
              <Route path="/book/:id" element={<BookDetail user={user} supabase={supabase} onShareQuote={onShareQuote} />} />
              <Route path="/read/:id" element={<Read user={user} supabase={supabase} onShareQuote={onShareQuote} />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          )}
        </ProtectedLayout>
      } />
    </Routes>
  )
}

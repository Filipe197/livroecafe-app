import { useState, useEffect } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth.jsx'
import { useOnlineStatus } from './hooks/useOffline'
import Home from './pages/Home'
import Catalog from './pages/Catalog'
import Explore from './pages/Explore'
import BookDetail from './pages/BookDetail'
import Read from './pages/Read'
import MyList from './pages/MyList'
import Profile from './pages/Profile'
import Auth from './pages/Auth'
import Splash from './pages/Splash'
import Onboarding from './pages/Onboarding'
import Clubs from './pages/Clubs'
import Ranking from './pages/Ranking'

const tabs = [
  { path: '/', label: 'Início' },
  { path: '/explore', label: 'Explorar' },
  { path: '/clubs', label: 'Clubes' },
  { path: '/profile', label: 'Perfil' },
]
const hideNavOn = ['/read/', '/auth']

function HomeIcon({ active }) { return <svg width="22" height="22" viewBox="0 0 24 24" fill={active?'currentColor':'none'} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> }
function ExploreIcon({ active }) { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill={active?'currentColor':'none'}/></svg> }
function ClubIcon({ active }) { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4" fill={active?'currentColor':'none'} fillOpacity="0.15"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> }
function UserIcon({ active }) { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4" fill={active?'currentColor':'none'} fillOpacity="0.15"/></svg> }
const icons = [HomeIcon, ExploreIcon, ClubIcon, UserIcon]

function PageTransition({ children }) {
  const location = useLocation()
  const [displayed, setDisplayed] = useState(children)
  const [fading, setFading] = useState(false)
  useEffect(() => {
    setFading(true)
    const t = setTimeout(() => { setDisplayed(children); setFading(false) }, 130)
    return () => clearTimeout(t)
  }, [location.pathname])
  return (
    <div style={{ opacity: fading ? 0 : 1, transform: fading ? 'translateY(5px)' : 'translateY(0)', transition: 'opacity 0.18s ease, transform 0.18s ease', height: '100%' }}>
      {displayed}
    </div>
  )
}

function Shell() {
  const navigate = useNavigate()
  const location = useLocation()
  const online = useOnlineStatus()
  const hideNav = hideNavOn.some(p => location.pathname.startsWith(p))
  const activeTab = location.pathname === '/' ? '/' :
    tabs.find(t => t.path !== '/' && location.pathname.startsWith(t.path))?.path || '/'
  return (
    <div className="app-shell">
      {!online && <div className="offline-banner">📵 Sem conexão — exibindo conteúdo salvo</div>}
      <div className="page-content" style={{ ...(hideNav ? { paddingBottom: 0 } : {}), ...(!online ? { paddingTop: 32 } : {}) }}>
        <PageTransition>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/clubs" element={<Clubs />} />
            <Route path="/ranking" element={<Ranking />} />
            <Route path="/book/:id" element={<BookDetail />} />
            <Route path="/read/:id" element={<Read />} />
            <Route path="/mylist" element={<MyList />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/auth" element={<Auth />} />
          </Routes>
        </PageTransition>
      </div>
      {!hideNav && (
        <nav className="bottom-nav">
          {tabs.map((tab, i) => {
            const active = activeTab === tab.path
            const Icon = icons[i]
            return (
              <button key={tab.path} className={'nav-item' + (active ? ' active' : '')} onClick={() => navigate(tab.path)}>
                <Icon active={active} />
                {tab.label}
              </button>
            )
          })}
        </nav>
      )}
    </div>
  )
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true)
  const [showOnboarding, setShowOnboarding] = useState(false)

  function handleSplashDone() {
    setShowSplash(false)
    const done = localStorage.getItem('onboarding_done')
    if (!done) setShowOnboarding(true)
  }

  return (
    <AuthProvider>
      {showSplash && <Splash onDone={handleSplashDone} />}
      {!showSplash && showOnboarding && <Onboarding onDone={() => setShowOnboarding(false)} />}
      <Shell />
    </AuthProvider>
  )
}

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'
import { supabase } from '../lib/supabase'

export default function Auth() {
  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()

  async function handleGoogle() {
    setGoogleLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/'
      }
    })
    if (error) { setError('Erro ao entrar com Google'); setGoogleLoading(false) }
  }

  async function handleSubmit() {
    setError('')
    setLoading(true)
    if (mode === 'login') {
      const { error } = await signIn(email, password)
      if (error) setError('E-mail ou senha incorretos')
      else navigate('/')
    } else {
      if (!name.trim()) { setError('Digite seu nome'); setLoading(false); return }
      if (password.length < 6) { setError('Senha deve ter pelo menos 6 caracteres'); setLoading(false); return }
      const { error } = await signUp(email, password, name)
      if (error) setError(error.message)
      else setMode('verify')
    }
    setLoading(false)
  }

  if (mode === 'verify') return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>📬</div>
      <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 22, marginBottom: 8, textAlign: 'center' }}>Verifique seu e-mail</h2>
      <p style={{ color: 'var(--muted)', fontSize: 14, textAlign: 'center', lineHeight: 1.6 }}>
        Enviamos um link de confirmação para <strong style={{ color: 'var(--text)' }}>{email}</strong>.
      </p>
      <button onClick={() => setMode('login')} style={{ marginTop: 24, color: 'var(--gold)', background: 'none', border: 'none', fontSize: 14 }}>
        Voltar para o login
      </button>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', padding: '48px 24px 24px' }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: 28, color: 'var(--gold)', marginBottom: 4 }}>☕ Livro & Café</div>
        <p style={{ color: 'var(--muted)', fontSize: 13 }}>Sua biblioteca pessoal</p>
      </div>

      {/* Google Button */}
      <button onClick={handleGoogle} disabled={googleLoading} style={{
        width: '100%', background: '#fff', color: '#1a1a1a',
        border: 'none', borderRadius: 12, padding: '13px 0',
        fontWeight: 500, fontSize: 15, display: 'flex', alignItems: 'center',
        justifyContent: 'center', gap: 10, marginBottom: 16,
        opacity: googleLoading ? 0.7 : 1, cursor: googleLoading ? 'not-allowed' : 'pointer'
      }}>
        {googleLoading ? (
          <div style={{ width: 20, height: 20, border: '2px solid #ccc', borderTop: '2px solid #333', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
        )}
        {googleLoading ? 'Redirecionando...' : 'Entrar com Google'}
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        <span style={{ fontSize: 12, color: 'var(--dim)' }}>ou use e-mail</span>
        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
      </div>

      <div style={{ background: 'var(--surface)', border: '0.5px solid var(--border)', borderRadius: 16, padding: 24 }}>
        <div style={{ display: 'flex', background: 'var(--surface2)', borderRadius: 10, padding: 3, marginBottom: 20 }}>
          {['login', 'signup'].map(m => (
            <button key={m} onClick={() => { setMode(m); setError('') }} style={{
              flex: 1, padding: '8px 0', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 500,
              background: mode === m ? 'var(--gold)' : 'none',
              color: mode === m ? '#0f0e0c' : 'var(--muted)',
            }}>
              {m === 'login' ? 'Entrar' : 'Criar conta'}
            </button>
          ))}
        </div>

        {mode === 'signup' && (
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, color: 'var(--dim)', display: 'block', marginBottom: 6 }}>Nome</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Seu nome"
              style={{ width: '100%', background: 'var(--surface2)', border: '0.5px solid var(--border)', borderRadius: 10, padding: '11px 14px', color: 'var(--text)', fontSize: 14, outline: 'none', fontFamily: 'var(--font-sans)' }} />
          </div>
        )}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, color: 'var(--dim)', display: 'block', marginBottom: 6 }}>E-mail</label>
          <input value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" type="email"
            style={{ width: '100%', background: 'var(--surface2)', border: '0.5px solid var(--border)', borderRadius: 10, padding: '11px 14px', color: 'var(--text)', fontSize: 14, outline: 'none', fontFamily: 'var(--font-sans)' }} />
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 12, color: 'var(--dim)', display: 'block', marginBottom: 6 }}>Senha</label>
          <input value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" type="password"
            style={{ width: '100%', background: 'var(--surface2)', border: '0.5px solid var(--border)', borderRadius: 10, padding: '11px 14px', color: 'var(--text)', fontSize: 14, outline: 'none', fontFamily: 'var(--font-sans)' }} />
        </div>

        {error && (
          <div style={{ background: 'rgba(212,90,58,0.12)', border: '0.5px solid rgba(212,90,58,0.3)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#d45a3a', marginBottom: 16 }}>
            {error}
          </div>
        )}

        <button onClick={handleSubmit} disabled={loading} style={{
          width: '100%', background: 'var(--gold)', color: '#0f0e0c',
          border: 'none', borderRadius: 12, padding: '13px 0',
          fontWeight: 500, fontSize: 15, opacity: loading ? 0.7 : 1
        }}>
          {loading ? 'Aguarde...' : mode === 'login' ? 'Entrar' : 'Criar conta'}
        </button>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

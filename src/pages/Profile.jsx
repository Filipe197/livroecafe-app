import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'
import { useTheme } from '../hooks/useTheme.jsx'
import { useNotifications } from '../hooks/useNotifications.js'
import { useFavorites, useAllReadingProgress } from '../hooks/useFavorites'
import { BADGES, getBadgeStats } from '../data/badges'
import { useStreak } from '../hooks/useStreak'

const AVATARS = [
  { id: 'coffee', emoji: '☕', bg: '#e8c97a' },
  { id: 'book',   emoji: '📚', bg: '#7a9ee8' },
  { id: 'moon',   emoji: '🌙', bg: '#9e7ae8' },
  { id: 'sun',    emoji: '☀️', bg: '#e8a87a' },
  { id: 'cat',    emoji: '🐱', bg: '#e87a9e' },
  { id: 'owl',    emoji: '🦉', bg: '#7ae8c4' },
  { id: 'star',   emoji: '⭐', bg: '#e8e07a' },
  { id: 'fox',    emoji: '🦊', bg: '#e8987a' },
  { id: 'dragon', emoji: '🐉', bg: '#7ae87a' },
  { id: 'unicorn',emoji: '🦄', bg: '#e07ae8' },
  { id: 'robot',  emoji: '🤖', bg: '#7ac4e8' },
  { id: 'wizard', emoji: '🧙', bg: '#a87ae8' },
]

function BadgeCard({ badge, unlocked }) {
  return (
    <div style={{
      background: unlocked ? 'rgba(232,201,122,0.08)' : 'var(--surface)',
      border: `1px solid ${unlocked ? 'rgba(232,201,122,0.3)' : 'var(--border)'}`,
      borderRadius: 12, padding: '12px 10px', textAlign: 'center',
      opacity: unlocked ? 1 : 0.4, position: 'relative'
    }}>
      <div style={{ fontSize: 28, marginBottom: 6, filter: unlocked ? 'none' : 'grayscale(1)' }}>{badge.emoji}</div>
      <div style={{ fontFamily: 'var(--font-serif)', fontSize: 11, color: unlocked ? 'var(--gold)' : 'var(--muted)', lineHeight: 1.3, marginBottom: 4 }}>{badge.name}</div>
      <div style={{ fontSize: 10, color: 'var(--dim)', lineHeight: 1.3 }}>{badge.desc}</div>
      {unlocked && <div style={{ position: 'absolute', top: 6, right: 6, width: 8, height: 8, background: 'var(--gold)', borderRadius: '50%' }} />}
    </div>
  )
}

function Toggle({ value, onChange }) {
  return (
    <div onClick={() => onChange(!value)} style={{
      width: 42, height: 24, background: value ? 'var(--gold)' : 'var(--border)',
      borderRadius: 12, position: 'relative', cursor: 'pointer', flexShrink: 0,
      transition: 'background 0.2s'
    }}>
      <div style={{
        width: 18, height: 18, background: '#fff', borderRadius: '50%',
        position: 'absolute', top: 3,
        left: value ? 21 : 3,
        transition: 'left 0.2s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
      }} />
    </div>
  )
}

export default function Profile() {
  const { user, profile, signOut, updateProfile } = useAuth()
  const { theme, toggleTheme, isDark } = useTheme()
  const { permission, supported, requestPermission } = useNotifications(user?.id)
  const { favorites } = useFavorites()
  const { allProgress } = useAllReadingProgress()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState('')
  const [selectedAvatar, setSelectedAvatar] = useState(null)
  const [saving, setSaving] = useState(false)
  const [showAvatarPicker, setShowAvatarPicker] = useState(false)
  const [activeSettings, setActiveSettings] = useState(null)
  const [badgeTab, setBadgeTab] = useState('unlocked')
  const [notifEnabled, setNotifEnabled] = useState(permission === 'granted')
  const navigate = useNavigate()

  const { streak, todayRead } = useStreak()
  const booksRead = allProgress.filter(p => p.progress_percent === 100).length
  const reading = allProgress.filter(p => p.progress_percent > 0 && p.progress_percent < 100).length

  const stats = getBadgeStats(allProgress, favorites, user)
  const unlockedBadges = BADGES.filter(b => b.condition(stats))
  const lockedBadges = BADGES.filter(b => !b.condition(stats))

  const currentAvatar = AVATARS.find(a => a.id === (profile?.avatar_id || 'coffee')) || AVATARS[0]
  const displayName = profile?.name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Leitor'
  const avatarUrl = user?.user_metadata?.avatar_url

  async function handleToggleNotif(val) {
    if (val && permission !== 'granted') {
      const granted = await requestPermission()
      setNotifEnabled(granted)
    } else {
      setNotifEnabled(val)
    }
  }

  if (!user) return (
    <div className="fade-in" style={{ padding: 32, textAlign: 'center' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>👤</div>
      <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 20, marginBottom: 8 }}>Faça login para continuar</h2>
      <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 24 }}>Salve favoritos e acompanhe seu progresso</p>
      <button onClick={() => navigate('/auth')} style={{ background: 'var(--gold)', color: '#0f0e0c', border: 'none', borderRadius: 12, padding: '12px 32px', fontWeight: 500, fontSize: 14 }}>
        Entrar / Criar conta
      </button>
    </div>
  )

  async function saveProfile() {
    setSaving(true)
    const updates = {}
    if (name.trim()) updates.name = name.trim()
    if (selectedAvatar) updates.avatar_id = selectedAvatar
    await updateProfile(updates)
    setSaving(false); setEditing(false); setShowAvatarPicker(false); setSelectedAvatar(null)
  }

  const settingsItems = [
    {
      icon: '🔔', label: 'Notificações',
      content: (
        <div style={{ padding: '12px 0' }}>
          {supported ? (
            <>
              {permission === 'denied' && (
                <div style={{ background: 'rgba(212,90,58,0.1)', border: '0.5px solid rgba(212,90,58,0.3)', borderRadius: 8, padding: '10px 12px', fontSize: 12, color: '#d45a3a', marginBottom: 12 }}>
                  Notificações bloqueadas no navegador. Acesse as configurações do site para ativar.
                </div>
              )}
              {[
                { label: 'Novos livros adicionados', key: 'new_books' },
                { label: 'Lembretes de leitura diária', key: 'reminders' },
                { label: 'Promoções e ofertas', key: 'promo' },
              ].map(item => (
                <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '0.5px solid var(--border)' }}>
                  <span style={{ fontSize: 13, color: 'var(--text)' }}>{item.label}</span>
                  <Toggle
                    value={notifEnabled && permission === 'granted'}
                    onChange={(v) => handleToggleNotif(v)}
                  />
                </div>
              ))}
              {permission !== 'granted' && (
                <button onClick={requestPermission} style={{ marginTop: 12, width: '100%', background: 'var(--gold)', color: '#0f0e0c', border: 'none', borderRadius: 10, padding: '10px 0', fontSize: 13, fontWeight: 500 }}>
                  Ativar notificações
                </button>
              )}
            </>
          ) : (
            <div style={{ fontSize: 13, color: 'var(--dim)', padding: '8px 0' }}>Notificações não suportadas neste dispositivo.</div>
          )}
        </div>
      )
    },
    {
      icon: isDark ? '☀️' : '🌙', label: isDark ? 'Tema Claro' : 'Tema Escuro',
      content: (
        <div style={{ padding: '12px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0' }}>
            <span style={{ fontSize: 13, color: 'var(--text)' }}>{isDark ? 'Modo escuro ativo' : 'Modo claro ativo'}</span>
            <Toggle value={isDark} onChange={toggleTheme} />
          </div>
        </div>
      )
    },
    {
      icon: '💎', label: 'Assinatura',
      content: (
        <div style={{ padding: '12px 0' }}>
          <div style={{ background: 'rgba(232,201,122,0.1)', border: '0.5px solid rgba(232,201,122,0.3)', borderRadius: 10, padding: 14, marginBottom: 12 }}>
            <div style={{ fontSize: 13, color: 'var(--gold)', fontWeight: 500, marginBottom: 4 }}>♥ Plano Gratuito</div>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>Acesso limitado à biblioteca</div>
          </div>
          <button style={{ width: '100%', background: 'var(--gold)', color: '#0f0e0c', border: 'none', borderRadius: 10, padding: '12px 0', fontWeight: 500, fontSize: 14 }}>
            Assinar por R$ 14,99/mês
          </button>
        </div>
      )
    },
    {
      icon: '❓', label: 'Ajuda e suporte',
      content: (
        <div style={{ padding: '12px 0' }}>
          {[['📧 Contato', 'suporte@livroecafe.com.br'], ['🌐 Site', 'livroecafe.com.br'], ['📱 Versão', '1.1.0']].map(([l, v]) => (
            <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '0.5px solid var(--border)' }}>
              <span style={{ fontSize: 13, color: 'var(--text)' }}>{l}</span>
              <span style={{ fontSize: 12, color: 'var(--dim)' }}>{v}</span>
            </div>
          ))}
        </div>
      )
    },
  ]

  return (
    <div className="fade-in">
      <div style={{ padding: '20px 16px 0' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 22, color: 'var(--text)' }}>Meu Perfil</h1>
          {!editing
            ? <button onClick={() => { setEditing(true); setName(profile?.name || '') }} style={{ background: 'var(--surface)', border: '0.5px solid var(--border)', borderRadius: 16, padding: '6px 14px', color: 'var(--muted)', fontSize: 12 }}>✏️ Editar</button>
            : <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => { setEditing(false); setShowAvatarPicker(false); setSelectedAvatar(null) }} style={{ background: 'none', border: '0.5px solid var(--border)', borderRadius: 10, padding: '6px 12px', color: 'var(--muted)', fontSize: 12 }}>Cancelar</button>
                <button onClick={saveProfile} disabled={saving} style={{ background: 'var(--gold)', border: 'none', borderRadius: 10, padding: '6px 14px', color: '#0f0e0c', fontSize: 12, fontWeight: 500 }}>{saving ? '...' : 'Salvar'}</button>
              </div>
          }
        </div>

        {/* Avatar + Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
          <div style={{ position: 'relative' }}>
            {avatarUrl && !editing ? (
              <img src={avatarUrl} alt="Avatar" style={{ width: 68, height: 68, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--gold)' }} />
            ) : (
              <div onClick={() => editing && setShowAvatarPicker(p => !p)} style={{
                width: 68, height: 68, borderRadius: '50%',
                background: (AVATARS.find(a => a.id === (selectedAvatar || profile?.avatar_id)) || currentAvatar).bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 28, cursor: editing ? 'pointer' : 'default',
                border: editing ? '2px dashed var(--gold)' : 'none', flexShrink: 0
              }}>
                {(AVATARS.find(a => a.id === (selectedAvatar || profile?.avatar_id)) || currentAvatar).emoji}
              </div>
            )}
            {editing && <div style={{ position: 'absolute', bottom: 0, right: 0, background: 'var(--gold)', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11 }}>✏️</div>}
          </div>
          <div style={{ flex: 1 }}>
            {editing ? (
              <input value={name} onChange={e => setName(e.target.value)} placeholder={displayName}
                style={{ width: '100%', background: 'var(--surface2)', border: '0.5px solid var(--gold)', borderRadius: 8, padding: '8px 12px', color: 'var(--text)', fontSize: 15, outline: 'none', fontFamily: 'var(--font-sans)', marginBottom: 4 }} />
            ) : (
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 18, marginBottom: 2, color: 'var(--text)' }}>{displayName}</div>
            )}
            <div style={{ fontSize: 12, color: 'var(--dim)' }}>{user.email}</div>
            <div style={{ display: 'inline-block', marginTop: 6, background: 'rgba(232,201,122,0.12)', color: 'var(--gold)', fontSize: 11, padding: '2px 10px', borderRadius: 8, border: '0.5px solid rgba(232,201,122,0.3)' }}>♥ Membro</div>
          </div>
        </div>

        {showAvatarPicker && (
          <div style={{ background: 'var(--surface)', border: '0.5px solid var(--border)', borderRadius: 12, padding: 14, marginBottom: 16 }}>
            <p style={{ fontSize: 12, color: 'var(--dim)', marginBottom: 10 }}>Escolha seu avatar</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 8 }}>
              {AVATARS.map(av => (
                <div key={av.id} onClick={() => setSelectedAvatar(av.id)} style={{
                  width: '100%', aspectRatio: '1', borderRadius: '50%', background: av.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
                  cursor: 'pointer', border: selectedAvatar === av.id ? '2px solid var(--gold)' : '2px solid transparent',
                  transform: selectedAvatar === av.id ? 'scale(1.1)' : 'scale(1)', transition: 'all 0.15s'
                }}>{av.emoji}</div>
              ))}
            </div>
          </div>
        )}

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 20 }}>
          {[
            { label: 'Lidos', value: booksRead, icon: '✅' },
            { label: 'Lendo', value: reading, icon: '📖' },
            { label: 'Favoritos', value: favorites.length, icon: '❤️' }
          ].map(s => (
            <div key={s.label} style={{ background: 'var(--surface)', border: '0.5px solid var(--border)', borderRadius: 10, padding: '12px 8px', textAlign: 'center' }}>
              <div style={{ fontSize: 18, marginBottom: 2 }}>{s.icon}</div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 22, color: 'var(--gold)', marginBottom: 2 }}>{s.value}</div>
              <div style={{ fontSize: 11, color: 'var(--dim)' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Streak */}
        {streak > 0 && (
          <div style={{ marginBottom: 20, background: 'linear-gradient(135deg, rgba(212,90,58,0.15), rgba(232,150,50,0.15))', border: '0.5px solid rgba(212,90,58,0.3)', borderRadius: 12, padding: 14, display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ fontSize: 40 }}>🔥</div>
            <div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 22, color: '#e8a050', fontWeight: 700 }}>{streak} {streak === 1 ? 'dia' : 'dias'} seguidos!</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{todayRead ? '✅ Você já leu hoje' : '📖 Leia hoje para manter o streak!'}</div>
            </div>
          </div>
        )}

        {/* Badges */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <p className="section-label" style={{ padding: 0, margin: 0 }}>🏅 Conquistas</p>
            <div style={{ display: 'flex', gap: 6 }}>
              {['unlocked', 'all'].map(t => (
                <button key={t} onClick={() => setBadgeTab(t)} style={{
                  fontSize: 11, padding: '3px 10px', borderRadius: 8, border: 'none', cursor: 'pointer',
                  background: badgeTab === t ? 'var(--gold)' : 'var(--surface)',
                  color: badgeTab === t ? '#0f0e0c' : 'var(--dim)', fontFamily: 'var(--font-sans)'
                }}>{t === 'unlocked' ? `Desbloqueadas (${unlockedBadges.length})` : `Todas (${BADGES.length})`}</button>
              ))}
            </div>
          </div>
          {badgeTab === 'unlocked' && unlockedBadges.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--dim)', fontSize: 13 }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🏅</div>
              Nenhuma conquista ainda — continue lendo!
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
              {(badgeTab === 'unlocked' ? unlockedBadges : BADGES).map(badge => (
                <BadgeCard key={badge.id} badge={badge} unlocked={unlockedBadges.some(b => b.id === badge.id)} />
              ))}
            </div>
          )}
        </div>

        {/* Em andamento */}
        {allProgress.filter(p => p.progress_percent < 100 && p.progress_percent > 0).length > 0 && (
          <>
            <p className="section-label" style={{ padding: 0, margin: '0 0 10px' }}>Em andamento</p>
            <div style={{ marginBottom: 16 }}>
              {allProgress.filter(p => p.progress_percent < 100 && p.progress_percent > 0).slice(0, 3).map(p => (
                <div key={p.id} onClick={() => navigate(`/read/${p.book_id}`)} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--surface)', border: '0.5px solid var(--border)', borderRadius: 10, padding: 10, marginBottom: 8, cursor: 'pointer' }}>
                  <img src={p.books?.cover_url} alt={p.books?.title} style={{ width: 40, height: 56, borderRadius: 4, objectFit: 'cover', flexShrink: 0 }} onError={e => { e.target.src = 'https://placehold.co/40x56/1a1916/e8c97a?text=📖' }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: 'var(--font-serif)', fontSize: 12, marginBottom: 5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text)' }}>{p.books?.title}</div>
                    <div style={{ height: 3, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ width: `${p.progress_percent}%`, height: '100%', background: 'var(--gold)', borderRadius: 2 }} />
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--dim)', marginTop: 3 }}>{p.progress_percent}% concluído</div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Favoritos */}
        {favorites.length > 0 && (
          <>
            <p className="section-label" style={{ padding: 0, margin: '0 0 10px' }}>Favoritos</p>
            <div style={{ display: 'flex', gap: 10, overflowX: 'auto', scrollbarWidth: 'none', marginBottom: 20 }}>
              {favorites.map(f => (
                <div key={f.id} onClick={() => navigate(`/book/${f.book_id}`)} style={{ flex: '0 0 68px', cursor: 'pointer' }}>
                  <img src={f.books?.cover_url} alt={f.books?.title} style={{ width: 68, height: 98, objectFit: 'cover', borderRadius: 6 }} onError={e => { e.target.src = 'https://placehold.co/68x98/1a1916/e8c97a?text=📖' }} />
                </div>
              ))}
            </div>
          </>
        )}

        {/* Configurações */}
        <p className="section-label" style={{ padding: 0, margin: '0 0 10px' }}>Configurações</p>
        {settingsItems.map(item => (
          <div key={item.label}>
            <div onClick={() => setActiveSettings(activeSettings === item.label ? null : item.label)}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 0', borderBottom: '0.5px solid var(--border)', cursor: 'pointer' }}>
              <span style={{ fontSize: 18 }}>{item.icon}</span>
              <span style={{ flex: 1, fontSize: 14, color: 'var(--text)' }}>{item.label}</span>
              <span style={{ color: 'var(--dim)', fontSize: 18, display: 'inline-block', transform: activeSettings === item.label ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }}>›</span>
            </div>
            {activeSettings === item.label && <div style={{ paddingLeft: 30 }}>{item.content}</div>}
          </div>
        ))}

        <button onClick={signOut} style={{ width: '100%', marginTop: 24, marginBottom: 32, padding: '13px 0', background: 'none', border: '0.5px solid var(--border)', borderRadius: 10, color: '#c0564a', fontSize: 14 }}>
          Sair da conta
        </button>
      </div>
    </div>
  )
}

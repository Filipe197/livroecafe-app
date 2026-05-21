import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '../hooks/useAuth.jsx'
import { useNavigate, useParams, Routes, Route } from 'react-router-dom'
import { supabase } from '../lib/supabase'

function Spinner() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}>
      <div style={{ width: 28, height: 28, border: '2px solid var(--border)', borderTop: '2px solid var(--gold)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

const AVATARS = { coffee:'☕',book:'📚',moon:'🌙',sun:'☀️',cat:'🐱',owl:'🦉',star:'⭐',fox:'🦊',dragon:'🐉',unicorn:'🦄',robot:'🤖',wizard:'🧙' }

export function ClubChat({ clubId, clubName, onBack }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [messages, setMessages] = useState([])
  const [profiles, setProfiles] = useState({})
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const bottomRef = useRef(null)
  const channelRef = useRef(null)
  const inputRef = useRef(null)

  const fetchMessages = useCallback(async () => {
    const { data, error } = await supabase
      .from('club_messages')
      .select('id, message, created_at, user_id')
      .eq('club_id', clubId)
      .order('created_at', { ascending: true })
      .limit(100)
    if (!error && data) {
      setMessages(data)
      const uniqueIds = [...new Set(data.map(m => m.user_id))]
      const profileMap = {}
      for (const uid of uniqueIds) {
        const { data: p } = await supabase.from('profiles').select('name, avatar_id').eq('id', uid).single()
        if (p) profileMap[uid] = p
      }
      setProfiles(profileMap)
    }
    setLoading(false)
  }, [clubId])

  useEffect(() => {
    fetchMessages()
    channelRef.current = supabase
      .channel(`club-${clubId}-${Date.now()}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'club_messages', filter: `club_id=eq.${clubId}` },
        async (payload) => {
          const newMsg = payload.new
          setMessages(prev => prev.find(m => m.id === newMsg.id) ? prev : [...prev, newMsg])
          const { data: p } = await supabase.from('profiles').select('name, avatar_id').eq('id', newMsg.user_id).single()
          if (p) setProfiles(prev => ({ ...prev, [newMsg.user_id]: p }))
        })
      .subscribe()
    return () => { if (channelRef.current) supabase.removeChannel(channelRef.current) }
  }, [clubId, fetchMessages])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  async function send() {
    if (!text.trim() || !user || sending) return
    setSending(true)
    const msgText = text.trim()
    setText('')
    const { error } = await supabase.from('club_messages').insert({ club_id: clubId, user_id: user.id, message: msgText })
    if (error) setText(msgText)
    setSending(false)
    inputRef.current?.focus()
  }

  function formatTime(ts) {
    const d = new Date(ts)
    const isToday = d.toDateString() === new Date().toDateString()
    if (isToday) return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100svh', background: 'var(--bg)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: '0.5px solid var(--border)', background: 'var(--bg)', flexShrink: 0 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: 22, cursor: 'pointer', padding: 0 }}>‹</button>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 15, color: 'var(--text)' }}>{clubName}</div>
          <div style={{ fontSize: 11, color: 'var(--dim)' }}>Clube do livro · {messages.length} mensagens</div>
        </div>
        <button onClick={fetchMessages} style={{ background: 'none', border: 'none', color: 'var(--dim)', fontSize: 16, cursor: 'pointer' }}>↻</button>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10, minHeight: 0 }}>
        {loading ? <Spinner /> : messages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--dim)', fontSize: 13 }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>💬</div>
            Nenhuma mensagem ainda. Seja o primeiro!
          </div>
        ) : messages.map(msg => {
          const isMe = msg.user_id === user?.id
          const profile = profiles[msg.user_id]
          const avatar = AVATARS[profile?.avatar_id] || '👤'
          const name = profile?.name || 'Leitor'
          return (
            <div key={msg.id} style={{ display: 'flex', gap: 8, flexDirection: isMe ? 'row-reverse' : 'row', alignItems: 'flex-end' }}>
              {!isMe && <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0 }}>{avatar}</div>}
              <div style={{ maxWidth: '75%' }}>
                {!isMe && <div style={{ fontSize: 10, color: 'var(--dim)', marginBottom: 3, paddingLeft: 4 }}>{name}</div>}
                <div style={{ background: isMe ? 'var(--gold)' : 'var(--surface)', color: isMe ? '#0f0e0c' : 'var(--text)', borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px', padding: '8px 12px', fontSize: 14, lineHeight: 1.5, border: isMe ? 'none' : '0.5px solid var(--border)' }}>{msg.message}</div>
                <div style={{ fontSize: 10, color: 'var(--dim)', marginTop: 2, textAlign: isMe ? 'right' : 'left', paddingLeft: 4 }}>{formatTime(msg.created_at)}</div>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      {user ? (
        <div style={{ padding: '10px 16px', borderTop: '0.5px solid var(--border)', display: 'flex', gap: 8, alignItems: 'center', background: 'var(--bg)', flexShrink: 0 }}>
          <input
            ref={inputRef}
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
            placeholder="Digite uma mensagem..."
            style={{ flex: 1, background: 'var(--surface)', border: '0.5px solid var(--border)', borderRadius: 20, padding: '10px 14px', color: 'var(--text)', fontSize: 14, outline: 'none', fontFamily: 'var(--font-sans)' }}
          />
          <button onClick={send} disabled={!text.trim() || sending} style={{ width: 40, height: 40, background: text.trim() ? 'var(--gold)' : 'var(--surface)', border: 'none', borderRadius: '50%', cursor: text.trim() ? 'pointer' : 'not-allowed', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: text.trim() ? '#0f0e0c' : 'var(--dim)' }}>➤</button>
        </div>
      ) : (
        <div style={{ padding: '12px 16px', borderTop: '0.5px solid var(--border)', textAlign: 'center', fontSize: 13, color: 'var(--dim)' }}>Faça login para participar</div>
      )}
    </div>
  )
}

export default function Clubs() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [clubs, setClubs] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeClub, setActiveClub] = useState(null)
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [creating, setCreating] = useState(false)
  const [myClubs, setMyClubs] = useState([])

  const fetchClubs = useCallback(async () => {
    const { data } = await supabase.from('book_clubs').select('*').eq('is_public', true).order('created_at', { ascending: false })
    setClubs(data || [])
    if (user) {
      const { data: mine } = await supabase.from('club_members').select('club_id').eq('user_id', user.id)
      setMyClubs((mine || []).map(m => m.club_id))
    }
    setLoading(false)
  }, [user])

  useEffect(() => { fetchClubs() }, [fetchClubs])

  async function joinClub(clubId) {
    if (!user) { navigate('/auth'); return }
    await supabase.from('club_members').insert({ club_id: clubId, user_id: user.id })
    setMyClubs(prev => [...prev, clubId])
  }

  async function leaveClub(clubId) {
    await supabase.from('club_members').delete().eq('club_id', clubId).eq('user_id', user.id)
    setMyClubs(prev => prev.filter(id => id !== clubId))
  }

  async function createClub() {
    if (!newName.trim() || !user) return
    setCreating(true)
    const { data } = await supabase.from('book_clubs').insert({ name: newName.trim(), description: newDesc.trim(), created_by: user.id }).select().single()
    if (data) {
      await supabase.from('club_members').insert({ club_id: data.id, user_id: user.id })
      setMyClubs(prev => [...prev, data.id])
      setNewName(''); setNewDesc(''); setShowCreate(false)
      fetchClubs()
    }
    setCreating(false)
  }

  // Se clube ativo, mostra o chat inline mas sobre a nav
  if (activeClub) {
    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'var(--bg)', maxWidth: 480, margin: '0 auto', left: '50%', transform: 'translateX(-50%)', width: '100%' }}>
        <ClubChat clubId={activeClub.id} clubName={activeClub.name} onBack={() => setActiveClub(null)} />
        {/* Override back button */}
        <style>{`.club-back-override { display: none }`}</style>
      </div>
    )
  }

  return (
    <div className="fade-in">
      <div style={{ padding: '20px 16px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 22, marginBottom: 4, color: 'var(--text)' }}>Clube do Livro</h1>
          <p style={{ fontSize: 13, color: 'var(--dim)' }}>Leia e discuta com outros leitores</p>
        </div>
        {user && <button onClick={() => setShowCreate(true)} style={{ background: 'var(--gold)', color: '#0f0e0c', border: 'none', borderRadius: 12, padding: '8px 14px', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>+ Criar</button>}
      </div>

      {showCreate && (
        <div style={{ margin: '0 16px 16px', background: 'var(--surface)', border: '0.5px solid var(--gold)', borderRadius: 12, padding: 16 }}>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 16, marginBottom: 12, color: 'var(--text)' }}>Novo Clube</div>
          <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Nome do clube..." style={{ width: '100%', background: 'var(--surface2)', border: '0.5px solid var(--border)', borderRadius: 8, padding: '10px 12px', color: 'var(--text)', fontSize: 14, outline: 'none', fontFamily: 'var(--font-sans)', marginBottom: 8, boxSizing: 'border-box' }} />
          <textarea value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Descrição (opcional)..." rows={2} style={{ width: '100%', background: 'var(--surface2)', border: '0.5px solid var(--border)', borderRadius: 8, padding: '10px 12px', color: 'var(--text)', fontSize: 14, outline: 'none', fontFamily: 'var(--font-sans)', marginBottom: 10, resize: 'none', boxSizing: 'border-box' }} />
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={createClub} disabled={!newName.trim() || creating} style={{ flex: 1, background: 'var(--gold)', color: '#0f0e0c', border: 'none', borderRadius: 8, padding: '10px 0', fontWeight: 500, fontSize: 13, cursor: 'pointer' }}>{creating ? 'Criando...' : 'Criar clube'}</button>
            <button onClick={() => setShowCreate(false)} style={{ flex: 1, background: 'var(--surface2)', color: 'var(--muted)', border: '0.5px solid var(--border)', borderRadius: 8, padding: '10px 0', fontSize: 13, cursor: 'pointer' }}>Cancelar</button>
          </div>
        </div>
      )}

      {loading ? <Spinner /> : clubs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--dim)' }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>📚</div>
          <div style={{ fontSize: 14, marginBottom: 6 }}>Nenhum clube ainda</div>
          <div style={{ fontSize: 12 }}>Seja o primeiro a criar um!</div>
        </div>
      ) : (
        <div style={{ padding: '0 16px 8px' }}>
          {clubs.map(club => {
            const isMember = myClubs.includes(club.id)
            return (
              <div key={club.id} style={{ background: 'var(--surface)', border: `0.5px solid ${isMember ? 'var(--gold)' : 'var(--border)'}`, borderRadius: 12, padding: 14, marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(232,201,122,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>📖</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'var(--font-serif)', fontSize: 15, marginBottom: 3, display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text)' }}>
                      {club.name}
                      {isMember && <span style={{ fontSize: 9, background: 'rgba(232,201,122,0.15)', color: 'var(--gold)', padding: '1px 6px', borderRadius: 6, fontFamily: 'var(--font-sans)' }}>MEMBRO</span>}
                    </div>
                    {club.description && <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.4 }}>{club.description}</div>}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => setActiveClub(club)} style={{ flex: 1, background: 'var(--surface2)', color: 'var(--text)', border: '0.5px solid var(--border)', borderRadius: 8, padding: '9px 0', fontSize: 13, cursor: 'pointer' }}>💬 Chat</button>
                  {isMember
                    ? <button onClick={() => leaveClub(club.id)} style={{ flex: 1, background: 'rgba(200,50,50,0.1)', color: '#ff6060', border: '0.5px solid rgba(200,50,50,0.2)', borderRadius: 8, padding: '9px 0', fontSize: 13, cursor: 'pointer' }}>Sair</button>
                    : <button onClick={() => joinClub(club.id)} style={{ flex: 1, background: 'var(--gold)', color: '#0f0e0c', border: 'none', borderRadius: 8, padding: '9px 0', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Participar</button>
                  }
                </div>
              </div>
            )
          })}
        </div>
      )}
      <div style={{ height: 80 }} />
    </div>
  )
}

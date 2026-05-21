import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth.jsx'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const AVATARS = { coffee:'☕',book:'📚',moon:'🌙',sun:'☀️',cat:'🐱',owl:'🦉',star:'⭐',fox:'🦊',dragon:'🐉',unicorn:'🦄',robot:'🤖',wizard:'🧙' }
const MEDAL = ['🥇','🥈','🥉']

function Spinner() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}>
      <div style={{ width: 28, height: 28, border: '2px solid var(--border)', borderTop: '2px solid var(--gold)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

export default function Ranking() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [ranking, setRanking] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchRanking() }, [])

  async function fetchRanking() {
    setLoading(true)
    const { data } = await supabase
      .from('monthly_ranking')
      .select('id,name,avatar_id,total_books')
      .order('total_books', { ascending: false })
    setRanking(data || [])
    setLoading(false)
  }

  const month = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

  return (
    <div className="fade-in">
      <div style={{ padding: '20px 16px 10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: 22, cursor: 'pointer', padding: 0 }}>‹</button>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 22, color: 'var(--text)' }}>🏆 Ranking</h1>
        </div>
        <p style={{ fontSize: 13, color: 'var(--dim)', marginBottom: 16 }}>Leitores mais ativos de {month}</p>

        {/* Top 3 pódio */}
        {!loading && ranking.length >= 1 && (
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 12, marginBottom: 24 }}>
            {[ranking[1], ranking[0], ranking[2]].map((reader, i) => {
              if (!reader) return <div key={i} style={{ flex: 1 }} />
              const podiumPos = i === 0 ? 2 : i === 1 ? 1 : 3
              const heights = { 1: 100, 2: 80, 3: 65 }
              const colors = { 1: 'var(--gold)', 2: '#aaa', 3: '#c8873a' }
              const isMe = reader.id === user?.id
              return (
                <div key={reader.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: podiumPos === 1 ? 1.2 : 1 }}>
                  <div style={{ fontSize: podiumPos === 1 ? 32 : 26, marginBottom: 4 }}>{AVATARS[reader.avatar_id] || '👤'}</div>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: podiumPos === 1 ? 14 : 12, marginBottom: 4, textAlign: 'center', color: isMe ? 'var(--gold)' : 'var(--text)' }}>
                    {reader.name || 'Leitor'}
                  </div>
                  <div style={{ background: colors[podiumPos], borderRadius: '8px 8px 0 0', width: '100%', height: heights[podiumPos], display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#0f0e0c' }}>
                    <div style={{ fontSize: 20 }}>{MEDAL[podiumPos - 1]}</div>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{reader.total_books}</div>
                    <div style={{ fontSize: 10 }}>livro{reader.total_books !== 1 ? 's' : ''}</div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {loading ? <Spinner /> : ranking.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--dim)' }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>📚</div>
            <div style={{ fontSize: 14 }}>Nenhuma leitura registrada ainda</div>
            <div style={{ fontSize: 12, marginTop: 6 }}>Complete um livro para aparecer no ranking!</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {ranking.map((reader, i) => {
              const isMe = reader.id === user?.id
              return (
                <div key={reader.id} style={{ display: 'flex', alignItems: 'center', gap: 12, background: isMe ? 'rgba(232,201,122,0.08)' : 'var(--surface)', border: `0.5px solid ${isMe ? 'var(--gold)' : 'var(--border)'}`, borderRadius: 10, padding: '12px 14px' }}>
                  <div style={{ width: 28, textAlign: 'center', fontSize: i < 3 ? 20 : 14, color: i < 3 ? 'inherit' : 'var(--dim)', fontWeight: 700, flexShrink: 0 }}>
                    {i < 3 ? MEDAL[i] : `${i + 1}º`}
                  </div>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                    {AVATARS[reader.avatar_id] || '👤'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: 'var(--font-serif)', fontSize: 14, color: isMe ? 'var(--gold)' : 'var(--text)', display: 'flex', alignItems: 'center', gap: 6 }}>
                      {reader.name || 'Leitor'}
                      {isMe && <span style={{ fontSize: 10, background: 'rgba(232,201,122,0.15)', color: 'var(--gold)', padding: '1px 6px', borderRadius: 6, fontFamily: 'var(--font-sans)' }}>VOCÊ</span>}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontFamily: 'var(--font-serif)', fontSize: 18, color: 'var(--gold)', fontWeight: 700 }}>{reader.total_books}</div>
                    <div style={{ fontSize: 10, color: 'var(--dim)' }}>livro{reader.total_books !== 1 ? 's' : ''}</div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {!user && (
          <div style={{ marginTop: 16, background: 'rgba(232,201,122,0.06)', border: '0.5px solid rgba(232,201,122,0.2)', borderRadius: 10, padding: 14, textAlign: 'center' }}>
            <div style={{ fontSize: 13, color: 'var(--muted)' }}>Faça login para aparecer no ranking</div>
          </div>
        )}
      </div>
    </div>
  )
}
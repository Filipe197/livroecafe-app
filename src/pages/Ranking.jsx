import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth.jsx'
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
  const [ranking, setRanking] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('month')

  useEffect(() => { fetchRanking() }, [tab])

  async function fetchRanking() {
    setLoading(true)
    try {
      const { data } = await supabase.from('monthly_ranking').select('*')
      setRanking(data || [])
    } catch {
      // fallback: build manually
      const { data: progress } = await supabase.from('reading_progress').select('user_id, progress_percent, last_read, books(genre)').eq('progress_percent', 100)
      const now = new Date()
      const thisMonth = (progress || []).filter(p => {
        const d = new Date(p.last_read)
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      })
      const counts = {}
      thisMonth.forEach(p => { counts[p.user_id] = (counts[p.user_id] || 0) + 1 })
      const { data: profiles } = await supabase.from('profiles').select('id, name, avatar_id')
      const result = (profiles || []).map(p => ({ ...p, books_this_month: counts[p.id] || 0 }))
        .sort((a, b) => b.books_this_month - a.books_this_month).slice(0, 20)
      setRanking(result)
    }
    setLoading(false)
  }

  const month = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

  return (
    <div className="fade-in">
      <div style={{ padding: '20px 16px 10px' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 22, marginBottom: 4 }}>🏆 Ranking</h1>
        <p style={{ fontSize: 13, color: 'var(--dim)', marginBottom: 16 }}>Leitores mais ativos de {month}</p>

        {/* Top 3 */}
        {!loading && ranking.length >= 3 && (
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 12, marginBottom: 24 }}>
            {[ranking[1], ranking[0], ranking[2]].map((reader, i) => {
              if (!reader) return null
              const podiumPos = i === 0 ? 2 : i === 1 ? 1 : 3
              const heights = { 1: 100, 2: 80, 3: 65 }
              const isMe = reader.id === user?.id
              return (
                <div key={reader.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: podiumPos === 1 ? 1.2 : 1 }}>
                  <div style={{ fontSize: podiumPos === 1 ? 32 : 26, marginBottom: 4 }}>{AVATARS[reader.avatar_id] || '👤'}</div>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: podiumPos === 1 ? 14 : 12, marginBottom: 4, textAlign: 'center', color: isMe ? 'var(--gold)' : 'var(--text)' }}>
                    {reader.name || 'Leitor'}
                  </div>
                  <div style={{ background: podiumPos === 1 ? 'var(--gold)' : podiumPos === 2 ? '#aaa' : '#c8873a', borderRadius: '8px 8px 0 0', width: '100%', height: heights[podiumPos], display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#0f0e0c' }}>
                    <div style={{ fontSize: 20 }}>{MEDAL[podiumPos - 1]}</div>
                    <div style={{ fontSize: 11, fontWeight: 700 }}>{reader.books_this_month} livros</div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {loading ? <Spinner /> : ranking.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--dim)' }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>📚</div>
            <div style={{ fontSize: 14 }}>Nenhuma leitura registrada este mês ainda</div>
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
                    <div style={{ fontFamily: 'var(--font-serif)', fontSize: 18, color: 'var(--gold)', fontWeight: 700 }}>{reader.books_this_month}</div>
                    <div style={{ fontSize: 10, color: 'var(--dim)' }}>livro{reader.books_this_month !== 1 ? 's' : ''}</div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {!user && (
          <div style={{ marginTop: 16, background: 'rgba(232,201,122,0.06)', border: '0.5px solid rgba(232,201,122,0.2)', borderRadius: 10, padding: 14, textAlign: 'center' }}>
            <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 8 }}>Faça login para aparecer no ranking</div>
          </div>
        )}
      </div>
    </div>
  )
}

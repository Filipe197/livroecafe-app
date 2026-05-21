import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth.jsx'

export default function ReadingCalendar() {
  const { user } = useAuth()
  const [readDays, setReadDays] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const today = new Date()

  useEffect(() => {
    if (!user) return
    async function fetch() {
      // Usa last_read igual ao useStreak
      const { data } = await supabase
        .from('reading_progress')
        .select('last_read')
        .eq('user_id', user.id)
        .not('last_read', 'is', null)

      if (data) {
        const days = new Set(data.map(r => new Date(r.last_read).toDateString()))
        setReadDays(days)
      }
      setLoading(false)
    }
    fetch()
  }, [user])

  // Gera os últimos 35 dias (5 semanas completas)
  const days = []
  for (let i = 34; i >= 0; i--) {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    d.setDate(today.getDate() - i)
    days.push(d)
  }

  const weekLabels = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']
  const totalRead = [...readDays].filter(d => {
    const date = new Date(d)
    return date >= new Date(today.getFullYear(), today.getMonth() - 1, today.getDate())
  }).length

  if (loading) return null

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <p className="section-label" style={{ padding: 0, margin: 0 }}>📅 Histórico de Leitura</p>
        <span style={{ fontSize: 11, color: 'var(--dim)' }}>{totalRead} dias este mês</span>
      </div>

      {/* Dias da semana */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 4 }}>
        {weekLabels.map((l, i) => (
          <div key={i} style={{ textAlign: 'center', fontSize: 9, color: 'var(--dim)', fontWeight: 600 }}>{l}</div>
        ))}
      </div>

      {/* Calendário alinhado ao dia da semana */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
        {Array.from({ length: days[0].getDay() }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {days.map((d, i) => {
          const isRead = readDays.has(d.toDateString())
          const isToday = d.toDateString() === today.toDateString()
          return (
            <div key={i} title={d.toLocaleDateString('pt-BR')} style={{
              aspectRatio: '1',
              borderRadius: 6,
              background: isRead ? 'var(--gold)' : 'var(--surface)',
              border: isToday ? '2px solid var(--gold)' : '1px solid var(--border)',
              opacity: isRead ? 1 : 0.5,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 9, color: isRead ? '#0f0e0c' : 'var(--dim)',
              fontWeight: isRead ? 700 : 400,
            }}>
              {d.getDate()}
            </div>
          )
        })}
      </div>

      <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
        <div style={{ fontSize: 11, color: 'var(--dim)', display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ width: 10, height: 10, background: 'var(--gold)', borderRadius: 2 }} />
          Dia lido
        </div>
        <div style={{ fontSize: 11, color: 'var(--dim)', display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ width: 10, height: 10, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 2 }} />
          Sem leitura
        </div>
      </div>
    </div>
  )
}

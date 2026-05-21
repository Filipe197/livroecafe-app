import { useState, useEffect } from 'react'

const GOALS = [5, 10, 20, 30, 60]

export default function DailyGoal({ minutesRead = 0 }) {
  const [goal, setGoal] = useState(() => parseInt(localStorage.getItem('lc_daily_goal') || '20'))
  const [showPicker, setShowPicker] = useState(false)

  function setNewGoal(g) {
    setGoal(g)
    localStorage.setItem('lc_daily_goal', String(g))
    setShowPicker(false)
  }

  const percent = Math.min(100, Math.round((minutesRead / goal) * 100))
  const done = percent >= 100

  return (
    <div style={{ marginBottom: 20, background: 'var(--surface)', border: `0.5px solid ${done ? 'rgba(232,201,122,0.4)' : 'var(--border)'}`, borderRadius: 12, padding: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 20 }}>{done ? '🏆' : '📖'}</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>Meta diária</div>
            <div style={{ fontSize: 11, color: 'var(--dim)' }}>{minutesRead} / {goal} minutos</div>
          </div>
        </div>
        <button onClick={() => setShowPicker(p => !p)} style={{ background: 'var(--surface2)', border: '0.5px solid var(--border)', borderRadius: 8, padding: '4px 10px', fontSize: 11, color: 'var(--muted)', cursor: 'pointer' }}>
          {goal} min ✏️
        </button>
      </div>

      {/* Barra de progresso */}
      <div style={{ height: 8, background: 'var(--border)', borderRadius: 4, overflow: 'hidden', marginBottom: 6 }}>
        <div style={{
          width: `${percent}%`, height: '100%',
          background: done ? 'var(--gold)' : 'linear-gradient(90deg, var(--gold) 0%, #f0a050 100%)',
          borderRadius: 4, transition: 'width 0.5s ease'
        }} />
      </div>
      <div style={{ fontSize: 11, color: done ? 'var(--gold)' : 'var(--dim)', textAlign: 'right' }}>
        {done ? '✅ Meta atingida hoje!' : `${percent}% concluído`}
      </div>

      {showPicker && (
        <div style={{ marginTop: 12, borderTop: '0.5px solid var(--border)', paddingTop: 12 }}>
          <div style={{ fontSize: 12, color: 'var(--dim)', marginBottom: 8 }}>Escolha sua meta diária:</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {GOALS.map(g => (
              <button key={g} onClick={() => setNewGoal(g)} style={{
                padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
                background: goal === g ? 'var(--gold)' : 'var(--surface2)',
                color: goal === g ? '#0f0e0c' : 'var(--muted)',
                fontSize: 13, fontFamily: 'inherit', fontWeight: goal === g ? 600 : 400
              }}>{g} min</button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

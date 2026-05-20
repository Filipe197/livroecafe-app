import { useState } from 'react'

const GENRES = [
  { id: 'Romance', emoji: '💕', label: 'Romance' },
  { id: 'Thriller', emoji: '🔪', label: 'Thriller' },
  { id: 'Fantasia', emoji: '🧙', label: 'Fantasia' },
  { id: 'Ficção Científica', emoji: '🚀', label: 'Ficção Cient.' },
  { id: 'Clássico', emoji: '📜', label: 'Clássico' },
  { id: 'Não-ficção', emoji: '🧠', label: 'Não-ficção' },
  { id: 'Suspense e Mistério', emoji: '🕵️', label: 'Suspense' },
  { id: 'Infantil', emoji: '🌈', label: 'Infantil' },
  { id: 'Ficção', emoji: '✨', label: 'Ficção' },
]

const STEPS = [
  {
    id: 'welcome',
    render: ({ onNext }) => (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '40px 32px', textAlign: 'center' }}>
        <div style={{
          width: 100, height: 100, borderRadius: 28, background: 'var(--gold)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 50, marginBottom: 28, boxShadow: '0 0 60px rgba(232,201,122,0.25)'
        }}>☕</div>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, marginBottom: 12, lineHeight: 1.2 }}>
          Bem-vindo ao<br />Livro & Café
        </h1>
        <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.7, marginBottom: 40 }}>
          Sua biblioteca pessoal com curadoria especial. Leia quando e onde quiser.
        </p>
        <button onClick={onNext} style={{ width: '100%', background: 'var(--gold)', color: '#0f0e0c', border: 'none', borderRadius: 14, padding: '15px 0', fontWeight: 500, fontSize: 16 }}>
          Começar →
        </button>
      </div>
    )
  },
  {
    id: 'genres',
    render: ({ selected, onToggle, onNext }) => (
      <div style={{ padding: '48px 24px 32px', display: 'flex', flexDirection: 'column', height: '100%' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 24, marginBottom: 8, lineHeight: 1.3 }}>
          O que você gosta de ler?
        </h2>
        <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 28 }}>
          Selecione seus gêneros favoritos para receber recomendações personalizadas
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, flex: 1 }}>
          {GENRES.map(g => {
            const sel = selected.includes(g.id)
            return (
              <button key={g.id} onClick={() => onToggle(g.id)} style={{
                background: sel ? 'rgba(232,201,122,0.15)' : 'var(--surface)',
                border: `1.5px solid ${sel ? 'var(--gold)' : 'var(--border)'}`,
                borderRadius: 12, padding: '14px 8px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                cursor: 'pointer', transition: 'all 0.18s',
                transform: sel ? 'scale(1.04)' : 'scale(1)'
              }}>
                <span style={{ fontSize: 28 }}>{g.emoji}</span>
                <span style={{ fontSize: 11, color: sel ? 'var(--gold)' : 'var(--muted)', fontWeight: sel ? 500 : 400 }}>{g.label}</span>
              </button>
            )
          })}
        </div>
        <button
          onClick={onNext}
          disabled={selected.length === 0}
          style={{ width: '100%', marginTop: 24, background: selected.length > 0 ? 'var(--gold)' : 'var(--surface)', color: selected.length > 0 ? '#0f0e0c' : 'var(--dim)', border: 'none', borderRadius: 14, padding: '14px 0', fontWeight: 500, fontSize: 15, transition: 'all 0.2s' }}>
          {selected.length === 0 ? 'Selecione pelo menos 1' : `Continuar com ${selected.length} gênero${selected.length > 1 ? 's' : ''} →`}
        </button>
      </div>
    )
  },
  {
    id: 'goal',
    render: ({ goal, onGoal, onNext }) => (
      <div style={{ padding: '48px 24px 32px', display: 'flex', flexDirection: 'column', height: '100%' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 24, marginBottom: 8 }}>Sua meta de leitura</h2>
        <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 28 }}>Quantos livros quer ler por mês?</p>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { val: 1, label: '1 livro', desc: 'Um bom começo 🌱' },
            { val: 2, label: '2 livros', desc: 'Ritmo constante 📚' },
            { val: 4, label: '4 livros', desc: 'Leitor dedicado ⭐' },
            { val: 8, label: '8+ livros', desc: 'Leitor voraz 🔥' },
          ].map(opt => (
            <button key={opt.val} onClick={() => onGoal(opt.val)} style={{
              background: goal === opt.val ? 'rgba(232,201,122,0.12)' : 'var(--surface)',
              border: `1.5px solid ${goal === opt.val ? 'var(--gold)' : 'var(--border)'}`,
              borderRadius: 12, padding: '14px 16px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              cursor: 'pointer', transition: 'all 0.18s'
            }}>
              <span style={{ fontFamily: 'var(--font-serif)', fontSize: 16, color: goal === opt.val ? 'var(--gold)' : 'var(--text)' }}>{opt.label}</span>
              <span style={{ fontSize: 13, color: 'var(--dim)' }}>{opt.desc}</span>
            </button>
          ))}
        </div>
        <button onClick={onNext} style={{ width: '100%', marginTop: 24, background: 'var(--gold)', color: '#0f0e0c', border: 'none', borderRadius: 14, padding: '14px 0', fontWeight: 500, fontSize: 15 }}>
          {goal ? 'Continuar →' : 'Pular'}
        </button>
      </div>
    )
  },
  {
    id: 'ready',
    render: ({ genres, goal, onDone }) => (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '40px 32px', textAlign: 'center' }}>
        <div style={{ fontSize: 72, marginBottom: 24 }}>🎉</div>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 26, marginBottom: 12 }}>Tudo pronto!</h2>
        <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.7, marginBottom: 16 }}>
          Preparamos recomendações baseadas nos seus interesses:
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center', marginBottom: 16 }}>
          {genres.map(g => {
            const found = GENRES.find(x => x.id === g)
            return <span key={g} style={{ background: 'rgba(232,201,122,0.12)', color: 'var(--gold)', fontSize: 12, padding: '4px 12px', borderRadius: 20, border: '0.5px solid rgba(232,201,122,0.3)' }}>{found?.emoji} {found?.label || g}</span>
          })}
        </div>
        {goal && <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 32 }}>Meta: <strong style={{ color: 'var(--gold)' }}>{goal} livro{goal > 1 ? 's' : ''}/mês</strong></p>}
        <button onClick={onDone} style={{ width: '100%', background: 'var(--gold)', color: '#0f0e0c', border: 'none', borderRadius: 14, padding: '15px 0', fontWeight: 500, fontSize: 16 }}>
          Começar a ler →
        </button>
      </div>
    )
  }
]

export default function Onboarding({ onDone }) {
  const [step, setStep] = useState(0)
  const [selectedGenres, setSelectedGenres] = useState([])
  const [goal, setGoal] = useState(null)
  const [exiting, setExiting] = useState(false)
  const [entering, setEntering] = useState(false)

  function goNext() {
    setExiting(true)
    setTimeout(() => {
      setStep(s => s + 1)
      setExiting(false)
      setEntering(true)
      setTimeout(() => setEntering(false), 200)
    }, 180)
  }

  function toggleGenre(id) {
    setSelectedGenres(prev => prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id])
  }

  function handleDone() {
    // Save preferences locally
    localStorage.setItem('onboarding_done', '1')
    localStorage.setItem('preferred_genres', JSON.stringify(selectedGenres))
    if (goal) localStorage.setItem('reading_goal', String(goal))
    onDone()
  }

  const current = STEPS[step]

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'var(--bg)', zIndex: 500,
      display: 'flex', flexDirection: 'column', maxWidth: 480, margin: '0 auto'
    }}>
      {/* Progress dots */}
      {step > 0 && (
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', paddingTop: 16 }}>
          {STEPS.slice(1).map((_, i) => (
            <div key={i} style={{ width: i === step - 1 ? 20 : 6, height: 6, borderRadius: 3, background: i <= step - 1 ? 'var(--gold)' : 'var(--border)', transition: 'all 0.3s' }} />
          ))}
        </div>
      )}

      <div style={{
        flex: 1, opacity: exiting ? 0 : entering ? 0 : 1,
        transform: exiting ? 'translateX(-20px)' : entering ? 'translateX(20px)' : 'translateX(0)',
        transition: 'all 0.18s ease'
      }}>
        {current.render({
          onNext: goNext,
          onDone: handleDone,
          selected: selectedGenres,
          onToggle: toggleGenre,
          goal,
          onGoal: setGoal,
          genres: selectedGenres,
        })}
      </div>
    </div>
  )
}

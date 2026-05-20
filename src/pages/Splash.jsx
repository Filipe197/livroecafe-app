import { useEffect, useState } from 'react'

export default function Splash({ onDone }) {
  const [phase, setPhase] = useState(0) // 0=fade in, 1=show, 2=fade out

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 300)
    const t2 = setTimeout(() => setPhase(2), 1800)
    const t3 = setTimeout(() => onDone(), 2400)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [onDone])

  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#0f0e0c', zIndex: 9999,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      opacity: phase === 2 ? 0 : 1, transition: phase === 2 ? 'opacity 0.6s ease' : 'none'
    }}>
      <div style={{
        transform: phase >= 1 ? 'scale(1) translateY(0)' : 'scale(0.7) translateY(20px)',
        opacity: phase >= 1 ? 1 : 0,
        transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16
      }}>
        <div style={{
          width: 90, height: 90, borderRadius: 24, background: 'var(--gold)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 44, boxShadow: '0 0 60px rgba(232,201,122,0.3)'
        }}>☕</div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 28, color: 'var(--gold)', letterSpacing: '-0.5px' }}>
            Livro & Café
          </div>
          <div style={{ fontSize: 13, color: 'var(--dim)', marginTop: 4 }}>Sua biblioteca pessoal</div>
        </div>
      </div>

      {/* Loading dots */}
      <div style={{
        position: 'absolute', bottom: 60, display: 'flex', gap: 6,
        opacity: phase >= 1 ? 1 : 0, transition: 'opacity 0.4s ease 0.3s'
      }}>
        {[0,1,2].map(i => (
          <div key={i} style={{
            width: 6, height: 6, borderRadius: '50%', background: 'var(--gold)',
            animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`
          }} />
        ))}
      </div>
      <style>{`
        @keyframes pulse {
          0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  )
}

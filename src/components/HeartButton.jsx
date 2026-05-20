import { useState } from 'react'

export default function HeartButton({ active, onToggle, size = 48 }) {
  const [burst, setBurst] = useState(false)

  async function handleClick() {
    if (!active) {
      setBurst(true)
      setTimeout(() => setBurst(false), 600)
    }
    await onToggle()
  }

  return (
    <button
      onClick={handleClick}
      style={{
        width: size, height: size,
        background: active ? 'rgba(232,201,122,0.15)' : 'var(--surface)',
        border: `0.5px solid ${active ? 'var(--gold)' : 'var(--border)'}`,
        borderRadius: size * 0.25,
        fontSize: size * 0.42,
        color: active ? 'var(--gold)' : 'var(--muted)',
        position: 'relative', overflow: 'visible',
        transition: 'all 0.2s',
        transform: burst ? 'scale(1.18)' : 'scale(1)',
      }}
    >
      {active ? '♥' : '♡'}
      {burst && [...Array(6)].map((_, i) => (
        <span key={i} style={{
          position: 'absolute',
          top: '50%', left: '50%',
          width: 6, height: 6,
          borderRadius: '50%',
          background: 'var(--gold)',
          pointerEvents: 'none',
          animation: `burst-${i} 0.55s ease-out forwards`,
        }} />
      ))}
      <style>{`
        ${[...Array(6)].map((_, i) => {
          const angle = (i / 6) * 360
          const rad = (angle * Math.PI) / 180
          const x = Math.cos(rad) * 22
          const y = Math.sin(rad) * 22
          return `
            @keyframes burst-${i} {
              0%   { transform: translate(-50%,-50%) scale(1); opacity: 1; }
              100% { transform: translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(0); opacity: 0; }
            }
          `
        }).join('')}
      `}</style>
    </button>
  )
}

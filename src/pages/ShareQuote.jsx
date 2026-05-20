import { useRef, useEffect } from 'react'

export function ShareQuoteModal({ quote, book, onClose }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (!canvasRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const W = 800, H = 800
    canvas.width = W; canvas.height = H

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, W, H)
    grad.addColorStop(0, '#0f0e0c')
    grad.addColorStop(1, '#1a1610')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, W, H)

    // Gold border
    ctx.strokeStyle = 'rgba(232,201,122,0.3)'
    ctx.lineWidth = 2
    ctx.strokeRect(32, 32, W - 64, H - 64)

    // Quote marks
    ctx.font = 'bold 120px Georgia'
    ctx.fillStyle = 'rgba(232,201,122,0.15)'
    ctx.fillText('"', 48, 140)

    // Quote text
    const words = quote.split(' ')
    const lines = []
    let line = ''
    const maxW = W - 120
    ctx.font = '28px Georgia'
    for (const word of words) {
      const test = line + (line ? ' ' : '') + word
      if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = word }
      else line = test
    }
    if (line) lines.push(line)

    const lineH = 42
    const totalH = lines.length * lineH
    const startY = (H - totalH) / 2 - 30

    ctx.fillStyle = '#e8e0d0'
    ctx.font = '28px Georgia'
    ctx.textAlign = 'center'
    lines.forEach((l, i) => ctx.fillText(l, W / 2, startY + i * lineH))

    // Book info
    if (book) {
      ctx.font = '500 18px DM Sans, sans-serif'
      ctx.fillStyle = 'rgba(232,201,122,0.8)'
      ctx.fillText(`— ${book.title}`, W / 2, startY + totalH + 50)
      if (book.author) {
        ctx.font = '16px DM Sans, sans-serif'
        ctx.fillStyle = 'rgba(255,255,255,0.4)'
        ctx.fillText(book.author, W / 2, startY + totalH + 76)
      }
    }

    // Logo
    ctx.font = '500 16px DM Sans, sans-serif'
    ctx.fillStyle = 'rgba(232,201,122,0.5)'
    ctx.fillText('☕ Livro & Café', W / 2, H - 52)
  }, [quote, book])

  async function share() {
    const canvas = canvasRef.current
    canvas.toBlob(async blob => {
      const file = new File([blob], 'citacao.png', { type: 'image/png' })
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Citação — Livro & Café' })
      } else {
        const a = document.createElement('a')
        a.href = URL.createObjectURL(blob)
        a.download = 'citacao.png'
        a.click()
      }
    }, 'image/png')
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#141210', borderRadius: 16, width: 'min(400px, 94vw)', border: '1px solid rgba(232,201,122,0.2)', overflow: 'hidden' }}>
        <div style={{ padding: '14px 16px', borderBottom: '0.5px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: 'var(--font-serif)', fontSize: 15, color: 'var(--text)' }}>✨ Compartilhar citação</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--dim)', fontSize: 20, cursor: 'pointer' }}>×</button>
        </div>
        <div style={{ padding: 16 }}>
          <canvas ref={canvasRef} style={{ width: '100%', borderRadius: 8, display: 'block', marginBottom: 14 }} />
          <button onClick={share} style={{ width: '100%', background: 'var(--gold)', color: '#0f0e0c', border: 'none', borderRadius: 10, padding: '12px 0', fontWeight: 500, fontSize: 14, cursor: 'pointer' }}>
            📤 Compartilhar / Salvar imagem
          </button>
        </div>
      </div>
    </div>
  )
}

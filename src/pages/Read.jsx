import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useBook } from '../hooks/useBooks'
import { useReadingProgress } from '../hooks/useFavorites'
import { useAuth } from '../hooks/useAuth.jsx'
import { supabase } from '../lib/supabase'

function isSupabaseUrl(url) { return url && url.includes('supabase.co') }
function isDriveUrl(url) { return url && url.includes('drive.google.com') }
function getDriveDirectUrl(url) {
  const match = url.match(/\/file\/d\/([^/]+)/)
  if (match) return `https://drive.google.com/uc?export=download&id=${match[1]}`
  return url
}
function getDriveViewUrl(url) {
  const match = url.match(/\/file\/d\/([^/]+)/)
  if (match) return `https://drive.google.com/file/d/${match[1]}/view`
  return url
}

const THEMES = {
  dark:   { bg: '#0f0e0c', text: '#ddd9d0', border: '#2e2c28', label: '🌙 Escuro' },
  sepia:  { bg: '#f5f0e8', text: '#3a3020', border: '#ddd8ce', label: '☕ Sépia' },
  light:  { bg: '#ffffff', text: '#1a1a1a', border: '#e5e5e5', label: '☀️ Claro' },
  night:  { bg: '#0a0a12', text: '#c8c8e0', border: '#1e1e2e', label: '🌌 Noturno' },
  forest: { bg: '#0d1a0d', text: '#c8e0c8', border: '#1a2e1a', label: '🌿 Floresta' },
}

const FONTS = {
  serif:  { label: 'Serif',   css: "'Playfair Display', Georgia, serif" },
  sans:   { label: 'Sans',    css: "'DM Sans', system-ui, sans-serif" },
  mono:   { label: 'Mono',    css: "'Courier New', Courier, monospace" },
}

const HIGHLIGHT_COLORS = {
  gold:  { bg: 'rgba(232,201,122,0.4)', label: '🟡' },
  green: { bg: 'rgba(100,200,100,0.4)', label: '🟢' },
  pink:  { bg: 'rgba(220,100,150,0.4)', label: '🩷' },
}

function Spinner({ label = 'Carregando...' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 24px', gap: 14 }}>
      <div style={{ width: 32, height: 32, border: '2px solid var(--border)', borderTop: '2px solid var(--gold)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <span style={{ fontSize: 13, color: 'var(--dim)' }}>{label}</span>
    </div>
  )
}

export default function Read() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { book, loading } = useBook(id)
  const { user } = useAuth()
  const { progress, saveProgress } = useReadingProgress(id)
  const [mode, setMode] = useState('choose')
  const [fontSize, setFontSize] = useState(17)
  const [theme, setTheme] = useState('dark')
  const [font, setFont] = useState('serif')
  const [lineHeight, setLineHeight] = useState(1.85)
  const [showControls, setShowControls] = useState(false)
  const [epubError, setEpubError] = useState(null)
  const [pdfPage, setPdfPage] = useState(1)
  const [pdfTotal, setPdfTotal] = useState(0)
  const [pdfDoc, setPdfDoc] = useState(null)
  const [sharing, setSharing] = useState(false)
  const [highlights, setHighlights] = useState([])
  const [bookmarks, setBookmarks] = useState([])
  const [showHighlights, setShowHighlights] = useState(false)
  const [showBookmarks, setShowBookmarks] = useState(false)
  const [selectedText, setSelectedText] = useState('')
  const [showHighlightMenu, setShowHighlightMenu] = useState(false)
  const [audioSpeed, setAudioSpeed] = useState(1)
  const audioRef = useRef(null)
  const viewerRef = useRef(null)
  const canvasRef = useRef(null)
  const bookRef = useRef(null)
  const renditionRef = useRef(null)
  const saveTimer = useRef(null)

  const epubUrl = book?.formats?.epub
  const pdfUrl = book?.formats?.pdf
  const mp3Url = book?.formats?.mp3
  const hasEpub = epubUrl && epubUrl.length > 4
  const hasPdf = pdfUrl && pdfUrl.length > 4
  const hasMp3 = mp3Url && mp3Url.length > 4
  const epubIsSupabase = isSupabaseUrl(epubUrl)
  const epubIsDrive = isDriveUrl(epubUrl)
  const pdfIsSupabase = isSupabaseUrl(pdfUrl)

  useEffect(() => {
    if (user && id) { fetchHighlights(); fetchBookmarks() }
    return () => {
      if (bookRef.current) bookRef.current.destroy()
      clearTimeout(saveTimer.current)
    }
  }, [user, id])

  // Apply theme+font to epub rendition
  function applyEpubTheme(rendition, themeKey, fontKey, fs, lh) {
    const t = THEMES[themeKey]
    const f = FONTS[fontKey]
    rendition.themes.register('custom', {
      'body': {
        'background': t.bg + ' !important',
        'color': t.text + ' !important',
        'font-family': f.css + ' !important',
        'font-size': fs + 'px !important',
        'line-height': lh + ' !important',
        'padding': '16px !important',
      },
      'p': { 'color': t.text + ' !important' },
      'span': { 'color': t.text + ' !important' },
      'div': { 'color': t.text + ' !important' },
      'h1,h2,h3,h4': { 'color': t.text + ' !important' },
      'a': { 'color': '#e8c97a !important' },
    })
    rendition.themes.select('custom')
  }

  useEffect(() => {
    if (renditionRef.current) {
      applyEpubTheme(renditionRef.current, theme, font, fontSize, lineHeight)
    }
  }, [font, lineHeight, theme, fontSize])

  async function fetchHighlights() {
    const { data } = await supabase.from('highlights').select('*').eq('user_id', user.id).eq('book_id', id).order('created_at')
    setHighlights(data || [])
  }

  async function fetchBookmarks() {
    const { data } = await supabase.from('bookmarks').select('*').eq('user_id', user.id).eq('book_id', id).order('created_at')
    setBookmarks(data || [])
  }

  async function saveHighlight(color = 'gold') {
    if (!selectedText.trim() || !user) return
    const { data } = await supabase.from('highlights').insert({ user_id: user.id, book_id: id, text: selectedText.trim(), color }).select().single()
    if (data) setHighlights(prev => [...prev, data])
    setSelectedText(''); setShowHighlightMenu(false)
    window.getSelection()?.removeAllRanges()
  }

  async function deleteHighlight(hid) {
    await supabase.from('highlights').delete().eq('id', hid)
    setHighlights(prev => prev.filter(h => h.id !== hid))
  }

  async function addBookmark() {
    if (!user) return
    const position = renditionRef.current?.location?.start?.cfi || `page-${pdfPage}`
    const label = `${Math.round(progress?.progress_percent || 0)}% — ${new Date().toLocaleDateString('pt-BR')}`
    const { data } = await supabase.from('bookmarks').insert({ user_id: user.id, book_id: id, position, label }).select().single()
    if (data) { setBookmarks(prev => [...prev, data]); alert('Marcador salvo! 🔖') }
  }

  async function deleteBookmark(bid) {
    await supabase.from('bookmarks').delete().eq('id', bid)
    setBookmarks(prev => prev.filter(b => b.id !== bid))
  }

  function handleTextSelection() {
    const sel = window.getSelection()
    if (sel && sel.toString().trim().length > 3) {
      setSelectedText(sel.toString().trim()); setShowHighlightMenu(true)
    } else setShowHighlightMenu(false)
  }

  useEffect(() => {
    if (mode !== 'pdf' || !pdfDoc || !canvasRef.current) return
    async function renderPage() {
      const page = await pdfDoc.getPage(pdfPage)
      const canvas = canvasRef.current
      if (!canvas) return
      const viewport = page.getViewport({ scale: window.devicePixelRatio || 1.5 })
      canvas.width = viewport.width; canvas.height = viewport.height
      canvas.style.width = '100%'; canvas.style.height = 'auto'
      await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise
      if (user) saveProgress(Math.round((pdfPage / pdfTotal) * 100))
    }
    renderPage()
  }, [pdfPage, pdfDoc, mode])

  async function openEpub() {
    if (epubIsDrive) { window.open(getDriveViewUrl(epubUrl), '_blank'); return }
    setMode('loading'); setEpubError(null)
    try {
      const ePub = (await import('epubjs')).default
      if (bookRef.current) bookRef.current.destroy()
      const epubBook = ePub(epubUrl)
      bookRef.current = epubBook
      await Promise.race([epubBook.ready, new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 20000))])
      setMode('epub')
      setTimeout(() => {
        if (!viewerRef.current) return
        const rendition = epubBook.renderTo(viewerRef.current, { width: '100%', height: '100%', flow: 'paginated' })
        renditionRef.current = rendition
        applyEpubTheme(rendition, theme, font, fontSize, lineHeight)
        if (progress?.current_position) rendition.display(progress.current_position)
        else rendition.display()
        rendition.on('relocated', (loc) => {
          const pct = Math.round((epubBook.locations.percentageFromCfi(loc.start.cfi) || 0) * 100)
          clearTimeout(saveTimer.current)
          saveTimer.current = setTimeout(() => { if (user) saveProgress(pct, loc.start.cfi) }, 1500)
        })
        rendition.on('selected', (cfiRange, contents) => {
          const sel = contents.window.getSelection()
          if (sel && sel.toString().trim().length > 3) { setSelectedText(sel.toString().trim()); setShowHighlightMenu(true) }
        })
        epubBook.locations.generate(1024)
      }, 100)
    } catch { setEpubError('Não foi possível carregar o EPUB.'); setMode('choose') }
  }

  async function openPdf() {
    setMode('loading')
    try {
      const pdfjsLib = await import('pdfjs-dist')
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`
      const url = pdfIsSupabase ? pdfUrl : `https://corsproxy.io/?${encodeURIComponent(getDriveDirectUrl(pdfUrl))}`
      const doc = await pdfjsLib.getDocument({ url }).promise
      setPdfDoc(doc); setPdfTotal(doc.numPages); setPdfPage(1); setMode('pdf')
    } catch { setEpubError('Não foi possível carregar o PDF.'); setMode('choose') }
  }

  async function shareFile(url, filename, mimeType) {
    setSharing(true)
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const file = new File([blob], filename, { type: mimeType })
      if (navigator.canShare && navigator.canShare({ files: [file] })) await navigator.share({ files: [file], title: book.title })
      else if (navigator.share) await navigator.share({ title: book.title, url })
      else { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = filename; a.click() }
    } catch (err) { if (err.name !== 'AbortError') window.open(url, '_blank') }
    finally { setSharing(false) }
  }

  async function sendToKindle(type) {
    const url = type === 'epub' ? epubUrl : pdfUrl
    const isSupabase = type === 'epub' ? epubIsSupabase : pdfIsSupabase
    const ext = type === 'epub' ? 'epub' : 'pdf'
    const mime = type === 'epub' ? 'application/epub+zip' : 'application/pdf'
    const filename = `${book.title.replace(/[^a-z0-9]/gi, '_')}.${ext}`
    if (isSupabase) await shareFile(url, filename, mime)
    else if (isDriveUrl(url)) await shareFile(getDriveDirectUrl(url), filename, mime)
    else window.open(url, '_blank')
  }

  const currentTheme = THEMES[theme]

  const ControlsPanel = () => (
    <div style={{ padding: '10px 16px', borderBottom: `0.5px solid ${currentTheme.border}`, background: currentTheme.bg, flexShrink: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 11, color: currentTheme.text, opacity: 0.6, width: 40 }}>Fonte</span>
        <button onClick={() => setFontSize(s => Math.max(12, s-1))} style={{ width: 28, height: 28, background: 'rgba(128,128,128,0.2)', border: 'none', borderRadius: 6, color: currentTheme.text, fontSize: 16, cursor: 'pointer' }}>−</button>
        <span style={{ fontSize: 13, color: currentTheme.text, minWidth: 24, textAlign: 'center' }}>{fontSize}</span>
        <button onClick={() => setFontSize(s => Math.min(26, s+1))} style={{ width: 28, height: 28, background: 'rgba(128,128,128,0.2)', border: 'none', borderRadius: 6, color: currentTheme.text, fontSize: 16, cursor: 'pointer' }}>+</button>
        <span style={{ fontSize: 11, color: currentTheme.text, opacity: 0.6, marginLeft: 8, width: 50 }}>Linha</span>
        <button onClick={() => setLineHeight(lh => Math.max(1.2, +(lh - 0.1).toFixed(1)))} style={{ width: 28, height: 28, background: 'rgba(128,128,128,0.2)', border: 'none', borderRadius: 6, color: currentTheme.text, fontSize: 16, cursor: 'pointer' }}>−</button>
        <span style={{ fontSize: 12, color: currentTheme.text, minWidth: 28, textAlign: 'center' }}>{lineHeight}</span>
        <button onClick={() => setLineHeight(lh => Math.min(2.5, +(lh + 0.1).toFixed(1)))} style={{ width: 28, height: 28, background: 'rgba(128,128,128,0.2)', border: 'none', borderRadius: 6, color: currentTheme.text, fontSize: 16, cursor: 'pointer' }}>+</button>
      </div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
        <span style={{ fontSize: 11, color: currentTheme.text, opacity: 0.6, width: 40, flexShrink: 0, paddingTop: 4 }}>Tipo</span>
        {Object.entries(FONTS).map(([key, f]) => (
          <button key={key} onClick={() => setFont(key)} style={{ flex: 1, padding: '5px 4px', borderRadius: 8, border: 'none', cursor: 'pointer', background: font === key ? '#e8c97a' : 'rgba(128,128,128,0.2)', color: font === key ? '#0f0e0c' : currentTheme.text, fontSize: 12, fontFamily: f.css }}>{f.label}</button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 11, color: currentTheme.text, opacity: 0.6, width: 40, flexShrink: 0, paddingTop: 4 }}>Tema</span>
        {Object.entries(THEMES).map(([key, t]) => (
          <button key={key} onClick={() => setTheme(key)} style={{ padding: '4px 8px', borderRadius: 8, border: `1px solid ${theme === key ? '#e8c97a' : 'transparent'}`, cursor: 'pointer', background: t.bg, color: t.text, fontSize: 10, fontWeight: theme === key ? 600 : 400 }}>{t.label}</button>
        ))}
      </div>
    </div>
  )

  if (mode === 'audio') return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '0.5px solid var(--border)', flexShrink: 0 }}>
        <button onClick={() => setMode('choose')} style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: 24, lineHeight: 1, padding: 0 }}>‹</button>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: 14 }}>🎧 Audiolivro</div>
        <div style={{ width: 24 }} />
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <img src={book?.cover_url} alt={book?.title} style={{ width: 180, height: 258, objectFit: 'cover', borderRadius: 12, marginBottom: 28, boxShadow: '0 16px 48px rgba(0,0,0,0.6)' }} onError={e => { e.target.src = 'https://placehold.co/180x258/1a1916/e8c97a?text=📖' }} />
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 20, textAlign: 'center', marginBottom: 6 }}>{book?.title}</h2>
        <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 28 }}>{book?.author}</p>
        <audio ref={audioRef} src={mp3Url} style={{ width: '100%', marginBottom: 16 }} controls onPlay={() => { if (audioRef.current) audioRef.current.playbackRate = audioSpeed }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, color: 'var(--dim)' }}>Velocidade:</span>
          {[0.75, 1, 1.25, 1.5, 2].map(speed => (
            <button key={speed} onClick={() => { setAudioSpeed(speed); if (audioRef.current) audioRef.current.playbackRate = speed }} style={{ padding: '4px 10px', borderRadius: 8, border: 'none', background: audioSpeed === speed ? 'var(--gold)' : 'var(--surface)', color: audioSpeed === speed ? '#0f0e0c' : 'var(--muted)', fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
              {speed}x
            </button>
          ))}
        </div>
      </div>
    </div>
  )

  if (mode === 'epub') return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: currentTheme.bg, color: currentTheme.text }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderBottom: `0.5px solid ${currentTheme.border}`, background: currentTheme.bg, flexShrink: 0 }}>
        <button onClick={() => { if (bookRef.current) bookRef.current.destroy(); setMode('choose') }} style={{ background: 'none', border: 'none', fontSize: 24, color: currentTheme.text, opacity: 0.6, lineHeight: 1, padding: 0, cursor: 'pointer' }}>‹</button>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: FONTS[font].css, fontSize: 12, color: currentTheme.text }}>{book.title}</div>
          {progress && <div style={{ fontSize: 10, color: '#e8c97a' }}>{progress.progress_percent}% lido</div>}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={addBookmark} title="Marcar página" style={{ background: 'none', border: 'none', fontSize: 16, color: currentTheme.text, opacity: 0.7, cursor: 'pointer' }}>🔖</button>
          <button onClick={() => setShowHighlights(s => !s)} style={{ background: 'none', border: 'none', fontSize: 14, color: currentTheme.text, opacity: 0.7, cursor: 'pointer' }}>✏{highlights.length > 0 && ` ${highlights.length}`}</button>
          <button onClick={() => setShowControls(p => !p)} style={{ background: 'none', border: 'none', fontSize: 13, fontWeight: 500, color: currentTheme.text, opacity: 0.7, cursor: 'pointer' }}>Aa</button>
        </div>
      </div>
      {showControls && <ControlsPanel />}
      {showHighlightMenu && selectedText && (
        <div style={{ padding: '8px 16px', background: currentTheme.bg, borderBottom: `0.5px solid ${currentTheme.border}`, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, color: currentTheme.text, opacity: 0.7, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>"{selectedText.slice(0, 40)}..."</span>
          {Object.entries(HIGHLIGHT_COLORS).map(([color, meta]) => (
            <button key={color} onClick={() => saveHighlight(color)} style={{ width: 26, height: 26, background: meta.bg, border: 'none', borderRadius: '50%', cursor: 'pointer', fontSize: 13 }}>{meta.label}</button>
          ))}
          <button onClick={() => { setShowHighlightMenu(false); window.getSelection()?.removeAllRanges() }} style={{ background: 'none', border: 'none', color: currentTheme.text, opacity: 0.5, cursor: 'pointer', fontSize: 18 }}>×</button>
        </div>
      )}
      {showHighlights && (
        <div style={{ maxHeight: 180, overflowY: 'auto', borderBottom: `0.5px solid ${currentTheme.border}`, background: currentTheme.bg, flexShrink: 0 }}>
          <div style={{ padding: '8px 16px 4px', fontSize: 11, color: currentTheme.text, opacity: 0.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>Citações ({highlights.length})</div>
          {highlights.length === 0
            ? <div style={{ padding: '8px 16px', fontSize: 12, color: currentTheme.text, opacity: 0.4 }}>Selecione um texto para grifar</div>
            : highlights.map(h => (
                <div key={h.id} style={{ padding: '6px 16px', borderBottom: `0.5px solid ${currentTheme.border}`, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: HIGHLIGHT_COLORS[h.color]?.bg || 'gold', marginTop: 3, flexShrink: 0 }} />
                  <div style={{ flex: 1, fontSize: 13, color: currentTheme.text, lineHeight: 1.5, fontStyle: 'italic' }}>{h.text}</div>
                  <button onClick={() => deleteHighlight(h.id)} style={{ background: 'none', border: 'none', color: currentTheme.text, opacity: 0.4, cursor: 'pointer', fontSize: 14 }}>🗑</button>
                </div>
              ))
          }
        </div>
      )}
      <div ref={viewerRef} style={{ flex: 1, overflow: 'hidden', background: currentTheme.bg }} onMouseUp={handleTextSelection} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', borderTop: `0.5px solid ${currentTheme.border}`, background: currentTheme.bg, flexShrink: 0 }}>
        <button onClick={() => renditionRef.current?.prev()} style={{ background: 'rgba(128,128,128,0.15)', border: 'none', borderRadius: 10, padding: '8px 24px', fontSize: 20, color: currentTheme.text, cursor: 'pointer' }}>‹</button>
        <button onClick={() => sendToKindle('epub')} disabled={sharing} style={{ background: 'none', border: `0.5px solid #e8c97a`, borderRadius: 10, padding: '6px 12px', fontSize: 11, color: '#e8c97a', cursor: 'pointer' }}>{sharing ? '...' : '📱 Kindle'}</button>
        <button onClick={() => renditionRef.current?.next()} style={{ background: 'rgba(128,128,128,0.15)', border: 'none', borderRadius: 10, padding: '8px 24px', fontSize: 20, color: currentTheme.text, cursor: 'pointer' }}>›</button>
      </div>
    </div>
  )

  if (mode === 'pdf') return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#2a2a2a' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderBottom: '0.5px solid #444', flexShrink: 0, background: '#1e1e1e' }}>
        <button onClick={() => setMode('choose')} style={{ background: 'none', border: 'none', fontSize: 24, color: '#ccc', lineHeight: 1, padding: 0, cursor: 'pointer' }}>‹</button>
        <div style={{ fontSize: 12, color: '#aaa' }}>Página {pdfPage} / {pdfTotal}</div>
        <button onClick={() => sendToKindle('pdf')} disabled={sharing} style={{ background: 'none', border: '0.5px solid #e8c97a', borderRadius: 8, padding: '5px 10px', fontSize: 11, color: '#e8c97a', cursor: 'pointer' }}>{sharing ? '...' : '📱 Kindle'}</button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }} onMouseUp={handleTextSelection}>
        <canvas ref={canvasRef} style={{ display: 'block', margin: '0 auto', maxWidth: '100%' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 20px', borderTop: '0.5px solid #444', background: '#1e1e1e', flexShrink: 0 }}>
        <button onClick={() => setPdfPage(p => Math.max(1, p-1))} disabled={pdfPage <= 1} style={{ background: '#333', border: 'none', borderRadius: 10, padding: '8px 24px', fontSize: 20, color: '#ccc', opacity: pdfPage <= 1 ? 0.3 : 1, cursor: 'pointer' }}>‹</button>
        <div style={{ display: 'flex', gap: 4 }}>
          {[...Array(Math.min(5, pdfTotal))].map((_, i) => {
            const p = Math.max(1, Math.min(pdfTotal - 4, pdfPage - 2)) + i
            return <button key={p} onClick={() => setPdfPage(p)} style={{ width: 28, height: 28, borderRadius: 6, border: 'none', background: p === pdfPage ? '#e8c97a' : '#333', color: p === pdfPage ? '#0f0e0c' : '#aaa', fontSize: 11, cursor: 'pointer' }}>{p}</button>
          })}
        </div>
        <button onClick={() => setPdfPage(p => Math.min(pdfTotal, p+1))} disabled={pdfPage >= pdfTotal} style={{ background: '#333', border: 'none', borderRadius: 10, padding: '8px 24px', fontSize: 20, color: '#ccc', opacity: pdfPage >= pdfTotal ? 0.3 : 1, cursor: 'pointer' }}>›</button>
      </div>
    </div>
  )

  if (mode === 'loading') return <Spinner label="Carregando arquivo..." />

  const previewPercent = 20
  const isLocked = !user && (progress?.progress_percent || 0) >= previewPercent

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '0.5px solid var(--border)', flexShrink: 0 }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: 24, lineHeight: 1, padding: 0, cursor: 'pointer' }}>‹</button>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: 14 }}>{book?.title}</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {user && bookmarks.length > 0 && <button onClick={() => setShowBookmarks(s => !s)} style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: 16, cursor: 'pointer' }}>🔖 {bookmarks.length}</button>}
          {user && highlights.length > 0 && <button onClick={() => setShowHighlights(s => !s)} style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: 16, cursor: 'pointer' }}>✏ {highlights.length}</button>}
        </div>
      </div>

      {showBookmarks && (
        <div style={{ background: 'var(--surface)', borderBottom: '0.5px solid var(--border)', maxHeight: 180, overflowY: 'auto' }}>
          <div style={{ padding: '8px 16px 4px', fontSize: 11, color: 'var(--dim)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>Marcadores ({bookmarks.length})</div>
          {bookmarks.map(b => (
            <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 16px', borderBottom: '0.5px solid var(--border)' }}>
              <span style={{ fontSize: 16 }}>🔖</span>
              <span style={{ flex: 1, fontSize: 13, color: 'var(--text)' }}>{b.label}</span>
              <button onClick={() => deleteBookmark(b.id)} style={{ background: 'none', border: 'none', color: 'var(--dim)', cursor: 'pointer', fontSize: 14 }}>🗑</button>
            </div>
          ))}
        </div>
      )}

      {showHighlights && (
        <div style={{ background: 'var(--surface)', borderBottom: '0.5px solid var(--border)', maxHeight: 180, overflowY: 'auto' }}>
          <div style={{ padding: '8px 16px 4px', fontSize: 11, color: 'var(--dim)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>Citações ({highlights.length})</div>
          {highlights.map(h => (
            <div key={h.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 16px', borderBottom: '0.5px solid var(--border)' }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: HIGHLIGHT_COLORS[h.color]?.bg || 'gold', marginTop: 3, flexShrink: 0 }} />
              <span style={{ flex: 1, fontSize: 13, color: 'var(--text)', lineHeight: 1.5, fontStyle: 'italic' }}>"{h.text}"</span>
              <button onClick={() => deleteHighlight(h.id)} style={{ background: 'none', border: 'none', color: 'var(--dim)', cursor: 'pointer', fontSize: 14 }}>🗑</button>
            </div>
          ))}
        </div>
      )}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 24px 48px' }}>
        <img src={book?.cover_url} alt={book?.title} style={{ width: 110, height: 158, objectFit: 'cover', borderRadius: 10, marginBottom: 16, boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }} onError={e => { e.target.src = 'https://placehold.co/110x158/1a1916/e8c97a?text=📖' }} />
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 18, textAlign: 'center', marginBottom: 4 }}>{book?.title}</h2>
        <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 24 }}>{book?.author}</p>

        {progress?.progress_percent > 0 && (
          <div style={{ width: '100%', marginBottom: 20, background: 'var(--surface)', border: '0.5px solid var(--border)', borderRadius: 10, padding: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>
              <span>Progresso</span><span style={{ color: 'var(--gold)' }}>{progress.progress_percent}%</span>
            </div>
            <div style={{ height: 3, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ width: `${progress.progress_percent}%`, height: '100%', background: 'var(--gold)', borderRadius: 2 }} />
            </div>
          </div>
        )}

        {epubError && <div style={{ width: '100%', background: 'rgba(212,90,58,0.1)', border: '0.5px solid rgba(212,90,58,0.3)', borderRadius: 10, padding: 12, fontSize: 13, color: '#d45a3a', marginBottom: 16, textAlign: 'center' }}>{epubError}</div>}

        {isLocked ? (
          <div style={{ width: '100%', background: 'rgba(232,201,122,0.08)', border: '1px solid rgba(232,201,122,0.3)', borderRadius: 12, padding: 20, textAlign: 'center' }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>🔒</div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 17, marginBottom: 8 }}>Preview esgotado</div>
            <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 16, lineHeight: 1.6 }}>
              Você leu os primeiros {previewPercent}% gratuitamente.<br />Assine para continuar lendo!
            </div>
            <button onClick={() => navigate('/auth')} style={{ width: '100%', background: 'var(--gold)', color: '#0f0e0c', border: 'none', borderRadius: 12, padding: '13px 0', fontWeight: 500, fontSize: 15, cursor: 'pointer' }}>
              Criar conta e assinar
            </button>
          </div>
        ) : (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {!user && (hasEpub || hasPdf) && (
              <div style={{ background: 'rgba(232,201,122,0.06)', border: '0.5px solid rgba(232,201,122,0.2)', borderRadius: 10, padding: '8px 12px', fontSize: 12, color: 'var(--muted)', textAlign: 'center', marginBottom: 4 }}>
                📖 Preview gratuito: primeiros {previewPercent}% do livro
              </div>
            )}
            {hasEpub && (
              <>
                <button onClick={openEpub} style={{ width: '100%', background: 'var(--gold)', color: '#0f0e0c', border: 'none', borderRadius: 12, padding: '13px 0', fontWeight: 500, fontSize: 14, cursor: 'pointer' }}>
                  {epubIsSupabase ? (progress?.progress_percent > 0 ? '▶ Continuar (EPUB)' : '📖 Ler EPUB no app') : '📖 Ler no Google Drive'}
                </button>
                <button onClick={() => sendToKindle('epub')} disabled={sharing} style={{ width: '100%', background: 'var(--surface)', color: 'var(--text)', border: '0.5px solid var(--border)', borderRadius: 12, padding: '12px 0', fontSize: 13, cursor: 'pointer' }}>
                  {sharing ? '⏳ Preparando...' : '📱 Enviar para Kindle / outro app'}
                </button>
              </>
            )}
            {hasPdf && (
              <>
                <button onClick={openPdf} style={{ width: '100%', background: hasEpub ? 'var(--surface2)' : 'var(--gold)', color: hasEpub ? 'var(--text)' : '#0f0e0c', border: `0.5px solid ${hasEpub ? 'var(--border)' : 'transparent'}`, borderRadius: 12, padding: '12px 0', fontSize: 13, cursor: 'pointer' }}>📄 Ler PDF no app</button>
                <button onClick={() => sendToKindle('pdf')} disabled={sharing} style={{ width: '100%', background: 'var(--surface)', color: 'var(--text)', border: '0.5px solid var(--border)', borderRadius: 12, padding: '12px 0', fontSize: 13, cursor: 'pointer' }}>
                  {sharing ? '⏳ Preparando...' : '📱 Enviar PDF para Kindle / outro app'}
                </button>
              </>
            )}
            {hasMp3 && (
              <button onClick={() => setMode('audio')} style={{ width: '100%', background: 'var(--surface)', color: 'var(--text)', border: '0.5px solid var(--border)', borderRadius: 12, padding: '12px 0', fontSize: 13, cursor: 'pointer' }}>
                🎧 Ouvir audiolivro
              </button>
            )}
            {!hasEpub && !hasPdf && !hasMp3 && <div style={{ color: 'var(--dim)', fontSize: 13, textAlign: 'center', padding: 16 }}>Nenhum arquivo disponível</div>}
          </div>
        )}
      </div>
    </div>
  )
}

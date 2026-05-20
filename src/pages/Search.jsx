import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const FORMATS = [
  { key: 'all', label: 'Todos' },
  { key: 'epub', label: 'EPUB' },
  { key: 'pdf', label: 'PDF' },
  { key: 'mp3', label: 'Áudio' },
]

function BookRow({ book, onClick }) {
  return (
    <div onClick={onClick} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: '0.5px solid var(--border)', cursor: 'pointer', alignItems: 'center' }}>
      <img src={book.cover_url} alt={book.title} style={{ width: 48, height: 68, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }} onError={e => { e.target.src = 'https://placehold.co/48x68/1a1916/e8c97a?text=📚' }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: 14, marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{book.title}</div>
        <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 5 }}>{book.author}</div>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {book.genre && <span style={{ fontSize: 10, background: 'rgba(232,201,122,0.1)', color: 'var(--gold)', padding: '2px 7px', borderRadius: 6, border: '0.5px solid rgba(232,201,122,0.2)' }}>{book.genre}</span>}
          {book.formats?.epub && <span style={{ fontSize: 10, background: 'rgba(100,160,255,0.1)', color: '#6aa0ff', padding: '2px 7px', borderRadius: 6 }}>EPUB</span>}
          {book.formats?.pdf && <span style={{ fontSize: 10, background: 'rgba(255,100,100,0.1)', color: '#ff8080', padding: '2px 7px', borderRadius: 6 }}>PDF</span>}
          {book.formats?.mp3 && <span style={{ fontSize: 10, background: 'rgba(100,220,150,0.1)', color: '#64dc96', padding: '2px 7px', borderRadius: 6 }}>🎧</span>}
        </div>
      </div>
      <span style={{ fontSize: 20, color: 'var(--dim)', flexShrink: 0 }}>›</span>
    </div>
  )
}

export default function Search() {
  const [query, setQuery] = useState('')
  const [genre, setGenre] = useState('all')
  const [format, setFormat] = useState('all')
  const [results, setResults] = useState([])
  const [genres, setGenres] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const inputRef = useRef(null)
  const navigate = useNavigate()
  const debounce = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
    fetchGenres()
  }, [])

  useEffect(() => {
    clearTimeout(debounce.current)
    if (!query.trim() && genre === 'all' && format === 'all') { setResults([]); setSearched(false); return }
    debounce.current = setTimeout(() => doSearch(), 350)
    return () => clearTimeout(debounce.current)
  }, [query, genre, format])

  async function fetchGenres() {
    const { data } = await supabase.from('books').select('genre').not('genre', 'is', null)
    const unique = [...new Set((data || []).map(b => b.genre).filter(Boolean))].sort()
    setGenres(unique)
  }

  async function doSearch() {
    setLoading(true)
    let q = supabase.from('books').select('id, title, author, cover_url, genre, formats')
    if (query.trim()) q = q.or(`title.ilike.%${query.trim()}%,author.ilike.%${query.trim()}%`)
    if (genre !== 'all') q = q.eq('genre', genre)
    const { data } = await q.order('title').limit(40)
    let filtered = data || []
    if (format !== 'all') filtered = filtered.filter(b => b.formats?.[format] && b.formats[format].length > 4)
    setResults(filtered)
    setSearched(true)
    setLoading(false)
  }

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Search bar */}
      <div style={{ padding: '16px 16px 10px', borderBottom: '0.5px solid var(--border)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--surface)', border: '0.5px solid var(--border)', borderRadius: 12, padding: '10px 14px', marginBottom: 12 }}>
          <span style={{ fontSize: 18, flexShrink: 0 }}>🔍</span>
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Título, autor..."
            style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: 'var(--text)', fontSize: 15, fontFamily: 'var(--font-sans)' }}
          />
          {query && <button onClick={() => setQuery('')} style={{ background: 'none', border: 'none', color: 'var(--dim)', fontSize: 18, cursor: 'pointer', flexShrink: 0 }}>×</button>}
        </div>

        {/* Format filter */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 8, overflowX: 'auto', scrollbarWidth: 'none' }}>
          {FORMATS.map(f => (
            <button key={f.key} onClick={() => setFormat(f.key)} style={{
              padding: '5px 12px', borderRadius: 20, border: 'none', cursor: 'pointer', flexShrink: 0, fontSize: 12, fontFamily: 'var(--font-sans)',
              background: format === f.key ? 'var(--gold)' : 'var(--surface)',
              color: format === f.key ? '#0f0e0c' : 'var(--muted)',
              fontWeight: format === f.key ? 500 : 400
            }}>{f.label}</button>
          ))}
        </div>

        {/* Genre filter */}
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', scrollbarWidth: 'none' }}>
          <button onClick={() => setGenre('all')} style={{ padding: '5px 12px', borderRadius: 20, border: 'none', cursor: 'pointer', flexShrink: 0, fontSize: 12, fontFamily: 'var(--font-sans)', background: genre === 'all' ? 'rgba(232,201,122,0.2)' : 'var(--surface)', color: genre === 'all' ? 'var(--gold)' : 'var(--muted)' }}>Todos gêneros</button>
          {genres.map(g => (
            <button key={g} onClick={() => setGenre(g)} style={{ padding: '5px 12px', borderRadius: 20, border: 'none', cursor: 'pointer', flexShrink: 0, fontSize: 12, fontFamily: 'var(--font-sans)', background: genre === g ? 'rgba(232,201,122,0.2)' : 'var(--surface)', color: genre === g ? 'var(--gold)' : 'var(--muted)' }}>{g}</button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}>
            <div style={{ width: 28, height: 28, border: '2px solid var(--border)', borderTop: '2px solid var(--gold)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : !searched ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--dim)' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
            <div style={{ fontSize: 14 }}>Digite para buscar livros</div>
            <div style={{ fontSize: 12, marginTop: 6 }}>ou filtre por gênero e formato</div>
          </div>
        ) : results.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--dim)' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>😕</div>
            <div style={{ fontSize: 14 }}>Nenhum livro encontrado</div>
            <div style={{ fontSize: 12, marginTop: 6 }}>Tente outros filtros</div>
          </div>
        ) : (
          <>
            <div style={{ fontSize: 12, color: 'var(--dim)', padding: '10px 0 4px' }}>{results.length} resultado{results.length !== 1 ? 's' : ''}</div>
            {results.map(book => (
              <BookRow key={book.id} book={book} onClick={() => navigate(`/book/${book.id}`)} />
            ))}
          </>
        )}
      </div>
    </div>
  )
}

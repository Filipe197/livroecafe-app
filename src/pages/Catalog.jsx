import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBooks, useCategories } from '../hooks/useBooks'

function Spinner() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 0' }}>
      <div style={{ width: 28, height: 28, border: '2px solid var(--border)', borderTop: '2px solid var(--gold)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

export default function Catalog() {
  const [activeCategory, setActiveCategory] = useState('Todos')
  const [search, setSearch] = useState('')
  const navigate = useNavigate()
  const categories = useCategories()
  const { books, loading } = useBooks(activeCategory)

  const filtered = books.filter(b =>
    b.title?.toLowerCase().includes(search.toLowerCase()) ||
    b.author?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="fade-in">
      <div style={{ padding: '14px 16px 10px' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 22, marginBottom: 12 }}>Catálogo</h1>
        <div style={{ background: 'var(--surface)', border: '0.5px solid var(--border)', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 8, padding: '9px 14px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--dim)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por título ou autor..."
            style={{ background: 'none', border: 'none', outline: 'none', fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--text)', width: '100%' }} />
          {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', color: 'var(--dim)', fontSize: 18, lineHeight: 1 }}>×</button>}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, padding: '0 16px 12px', overflowX: 'auto', scrollbarWidth: 'none' }}>
        {categories.map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat)} style={{
            background: activeCategory === cat ? 'var(--gold)' : 'var(--surface)',
            color: activeCategory === cat ? '#0f0e0c' : 'var(--muted)',
            fontWeight: activeCategory === cat ? 500 : 400,
            border: `0.5px solid ${activeCategory === cat ? 'var(--gold)' : 'var(--border)'}`,
            borderRadius: 16, padding: '6px 14px', fontSize: 12, whiteSpace: 'nowrap'
          }}>{cat}</button>
        ))}
      </div>

      {loading ? <Spinner /> : (
        <>
          <div style={{ padding: '0 16px 8px', fontSize: 12, color: 'var(--dim)' }}>
            {filtered.length} {filtered.length === 1 ? 'livro' : 'livros'}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, padding: '0 16px 8px' }}>
            {filtered.map(book => (
              <div key={book.id} onClick={() => navigate(`/book/${book.id}`)} style={{
                background: 'var(--surface)', border: '0.5px solid var(--border)',
                borderRadius: 10, overflow: 'hidden', cursor: 'pointer'
              }}>
                <div style={{ position: 'relative' }}>
                  <img src={book.cover_url} alt={book.title}
                    style={{ width: '100%', height: 180, objectFit: 'cover' }}
                    onError={e => { e.target.src = 'https://placehold.co/160x180/1a1916/e8c97a?text=📚' }} />
                  {book.is_new && (
                    <span style={{ position: 'absolute', top: 6, left: 6, background: '#d45a3a', color: '#fff', fontSize: 9, fontWeight: 500, padding: '2px 6px', borderRadius: 6 }}>Novo</span>
                  )}
                </div>
                <div style={{ padding: '8px 10px 10px' }}>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: 13, lineHeight: 1.3, marginBottom: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{book.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--dim)', marginBottom: 5 }}>{book.author}</div>
                  <span className="tag" style={{ fontSize: 10 }}>{book.genre}</span>
                </div>
              </div>
            ))}
          </div>
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--dim)' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>📚</div>
              <div style={{ fontSize: 14 }}>Nenhum livro encontrado</div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

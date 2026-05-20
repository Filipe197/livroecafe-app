import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBooks, useFeaturedBooks, useCategories } from '../hooks/useBooks'
import { SkeletonCard, SkeletonRow, SkeletonGrid, SkeletonFeatured } from '../components/Skeleton'

export default function Home() {
  const [activeCategory, setActiveCategory] = useState('Todos')
  const [search, setSearch] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const navigate = useNavigate()
  const categories = useCategories()
  const { books: featured, loading: loadingFeat } = useFeaturedBooks()
  const { books: allBooks, loading: loadingAll } = useBooks(activeCategory)

  const newBooks = allBooks.filter(b => b.is_new)
  const filtered = search
    ? allBooks.filter(b =>
        b.title?.toLowerCase().includes(search.toLowerCase()) ||
        b.author?.toLowerCase().includes(search.toLowerCase()))
    : []

  return (
    <div className="fade-in">
      {/* Top Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px 10px' }}>
        <span style={{ fontFamily: 'var(--font-serif)', fontSize: 17, color: 'var(--gold)', whiteSpace: 'nowrap' }}>☕ Livro & Café</span>
        {showSearch ? (
          <div style={{ flex: 1, background: 'var(--surface)', border: '0.5px solid var(--gold)', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--dim)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input autoFocus value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar livros..."
              style={{ background: 'none', border: 'none', outline: 'none', fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--text)', width: '100%' }} />
            <button onClick={() => { setShowSearch(false); setSearch('') }} style={{ background: 'none', border: 'none', color: 'var(--dim)', fontSize: 18, lineHeight: 1 }}>×</button>
          </div>
        ) : (
          <>
            <div style={{ flex: 1 }} />
            <button onClick={() => setShowSearch(true)} style={{ background: 'var(--surface)', border: '0.5px solid var(--border)', borderRadius: 20, padding: '7px 14px', color: 'var(--muted)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              Buscar
            </button>
            <button onClick={() => navigate('/auth')} style={{ background: 'var(--gold)', color: '#0f0e0c', fontSize: 12, fontWeight: 500, border: 'none', borderRadius: 16, padding: '7px 12px', whiteSpace: 'nowrap' }}>Assinar</button>
          </>
        )}
      </div>

      {search && (
        <div style={{ padding: '0 16px 8px' }}>
          <p className="section-label" style={{ margin: '0 0 8px' }}>Resultados para "{search}"</p>
          {filtered.length === 0
            ? <div style={{ color: 'var(--dim)', fontSize: 13, padding: '16px 0' }}>Nenhum livro encontrado</div>
            : filtered.map(book => <BookRow key={book.id} book={book} onClick={() => navigate(`/book/${book.id}`)} />)
          }
        </div>
      )}

      {!search && (
        <>
          {/* Categories */}
          <div style={{ display: 'flex', gap: 8, padding: '4px 16px 12px', overflowX: 'auto', scrollbarWidth: 'none' }}>
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

          {/* Featured */}
          <p className="section-label">✨ Destaques</p>
          {loadingFeat ? <SkeletonFeatured /> : (
            <div style={{ display: 'flex', gap: 10, padding: '0 16px 4px', overflowX: 'auto', scrollbarWidth: 'none' }}>
              {featured.map(book => (
                <div key={book.id} onClick={() => navigate(`/book/${book.id}`)} style={{ flex: '0 0 130px', borderRadius: 10, overflow: 'hidden', position: 'relative', cursor: 'pointer' }}>
                  <img src={book.cover_url} alt={book.title} style={{ width: '100%', height: 188, objectFit: 'cover' }}
                    onError={e => { e.target.src = 'https://placehold.co/130x188/1a1916/e8c97a?text=📚' }} />
                  {book.is_new && <span style={{ position: 'absolute', top: 8, left: 8, background: '#d45a3a', color: '#fff', fontSize: 9, fontWeight: 500, padding: '3px 7px', borderRadius: 8, textTransform: 'uppercase' }}>Novo</span>}
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.9))', padding: '20px 8px 8px' }}>
                    <div style={{ fontFamily: 'var(--font-serif)', fontSize: 12, lineHeight: 1.3, marginBottom: 2 }}>{book.title}</div>
                    <div style={{ fontSize: 10, color: 'var(--muted)' }}>{book.author}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Novidades */}
          {!loadingAll && newBooks.length > 0 && (
            <>
              <p className="section-label" style={{ marginTop: 12 }}>🔥 Novidades</p>
              <div style={{ display: 'flex', gap: 10, padding: '0 16px 4px', overflowX: 'auto', scrollbarWidth: 'none' }}>
                {newBooks.map(book => (
                  <div key={book.id} onClick={() => navigate(`/book/${book.id}`)} style={{ flex: '0 0 110px', cursor: 'pointer' }}>
                    <div style={{ position: 'relative', marginBottom: 6 }}>
                      <img src={book.cover_url} alt={book.title} style={{ width: 110, height: 155, objectFit: 'cover', borderRadius: 8 }}
                        onError={e => { e.target.src = 'https://placehold.co/110x155/1a1916/e8c97a?text=📚' }} />
                      <span style={{ position: 'absolute', top: 6, left: 6, background: '#d45a3a', color: '#fff', fontSize: 8, fontWeight: 500, padding: '2px 6px', borderRadius: 6 }}>NOVO</span>
                    </div>
                    <div style={{ fontFamily: 'var(--font-serif)', fontSize: 11, lineHeight: 1.3, marginBottom: 2, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{book.title}</div>
                    <div style={{ fontSize: 10, color: 'var(--dim)' }}>{book.author}</div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Library grid */}
          <p className="section-label" style={{ marginTop: 12 }}>
            {activeCategory === 'Todos' ? '📚 Biblioteca completa' : activeCategory}
          </p>
          {loadingAll ? <SkeletonGrid /> : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, padding: '0 16px 8px' }}>
              {allBooks.map(book => (
                <div key={book.id} onClick={() => navigate(`/book/${book.id}`)} style={{ cursor: 'pointer' }}>
                  <img src={book.cover_url} alt={book.title}
                    style={{ width: '100%', aspectRatio: '2/3', objectFit: 'cover', borderRadius: 7, marginBottom: 5 }}
                    onError={e => { e.target.src = 'https://placehold.co/100x150/1a1916/e8c97a?text=📚' }} />
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: 11, lineHeight: 1.3, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{book.title}</div>
                  <div style={{ fontSize: 10, color: 'var(--dim)', marginTop: 2 }}>{book.author}</div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

function BookRow({ book, onClick }) {
  return (
    <div onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--surface)', border: '0.5px solid var(--border)', borderRadius: 10, padding: 10, marginBottom: 8, cursor: 'pointer' }}>
      <img src={book.cover_url} alt={book.title} style={{ width: 46, height: 66, borderRadius: 5, objectFit: 'cover', flexShrink: 0 }} onError={e => { e.target.src = 'https://placehold.co/46x66/1a1916/e8c97a?text=📚' }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: 13, fontWeight: 600, marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{book.title}</div>
        <div style={{ fontSize: 11, color: 'var(--dim)', marginBottom: 5 }}>{book.author}</div>
        <div style={{ display: 'flex', gap: 4 }}>
          {book.genre && <span className="tag">{book.genre}</span>}
          {book.is_new && <span className="tag" style={{ background: 'rgba(212,90,58,0.15)', color: '#d45a3a' }}>Novo</span>}
        </div>
      </div>
    </div>
  )
}

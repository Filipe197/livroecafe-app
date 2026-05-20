import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'
import { useAllReadingProgress } from '../hooks/useFavorites'
import { useBooks } from '../hooks/useBooks'
import { useState } from 'react'

function Spinner() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}>
      <div style={{ width: 28, height: 28, border: '2px solid var(--border)', borderTop: '2px solid var(--gold)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

function BookCard({ book, onClick }) {
  return (
    <div onClick={onClick} style={{ flex: '0 0 120px', cursor: 'pointer' }}>
      <div style={{ position: 'relative', marginBottom: 6 }}>
        <img src={book.cover_url} alt={book.title}
          style={{ width: 120, height: 170, objectFit: 'cover', borderRadius: 8 }}
          onError={e => { e.target.src = 'https://placehold.co/120x170/1a1916/e8c97a?text=📚' }} />
        {book.is_new && (
          <span style={{ position: 'absolute', top: 6, left: 6, background: '#d45a3a', color: '#fff', fontSize: 8, fontWeight: 500, padding: '2px 6px', borderRadius: 6 }}>NOVO</span>
        )}
      </div>
      <div style={{ fontFamily: 'var(--font-serif)', fontSize: 11, lineHeight: 1.3, marginBottom: 2, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{book.title}</div>
      <div style={{ fontSize: 10, color: 'var(--dim)' }}>{book.author}</div>
    </div>
  )
}

export default function Explore() {
  const { user } = useAuth()
  const { allProgress } = useAllReadingProgress()
  const { books: allBooks, loading } = useBooks('Todos')
  const [formatFilter, setFormatFilter] = useState('todos')
  const navigate = useNavigate()

  // Get genres the user has read
  const readGenres = [...new Set(
    allProgress.map(p => p.books?.genre).filter(Boolean)
  )]

  // Recommend based on read genres
  const readBookIds = new Set(allProgress.map(p => p.book_id))
  const recommended = readGenres.length > 0
    ? allBooks.filter(b => !readBookIds.has(b.id) && readGenres.includes(b.genre))
    : allBooks.filter(b => b.featured)

  // Format filter
  const formatFiltered = allBooks.filter(b => {
    if (formatFilter === 'epub') return b.formats?.epub && b.formats.epub.length > 4
    if (formatFilter === 'pdf') return b.formats?.pdf && b.formats.pdf.length > 4
    return true
  })

  // Genre groups
  const byGenre = {}
  allBooks.forEach(b => {
    if (!b.genre) return
    if (!byGenre[b.genre]) byGenre[b.genre] = []
    byGenre[b.genre].push(b)
  })

  return (
    <div className="fade-in">
      <div style={{ padding: '20px 16px 10px' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 22, marginBottom: 4 }}>Explorar</h1>
        <p style={{ fontSize: 13, color: 'var(--dim)' }}>Descubra seu próximo livro favorito</p>
      </div>

      {/* Format filter */}
      <div style={{ display: 'flex', gap: 8, padding: '8px 16px 12px' }}>
        {[
          { id: 'todos', label: '📚 Todos' },
          { id: 'epub', label: '📖 EPUB' },
          { id: 'pdf', label: '📄 PDF' },
        ].map(f => (
          <button key={f.id} onClick={() => setFormatFilter(f.id)} style={{
            background: formatFilter === f.id ? 'var(--gold)' : 'var(--surface)',
            color: formatFilter === f.id ? '#0f0e0c' : 'var(--muted)',
            fontWeight: formatFilter === f.id ? 500 : 400,
            border: `0.5px solid ${formatFilter === f.id ? 'var(--gold)' : 'var(--border)'}`,
            borderRadius: 16, padding: '7px 16px', fontSize: 12
          }}>{f.label}</button>
        ))}
      </div>

      {loading ? <Spinner /> : (
        <>
          {/* Format filtered results */}
          {formatFilter !== 'todos' && (
            <>
              <p className="section-label">{formatFilter === 'epub' ? '📖 Disponível em EPUB' : '📄 Disponível em PDF'}</p>
              <div style={{ display: 'flex', gap: 10, padding: '0 16px 4px', overflowX: 'auto', scrollbarWidth: 'none' }}>
                {formatFiltered.map(book => <BookCard key={book.id} book={book} onClick={() => navigate(`/book/${book.id}`)} />)}
              </div>
              {formatFiltered.length === 0 && (
                <div style={{ padding: '16px 16px', color: 'var(--dim)', fontSize: 13 }}>Nenhum livro encontrado com esse formato</div>
              )}
            </>
          )}

          {formatFilter === 'todos' && (
            <>
              {/* Personalized recommendations */}
              {user && (
                <>
                  <p className="section-label">
                    {readGenres.length > 0 ? '🎯 Recomendados para você' : '⭐ Em destaque'}
                  </p>
                  {readGenres.length > 0 && (
                    <div style={{ padding: '0 16px 4px', marginBottom: 4 }}>
                      <div style={{ fontSize: 11, color: 'var(--dim)', marginBottom: 8 }}>
                        Baseado nos seus interesses: {readGenres.join(', ')}
                      </div>
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 10, padding: '0 16px 4px', overflowX: 'auto', scrollbarWidth: 'none' }}>
                    {(recommended.length > 0 ? recommended : allBooks.filter(b => b.featured)).slice(0, 10).map(book => (
                      <BookCard key={book.id} book={book} onClick={() => navigate(`/book/${book.id}`)} />
                    ))}
                  </div>
                </>
              )}

              {/* Not logged in — show popular */}
              {!user && (
                <>
                  <p className="section-label">⭐ Mais populares</p>
                  <div style={{ display: 'flex', gap: 10, padding: '0 16px 4px', overflowX: 'auto', scrollbarWidth: 'none' }}>
                    {allBooks.filter(b => b.featured).slice(0, 8).map(book => (
                      <BookCard key={book.id} book={book} onClick={() => navigate(`/book/${book.id}`)} />
                    ))}
                  </div>
                  <div style={{ margin: '12px 16px', background: 'rgba(232,201,122,0.08)', border: '0.5px solid rgba(232,201,122,0.2)', borderRadius: 10, padding: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 28 }}>🎯</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 2 }}>Recomendações personalizadas</div>
                      <div style={{ fontSize: 11, color: 'var(--dim)', marginBottom: 8 }}>Faça login para ver livros baseados no seu histórico</div>
                      <button onClick={() => navigate('/auth')} style={{ background: 'var(--gold)', color: '#0f0e0c', border: 'none', borderRadius: 8, padding: '6px 14px', fontSize: 12, fontWeight: 500 }}>Entrar</button>
                    </div>
                  </div>
                </>
              )}

              {/* By genre */}
              {Object.entries(byGenre).map(([genre, books]) => (
                <div key={genre}>
                  <p className="section-label">{genre}</p>
                  <div style={{ display: 'flex', gap: 10, padding: '0 16px 4px', overflowX: 'auto', scrollbarWidth: 'none' }}>
                    {books.slice(0, 8).map(book => (
                      <BookCard key={book.id} book={book} onClick={() => navigate(`/book/${book.id}`)} />
                    ))}
                  </div>
                </div>
              ))}
            </>
          )}
        </>
      )}
    </div>
  )
}

import { useParams, useNavigate } from 'react-router-dom'
import { useBook, useBooks } from '../hooks/useBooks'
import { useFavorites, useReadingProgress } from '../hooks/useFavorites'
import HeartButton from '../components/HeartButton'
import { useAuth } from '../hooks/useAuth.jsx'

function Spinner() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
      <div style={{ width: 28, height: 28, border: '2px solid var(--border)', borderTop: '2px solid var(--gold)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

export default function BookDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { book, loading } = useBook(id)
  const { user } = useAuth()
  const { isFavorite, toggleFavorite } = useFavorites()
  const { progress } = useReadingProgress(id)
  const { books: allBooks } = useBooks('Todos')

  if (loading) return <Spinner />
  if (!book) return <div style={{ padding: 32, textAlign: 'center', color: 'var(--dim)' }}>Livro não encontrado</div>

  const fav = isFavorite(book.id)
  const formats = book.formats ? Object.keys(book.formats).filter(f => book.formats[f] && book.formats[f].length > 4) : []

  // Similar books — same genre, different book
  const similar = allBooks.filter(b => b.id !== book.id && b.genre === book.genre).slice(0, 8)

  async function handleFavorite() {
    if (!user) { navigate('/auth'); return }
    await toggleFavorite(book.id)
  }

  return (
    <div className="fade-in">
      {/* Back */}
      <div style={{ padding: '14px 16px 0' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'var(--surface)', border: '0.5px solid var(--border)', borderRadius: 20, padding: '6px 14px', color: 'var(--muted)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          Voltar
        </button>
      </div>

      {/* Hero */}
      <div style={{ display: 'flex', gap: 16, padding: '16px 16px 0' }}>
        <img src={book.cover_url} alt={book.title}
          style={{ width: 110, height: 158, borderRadius: 8, objectFit: 'cover', flexShrink: 0, boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}
          onError={e => { e.target.src = 'https://placehold.co/110x158/1a1916/e8c97a?text=📚' }} />
        <div style={{ flex: 1, paddingTop: 4 }}>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 19, lineHeight: 1.3, marginBottom: 6 }}>{book.title}</h1>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 10 }}>{book.author}</p>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
            {book.genre && <span className="tag">{book.genre}</span>}
            {book.is_new && <span className="tag" style={{ background: 'rgba(212,90,58,0.15)', color: '#d45a3a' }}>Novo</span>}
          </div>
          {/* Formats */}
          {formats.length > 0 && (
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {formats.map(f => (
                <span key={f} style={{ fontSize: 10, background: 'rgba(232,201,122,0.12)', color: 'var(--gold)', padding: '2px 8px', borderRadius: 8, border: '0.5px solid rgba(232,201,122,0.3)', textTransform: 'uppercase' }}>{f}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Progress */}
      {progress?.progress_percent > 0 && (
        <div style={{ margin: '16px 16px 0', background: 'var(--surface)', border: '0.5px solid var(--border)', borderRadius: 10, padding: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>
            <span>Seu progresso</span><span style={{ color: 'var(--gold)' }}>{progress.progress_percent}%</span>
          </div>
          <div style={{ height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ width: `${progress.progress_percent}%`, height: '100%', background: 'var(--gold)', borderRadius: 2 }} />
          </div>
        </div>
      )}

      {/* Sinopse */}
      {book.description && (
        <div style={{ padding: '16px 16px 0' }}>
          <p className="section-label" style={{ padding: 0, margin: '0 0 8px' }}>Sinopse</p>
          <p style={{ fontSize: 14, lineHeight: 1.75, color: 'var(--muted)' }}>{book.description}</p>
        </div>
      )}

      {/* Actions */}
      <div style={{ padding: '20px 16px 0', display: 'flex', gap: 10 }}>
        <button onClick={() => navigate(`/read/${book.id}`)} style={{ flex: 1, background: 'var(--gold)', color: '#0f0e0c', border: 'none', borderRadius: 12, padding: '13px 0', fontWeight: 500, fontSize: 14 }}>
          {progress?.progress_percent > 0 ? '▶ Continuar leitura' : '📖 Ler agora'}
        </button>
        <button onClick={handleFavorite} style={{ width: 48, background: fav ? 'rgba(232,201,122,0.15)' : 'var(--surface)', border: `0.5px solid ${fav ? 'var(--gold)' : 'var(--border)'}`, borderRadius: 12, fontSize: 20, color: fav ? 'var(--gold)' : 'var(--muted)', transition: 'all 0.2s' }}>
          {fav ? '♥' : '♡'}
        </button>
      </div>

      {/* Similar books */}
      {similar.length > 0 && (
        <>
          <p className="section-label" style={{ marginTop: 16 }}>📚 Livros similares</p>
          <div style={{ display: 'flex', gap: 10, padding: '0 16px 24px', overflowX: 'auto', scrollbarWidth: 'none' }}>
            {similar.map(b => (
              <div key={b.id} onClick={() => navigate(`/book/${b.id}`)} style={{ flex: '0 0 100px', cursor: 'pointer' }}>
                <img src={b.cover_url} alt={b.title}
                  style={{ width: 100, height: 142, objectFit: 'cover', borderRadius: 7, marginBottom: 5 }}
                  onError={e => { e.target.src = 'https://placehold.co/100x142/1a1916/e8c97a?text=📚' }} />
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: 11, lineHeight: 1.3, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{b.title}</div>
                <div style={{ fontSize: 10, color: 'var(--dim)', marginTop: 2 }}>{b.author}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

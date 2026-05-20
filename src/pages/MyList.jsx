import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'
import { useFavorites } from '../hooks/useFavorites'

export default function MyList() {
  const { user } = useAuth()
  const { favorites, loading, toggleFavorite } = useFavorites()
  const navigate = useNavigate()

  if (!user) return (
    <div className="fade-in" style={{ padding: 32, textAlign: 'center' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🔖</div>
      <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 20, marginBottom: 8 }}>Minha lista</h2>
      <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 24 }}>Faça login para salvar seus livros favoritos</p>
      <button onClick={() => navigate('/auth')} style={{
        background: 'var(--gold)', color: '#0f0e0c', border: 'none',
        borderRadius: 12, padding: '12px 32px', fontWeight: 500, fontSize: 14
      }}>Entrar / Criar conta</button>
    </div>
  )

  return (
    <div className="fade-in">
      <div style={{ padding: '20px 16px 10px' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 22, marginBottom: 4 }}>Minha lista</h1>
        <p style={{ fontSize: 12, color: 'var(--dim)' }}>{favorites.length} {favorites.length === 1 ? 'livro salvo' : 'livros salvos'}</p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}>
          <div style={{ width: 28, height: 28, border: '2px solid var(--border)', borderTop: '2px solid var(--gold)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : favorites.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 24px', color: 'var(--dim)' }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>📚</div>
          <div style={{ fontSize: 14, marginBottom: 6 }}>Nenhum livro salvo ainda</div>
          <div style={{ fontSize: 12 }}>Toque no ♡ na página do livro para salvar</div>
          <button onClick={() => navigate('/catalog')} style={{
            marginTop: 20, background: 'var(--gold)', color: '#0f0e0c',
            border: 'none', borderRadius: 12, padding: '10px 24px', fontSize: 13, fontWeight: 500
          }}>Ver catálogo</button>
        </div>
      ) : (
        <div style={{ padding: '0 16px 8px' }}>
          {favorites.map(f => (
            <div key={f.id} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              background: 'var(--surface)', border: '0.5px solid var(--border)',
              borderRadius: 10, padding: 10, marginBottom: 8
            }}>
              <img src={f.books?.cover_url} alt={f.books?.title}
                onClick={() => navigate(`/book/${f.book_id}`)}
                style={{ width: 46, height: 66, borderRadius: 5, objectFit: 'cover', flexShrink: 0, cursor: 'pointer' }}
                onError={e => { e.target.src = 'https://placehold.co/46x66/1a1916/e8c97a?text=📚' }} />
              <div onClick={() => navigate(`/book/${f.book_id}`)} style={{ flex: 1, minWidth: 0, cursor: 'pointer' }}>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: 13, fontWeight: 600, marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.books?.title}</div>
                <div style={{ fontSize: 11, color: 'var(--dim)', marginBottom: 5 }}>{f.books?.author}</div>
                {f.books?.genre && <span className="tag">{f.books.genre}</span>}
              </div>
              <button onClick={() => toggleFavorite(f.book_id)} style={{
                background: 'none', border: 'none', fontSize: 20,
                color: '#e8c97a', flexShrink: 0, padding: '4px 8px'
              }}>♥</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Badge definitions
export const BADGES = [
  // Leitura
  { id: 'first_book',    emoji: '📖', name: 'Primeira Leitura',    desc: 'Completou seu primeiro livro',           condition: (s) => s.booksRead >= 1 },
  { id: 'five_books',    emoji: '📚', name: 'Leitor Dedicado',     desc: 'Completou 5 livros',                     condition: (s) => s.booksRead >= 5 },
  { id: 'ten_books',     emoji: '🏆', name: 'Devorador de Livros', desc: 'Completou 10 livros',                    condition: (s) => s.booksRead >= 10 },
  { id: 'twenty_books',  emoji: '👑', name: 'Mestre da Leitura',   desc: 'Completou 20 livros',                    condition: (s) => s.booksRead >= 20 },

  // Streak
  { id: 'streak_3',     emoji: '🔥', name: 'Em Chamas',           desc: 'Leu por 3 dias seguidos',                condition: (s) => s.streak >= 3 },
  { id: 'streak_7',     emoji: '⚡', name: 'Semana Completa',      desc: 'Leu por 7 dias seguidos',                condition: (s) => s.streak >= 7 },
  { id: 'streak_30',    emoji: '🌟', name: 'Leitor do Mês',        desc: 'Leu por 30 dias seguidos',               condition: (s) => s.streak >= 30 },

  // Favoritos
  { id: 'first_fav',    emoji: '❤️', name: 'Coração de Leitor',   desc: 'Adicionou o primeiro favorito',          condition: (s) => s.favorites >= 1 },
  { id: 'ten_favs',     emoji: '💝', name: 'Colecionador',         desc: 'Tem 10 livros favoritos',                condition: (s) => s.favorites >= 10 },

  // Especiais
  { id: 'night_owl',    emoji: '🦉', name: 'Coruja Noturna',       desc: 'Leu depois da meia-noite',               condition: (s) => s.nightReading },
  { id: 'early_bird',   emoji: '🌅', name: 'Madrugador',           desc: 'Leu antes das 6h da manhã',              condition: (s) => s.earlyReading },
  { id: 'speed_reader', emoji: '⚡', name: 'Leitor Veloz',          desc: 'Completou um livro em menos de 24h',    condition: (s) => s.speedReader },
  { id: 'explorer',     emoji: '🧭', name: 'Explorador',           desc: 'Leu livros de 5 gêneros diferentes',    condition: (s) => s.genres >= 5 },
  { id: 'first_login',  emoji: '☕', name: 'Bem-vindo ao Café',    desc: 'Fez login pela primeira vez',            condition: (s) => s.loggedIn },
]

export function checkBadges(stats) {
  return BADGES.filter(b => b.condition(stats))
}

export function getBadgeStats(allProgress, favorites, user) {
  const booksRead = allProgress.filter(p => p.progress_percent === 100).length
  const genres = new Set(allProgress.filter(p => p.progress_percent === 100).map(p => p.books?.genre).filter(Boolean)).size
  const now = new Date()
  const hour = now.getHours()

  return {
    booksRead,
    favorites: favorites.length,
    streak: 0, // would need daily tracking
    nightReading: hour >= 0 && hour < 4,
    earlyReading: hour >= 5 && hour < 7,
    speedReader: false,
    genres,
    loggedIn: !!user,
  }
}

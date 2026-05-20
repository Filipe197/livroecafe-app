import { useState, useEffect } from 'react'

export function useOnlineStatus() {
  const [online, setOnline] = useState(navigator.onLine)
  useEffect(() => {
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off) }
  }, [])
  return online
}

// Cache book data locally for offline reading
export function useCachedBooks() {
  function cacheBook(book) {
    try {
      const cached = JSON.parse(localStorage.getItem('cached_books') || '{}')
      cached[book.id] = { ...book, cachedAt: Date.now() }
      localStorage.setItem('cached_books', JSON.stringify(cached))
    } catch {}
  }

  function getCachedBook(id) {
    try {
      const cached = JSON.parse(localStorage.getItem('cached_books') || '{}')
      return cached[id] || null
    } catch { return null }
  }

  function getCachedBooks() {
    try {
      return Object.values(JSON.parse(localStorage.getItem('cached_books') || '{}'))
    } catch { return [] }
  }

  return { cacheBook, getCachedBook, getCachedBooks }
}

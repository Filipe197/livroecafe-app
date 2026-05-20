import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export function useFavorites() {
  const { user } = useAuth()
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchFavorites = useCallback(async () => {
    if (!user) { setFavorites([]); setLoading(false); return }
    const { data } = await supabase
      .from('favorites')
      .select('*, books(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setFavorites(data || [])
    setLoading(false)
  }, [user])

  useEffect(() => { fetchFavorites() }, [fetchFavorites])

  const isFavorite = (bookId) => favorites.some(f => f.book_id === bookId)

  const toggleFavorite = async (bookId) => {
    if (!user) return false
    if (isFavorite(bookId)) {
      await supabase.from('favorites').delete().eq('user_id', user.id).eq('book_id', bookId)
      setFavorites(f => f.filter(fav => fav.book_id !== bookId))
    } else {
      const { data } = await supabase.from('favorites').insert({ user_id: user.id, book_id: bookId }).select('*, books(*)').single()
      if (data) setFavorites(f => [data, ...f])
    }
    return true
  }

  return { favorites, loading, isFavorite, toggleFavorite, refetch: fetchFavorites }
}

export function useReadingProgress(bookId) {
  const { user } = useAuth()
  const [progress, setProgress] = useState(null)

  useEffect(() => {
    if (!user || !bookId) return
    supabase.from('reading_progress')
      .select('*').eq('user_id', user.id).eq('book_id', bookId).single()
      .then(({ data }) => setProgress(data))
  }, [user, bookId])

  const saveProgress = async (percent, position = '') => {
    if (!user || !bookId) return
    const { data } = await supabase.from('reading_progress').upsert({
      user_id: user.id, book_id: bookId,
      progress_percent: percent, current_position: position, last_read: new Date().toISOString()
    }, { onConflict: 'user_id,book_id' }).select().single()
    if (data) setProgress(data)
  }

  return { progress, saveProgress }
}

export function useAllReadingProgress() {
  const { user } = useAuth()
  const [allProgress, setAllProgress] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { setAllProgress([]); setLoading(false); return }
    supabase.from('reading_progress')
      .select('*, books(*)')
      .eq('user_id', user.id)
      .order('last_read', { ascending: false })
      .then(({ data }) => {
        setAllProgress(data || [])
        setLoading(false)
      })
  }, [user])

  return { allProgress, loading }
}

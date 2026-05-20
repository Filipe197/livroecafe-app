import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useBooks(category = 'Todos') {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchBooks() {
      setLoading(true)
      try {
        let query = supabase.from('books').select('*').order('is_new', { ascending: false })
        if (category && category !== 'Todos') {
          query = query.ilike('genre', `%${category}%`)
        }
        const { data, error } = await query
        if (error) throw error
        setBooks(data || [])
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchBooks()
  }, [category])

  return { books, loading, error }
}

export function useBook(id) {
  const [book, setBook] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    async function fetchBook() {
      const { data } = await supabase.from('books').select('*').eq('id', id).single()
      setBook(data)
      setLoading(false)
    }
    fetchBook()
  }, [id])

  return { book, loading }
}

export function useCategories() {
  const [categories, setCategories] = useState(['Todos'])
  useEffect(() => {
    async function fetch() {
      const { data } = await supabase.from('books').select('genre')
      if (data) {
        const unique = ['Todos', ...new Set(data.map(b => b.genre).filter(Boolean))]
        setCategories(unique)
      }
    }
    fetch()
  }, [])
  return categories
}

export function useFeaturedBooks() {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    async function fetch() {
      const { data } = await supabase.from('books').select('*').eq('featured', true).limit(8)
      setBooks(data || [])
      setLoading(false)
    }
    fetch()
  }, [])
  return { books, loading }
}

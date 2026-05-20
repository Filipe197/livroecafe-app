import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth.jsx'

export function useStreak() {
  const { user } = useAuth()
  const [streak, setStreak] = useState(0)
  const [todayRead, setTodayRead] = useState(false)

  useEffect(() => {
    if (!user) return
    calcStreak()
  }, [user])

  async function calcStreak() {
    const { data } = await supabase
      .from('reading_progress')
      .select('last_read')
      .eq('user_id', user.id)
      .order('last_read', { ascending: false })

    if (!data || data.length === 0) { setStreak(0); return }

    // Get unique days with reading activity
    const days = [...new Set(data.map(r => new Date(r.last_read).toDateString()))]
    const today = new Date().toDateString()
    const yesterday = new Date(Date.now() - 86400000).toDateString()

    setTodayRead(days.includes(today))

    // Count streak
    let count = 0
    let checkDate = days.includes(today) ? new Date() : new Date(Date.now() - 86400000)

    for (let i = 0; i < 365; i++) {
      const dateStr = checkDate.toDateString()
      if (days.includes(dateStr)) {
        count++
        checkDate = new Date(checkDate.getTime() - 86400000)
      } else {
        break
      }
    }

    setStreak(count)
  }

  return { streak, todayRead }
}

import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

export function useSwipeBack(enabled = true) {
  const navigate = useNavigate()
  const touchStartX = useRef(null)
  const touchStartY = useRef(null)

  useEffect(() => {
    if (!enabled) return
    function onTouchStart(e) {
      touchStartX.current = e.touches[0].clientX
      touchStartY.current = e.touches[0].clientY
    }
    function onTouchEnd(e) {
      if (touchStartX.current === null) return
      const dx = e.changedTouches[0].clientX - touchStartX.current
      const dy = Math.abs(e.changedTouches[0].clientY - touchStartY.current)
      if (touchStartX.current <= 40 && dx > 60 && dy < 80) navigate(-1)
      touchStartX.current = null
    }
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchend', onTouchEnd, { passive: true })
    return () => {
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchend', onTouchEnd)
    }
  }, [enabled, navigate])
}

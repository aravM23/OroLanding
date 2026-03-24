import { useEffect, useRef, useState } from 'react'

export default function useParallax(speed = 0.3) {
  const ref = useRef(null)
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    let ticking = false

    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        const rect = node.getBoundingClientRect()
        const viewH = window.innerHeight
        const center = rect.top + rect.height / 2 - viewH / 2
        setOffset(center * speed * -1)
        ticking = false
      })
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()

    return () => window.removeEventListener('scroll', onScroll)
  }, [speed])

  return { ref, offset }
}

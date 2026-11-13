import { useEffect } from 'react'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'
import { gsap, ScrollTrigger } from './gsap'

// Height of the fixed navbar, so anchor links don't land underneath it.
const NAV_OFFSET = -72

/**
 * Lenis smooth scroll, driven by GSAP's ticker so ScrollTrigger animations
 * stay perfectly in sync. Lenis (1.3.26+) turns itself off when the visitor
 * prefers reduced motion.
 */
export function useSmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.1,
      anchors: { offset: NAV_OFFSET, duration: 1.2 },
    })

    lenis.on('scroll', ScrollTrigger.update)
    const tick = (time) => lenis.raf(time * 1000) // GSAP time is in seconds
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(tick)
      lenis.destroy()
    }
  }, [])
}

import { useEffect, useRef } from 'react'
import { ScrollTrigger, motionOK } from '../animations/gsap'

// Mounts the three.js particle layer. three.js is imported lazily so it lands
// in its own chunk and the page text/video show up first.
export default function HeroCanvas() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    let scene
    let trigger
    let observer
    let cancelled = false

    // Skip entirely if WebGL isn't available — the video still looks fine
    const test = document.createElement('canvas')
    if (!(test.getContext('webgl2') || test.getContext('webgl'))) return

    import('../three/heroScene').then(({ createHeroScene }) => {
      if (cancelled) return
      scene = createHeroScene(canvas, { reducedMotion: !motionOK() })

      const hero = canvas.closest('.hero')
      trigger = ScrollTrigger.create({
        trigger: hero,
        start: 'top top',
        end: 'bottom top',
        onUpdate: (self) => scene.setScroll(self.progress),
      })

      // Don't spend battery when the hero is off-screen
      observer = new IntersectionObserver(([entry]) =>
        entry.isIntersecting ? scene.start() : scene.stop()
      )
      observer.observe(hero)
    })

    return () => {
      cancelled = true
      observer?.disconnect()
      trigger?.kill()
      scene?.dispose()
    }
  }, [])

  return <canvas ref={canvasRef} className="hero__canvas" aria-hidden />
}

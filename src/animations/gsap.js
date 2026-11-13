// Shared GSAP setup — every section imports gsap from here so plugins
// are registered once.
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger, useGSAP)
gsap.defaults({ ease: 'power3.out', duration: 0.9 })

export { gsap, ScrollTrigger, useGSAP }

/** False when the visitor asked their OS for reduced motion. */
export function motionOK() {
  return (
    typeof window !== 'undefined' &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

/** ScrollTrigger config for "play once when this enters the viewport". */
export const onEnter = (trigger, start = 'top 82%') => ({ trigger, start, once: true })

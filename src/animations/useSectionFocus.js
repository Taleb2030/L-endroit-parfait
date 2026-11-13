import { gsap, useGSAP } from './gsap'

/**
 * "Spotlight" scrolling: each section comes into focus as it reaches the
 * middle of the screen and gently dims as it scrolls away, so the eye is
 * always drawn to one section at a time.
 */
export function useSectionFocus() {
  useGSAP(() => {
    const mm = gsap.matchMedia()

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.utils.toArray('main > section:not(.hero) > .container').forEach((content) => {
        const section = content.parentElement

        // Coming in: from faded & slightly small → full strength & full size
        gsap.fromTo(
          content,
          { opacity: 0.35, scale: 0.96 },
          {
            opacity: 1,
            scale: 1,
            ease: 'power2.out',
            scrollTrigger: { trigger: section, start: 'top 95%', end: 'top 45%', scrub: 0.6 },
          }
        )

        // Going out: dim a little so the next section takes the spotlight
        gsap.fromTo(
          content,
          { opacity: 1, scale: 1 },
          {
            opacity: 0.45,
            scale: 0.97,
            ease: 'power1.in',
            immediateRender: false,
            scrollTrigger: { trigger: section, start: 'bottom 40%', end: 'bottom top', scrub: 0.6 },
          }
        )
      })
    })

    return () => mm.revert()
  })
}

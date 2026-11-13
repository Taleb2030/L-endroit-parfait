import { useRef } from 'react'
import { gsap, useGSAP, motionOK, onEnter } from '../animations/gsap'
import SplitWords from './SplitWords'

export default function SectionHeader({ label, title, subtitle, centered = false }) {
  const ref = useRef(null)

  useGSAP(
    () => {
      if (!motionOK()) return
      const tl = gsap
        .timeline({ scrollTrigger: onEnter(ref.current, 'top 85%') })
        .from('.section-label', { y: 16, scale: 0.9, autoAlpha: 0, duration: 0.6, ease: 'back.out(2)' })
        .from('.split-word', { yPercent: 115, duration: 1, ease: 'power4.out', stagger: 0.06 }, '-=0.3')
        .from('.section-header__line', { scaleX: 0, duration: 1.1, ease: 'power3.inOut' }, '-=0.7')
      if (subtitle) tl.from('.section-subtitle', { y: 20, autoAlpha: 0, duration: 0.8 }, '-=0.8')
    },
    { scope: ref }
  )

  return (
    <header ref={ref} className={`section-header ${centered ? 'section-header--center' : ''}`}>
      <span className="section-label">{label}</span>
      <h2 className="section-title">
        <SplitWords text={title} />
      </h2>
      <span className="section-header__line" aria-hidden />
      {subtitle && <p className="section-subtitle">{subtitle}</p>}
    </header>
  )
}

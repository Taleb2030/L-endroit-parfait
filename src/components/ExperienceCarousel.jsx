import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { gsap, useGSAP, motionOK } from '../animations/gsap'
import SplitWords from './SplitWords'
import { assetUrl } from '../utils/assetUrl'
import { useRtl } from '../hooks/useRtl'
import Icon from './Icon'

const DISPLAY_S = 8 // seconds each photo stays on screen

const ITEMS = [
  { key: 'dining', image: 'assets/experience/dining.jpg' },
  { key: 'family', image: 'assets/experience/family.jpg' },
  { key: 'events', image: 'assets/experience/events.jpg' },
  { key: 'ambiance', image: 'assets/experience/ambiance.jpg' },
]

const FALLBACK = assetUrl('assets/restaurant.jpg')

export default function ExperienceCarousel() {
  const { t } = useTranslation()
  const isRtl = useRtl()
  const [index, setIndex] = useState(0)
  const [direction, setDirection] = useState(1)
  const [failed, setFailed] = useState({})
  const [paused, setPaused] = useState(false)
  const rootRef = useRef(null)
  const timer = useRef(null)
  const resumeTimer = useRef(null)

  const slideTl = useRef(null)

  const goTo = (next, dirHint) => {
    const count = ITEMS.length
    const target = ((next % count) + count) % count
    if (target === index) return
    setDirection(dirHint ?? (target > index ? 1 : -1))
    setIndex(target)
  }
  const goPrev = () => goTo(index - 1, -1)

  // Slide change: wipe the new photo in, slow zoom, words rise, timer restarts
  useGSAP(
    () => {
      const animate = motionOK()
      const slides = gsap.utils.toArray('.experience__slide')
      const incoming = slides[index]
      const side = direction * (isRtl ? -1 : 1)

      slides.forEach((slide, i) => {
        gsap.set(slide, { zIndex: i === index ? 2 : 1 })
      })

      // Stop the previous slide's animation and timer so they can't fire late
      slideTl.current?.kill()
      timer.current?.kill()

      if (animate) {
        slideTl.current = gsap
          .timeline({
            onComplete: () => slides.forEach((s, i) => i !== index && gsap.set(s, { autoAlpha: 0 })),
          })
          .fromTo(
            incoming,
            {
              autoAlpha: 1,
              clipPath: side > 0 ? 'inset(0% 0% 0% 100%)' : 'inset(0% 100% 0% 0%)',
            },
            { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.3, ease: 'power4.inOut' }
          )
          .fromTo(
            incoming.querySelector('img'),
            { scale: 1.3, xPercent: side * 6 },
            { scale: 1.06, xPercent: 0, duration: 1.6, ease: 'power3.out' },
            0
          )
          // Ken Burns: keep drifting while the slide is shown
          .to(incoming.querySelector('img'), { scale: 1.16, duration: DISPLAY_S, ease: 'sine.out' })
          .from('.experience__carousel-text .split-word', {
            yPercent: 115,
            duration: 0.9,
            ease: 'power4.out',
            stagger: 0.05,
          }, 0.35)
          .from('.experience__carousel-desc', { y: 18, autoAlpha: 0, duration: 0.8 }, 0.6)
      } else {
        slides.forEach((s, i) => gsap.set(s, { autoAlpha: i === index ? 1 : 0, clipPath: 'none' }))
      }

      // Timer bar drives autoplay; pausing the tween pauses the carousel
      timer.current = gsap.fromTo(
        '.experience__timer span',
        { scaleX: 0 },
        { scaleX: 1, duration: DISPLAY_S, ease: 'none', onComplete: () => goTo(index + 1, 1) }
      )
      if (paused) timer.current.pause() // still hovered after clicking an arrow
    },
    { scope: rootRef, dependencies: [index] }
  )

  const pause = () => {
    clearTimeout(resumeTimer.current)
    setPaused(true)
    timer.current?.pause()
  }
  const resume = () => {
    setPaused(false)
    timer.current?.resume()
  }

  const item = ITEMS[index]

  return (
    <div
      ref={rootRef}
      className="experience__carousel"
      onMouseEnter={pause}
      onMouseLeave={resume}
      onFocus={pause}
      onBlur={resume}
      onTouchStart={pause}
      onTouchEnd={() => {
        resumeTimer.current = setTimeout(resume, 10000)
      }}
    >
      <div className="experience__carousel-media">
        {ITEMS.map((entry, i) => (
          <div className="experience__slide" key={entry.key} aria-hidden={i !== index}>
            <img
              src={failed[entry.key] ? FALLBACK : assetUrl(entry.image)}
              alt={i === index ? t(`experience.items.${entry.key}.title`) : ''}
              className="experience__carousel-image"
              loading={i === 0 ? 'eager' : 'lazy'}
              onError={() => setFailed((prev) => ({ ...prev, [entry.key]: true }))}
            />
          </div>
        ))}

        <div className="experience__carousel-shade" aria-hidden />

        <button
          type="button"
          className="experience__carousel-arrow experience__carousel-arrow--prev"
          onClick={goPrev}
          aria-label={t('experience.prev')}
        >
          <Icon name={isRtl ? 'chevronRight' : 'chevronLeft'} size={22} />
        </button>
        <button
          type="button"
          className="experience__carousel-arrow experience__carousel-arrow--next"
          onClick={() => goTo(index + 1, 1)}
          aria-label={t('experience.next')}
        >
          <Icon name={isRtl ? 'chevronLeft' : 'chevronRight'} size={22} />
        </button>

        {paused && <span className="experience__carousel-paused">{t('experience.paused')}</span>}
      </div>

      <div className="experience__carousel-content">
        <div className="experience__carousel-text-slot">
          <div className="experience__carousel-text" key={item.key}>
            <h3 className="experience__carousel-title">
              <SplitWords text={t(`experience.items.${item.key}.title`)} />
            </h3>
            <p className="experience__carousel-desc">{t(`experience.items.${item.key}.desc`)}</p>
          </div>
        </div>

        <div className="experience__timer" aria-hidden>
          <span />
        </div>

        <div className="experience__carousel-dots" role="tablist" aria-label={t('experience.label')}>
          {ITEMS.map((entry, i) => (
            <button
              key={entry.key}
              type="button"
              role="tab"
              className={i === index ? 'active' : ''}
              aria-selected={i === index}
              aria-label={t(`experience.items.${entry.key}.title`)}
              onClick={() => goTo(i)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

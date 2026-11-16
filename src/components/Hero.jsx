import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import Logo from './Logo'
import Icon from './Icon'
import { gsap, ScrollTrigger, useGSAP, motionOK } from '../animations/gsap'
import { assetUrl } from '../utils/assetUrl'
import { createFrameSequence, drawCover } from '../utils/frameSequence'
import { whatsappLink } from '../config/contact'

const HERO_VIDEO = assetUrl('assets/videos/video1.mp4')

// Opening hours 12:00–00:00 in Nouakchott (UTC+0, no daylight saving)
const isOpenNow = () => new Date().getUTCHours() >= 12

function useOpenNow() {
  const [open, setOpen] = useState(isOpenNow)
  useEffect(() => {
    const id = setInterval(() => setOpen(isOpenNow()), 60_000)
    return () => clearInterval(id)
  }, [])
  return open
}

/**
 * Home — "scroll-scrubbed video" showcase.
 * The section is ~3 screens tall; its inner stage stays pinned while the food
 * video plays forward/backward with the scroll and three text chapters
 * crossfade. Reduced motion (or a video that can't be decoded) falls back to
 * the classic single-screen hero with a normal video.
 */
export default function Hero() {
  const { t } = useTranslation()
  const rootRef = useRef(null)
  const canvasRef = useRef(null)
  const videoRef = useRef(null)
  const progressRef = useRef(0)
  const [mode, setMode] = useState(() => (motionOK() ? 'scrub' : 'video'))
  const [loaded, setLoaded] = useState(0) // % of frames captured
  const [videoPaused, setVideoPaused] = useState(() => !motionOK())
  const open = useOpenNow()
  const scrub = mode === 'scrub'
  const title = t('hero.title')

  // Capture frames + draw the one matching the scroll position
  useEffect(() => {
    if (!scrub) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const small = window.innerWidth < 700
    const seq = createFrameSequence(HERO_VIDEO, {
      count: small ? 32 : 48,
      width: 1080, // capped at the video's own width
      onProgress: (n, total) => setLoaded(Math.round((n / total) * 100)),
    })
    seq.done.catch((err) => {
      console.warn('[hero] scroll video unavailable, using normal video:', err.message)
      setMode('video')
    })

    let shown = -1
    let current = 0
    let lastImg = null
    let visible = true

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 1.5)
      canvas.width = Math.round(canvas.clientWidth * dpr)
      canvas.height = Math.round(canvas.clientHeight * dpr)
      shown = -1 // force redraw
    }
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    resize()

    const tick = () => {
      if (!visible) return
      const target = progressRef.current * (seq.count - 1)
      // Ease toward the scroll position (frame-rate independent)
      current += (target - current) * (1 - Math.pow(1 - 0.18, gsap.ticker.deltaRatio(60)))
      const img = seq.nearest(current)
      const index = Math.round(current)
      if (img && (index !== shown || img !== lastImg)) {
        drawCover(ctx, img, canvas.width, canvas.height)
        shown = index
        lastImg = img
      }
    }
    gsap.ticker.add(tick)

    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting))
    io.observe(canvas)

    return () => {
      gsap.ticker.remove(tick)
      io.disconnect()
      ro.disconnect()
      seq.dispose()
    }
  }, [scrub])

  useGSAP(
    () => {
      if (!motionOK()) return

      // Intro sequence (first screen)
      gsap
        .timeline({ defaults: { ease: 'power3.out' } })
        .from('.hero__media', { scale: 1.15, autoAlpha: 0, duration: 1.8, ease: 'power2.out' })
        .from('.hero__logo-stage', { scale: 0.5, rotation: -12, autoAlpha: 0, duration: 1.1, ease: 'back.out(1.8)' }, 0.35)
        .from(
          '.hero__tagline',
          {
            y: 14,
            autoAlpha: 0,
            duration: 1,
            // Widening letters would break joined Arabic script
            ...(document.documentElement.dir === 'rtl' ? {} : { letterSpacing: '0.5em' }),
          },
          0.7
        )
        .from('.hero__char', { yPercent: 120, rotationX: -90, autoAlpha: 0, duration: 1.1, ease: 'power4.out', stagger: 0.035 }, 0.85)
        .from('.hero__subtitle', { y: 26, autoAlpha: 0, duration: 1 }, 1.25)
        .from('.hero__actions', { y: 24, autoAlpha: 0, duration: 0.9 }, 1.45)
        .from('.hero__meta > *', { y: 18, autoAlpha: 0, duration: 0.8, stagger: 0.1 }, 1.65)
        .from('.hero__corner', { scale: 0.4, autoAlpha: 0, duration: 1.2, ease: 'power4.out', stagger: 0.08 }, 0.6)
        .from('.hero__scroll, .hero__pause, .hero__rail', { autoAlpha: 0, duration: 0.8 }, 1.9)

      if (!scrub) {
        // Classic hero: content drifts up as you scroll away
        gsap.to('.hero__phase--1', {
          y: -90,
          autoAlpha: 0,
          ease: 'none',
          scrollTrigger: { trigger: rootRef.current, start: 'top top', end: '75% top', scrub: true },
        })
        return
      }

      // Scroll story: one timeline from 0 → 1 across the pinned section
      const tl = gsap.timeline({
        defaults: { ease: 'power2.inOut' },
        scrollTrigger: {
          trigger: rootRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.6,
          onUpdate: (self) => (progressRef.current = self.progress),
        },
      })
      tl.to('.hero__scroll-wrap', { autoAlpha: 0, duration: 0.06 }, 0.04)
        .to('.hero__phase--1', { autoAlpha: 0, y: -70, duration: 0.16 }, 0.1)
        .fromTo('.hero__phase--2', { autoAlpha: 0, y: 70 }, { autoAlpha: 1, y: 0, duration: 0.14 }, 0.3)
        .to('.hero__phase--2', { autoAlpha: 0, y: -70, duration: 0.14 }, 0.56)
        .fromTo('.hero__phase--3', { autoAlpha: 0, y: 70 }, { autoAlpha: 1, y: 0, duration: 0.14 }, 0.74)
        .fromTo('.hero__media', { scale: 1 }, { scale: 1.06, ease: 'none', duration: 1 }, 0)
        .fromTo('.hero__rail-fill', { scaleY: 0 }, { scaleY: 1, ease: 'none', duration: 1 }, 0)
        .set({}, {}, 1) // keep total length exactly 1
    },
    { scope: rootRef, dependencies: [scrub], revertOnUpdate: true }
  )

  // Text length/direction changes with the language — re-measure
  useEffect(() => {
    const id = requestAnimationFrame(() => ScrollTrigger.refresh())
    return () => cancelAnimationFrame(id)
  }, [mode])

  const toggleVideo = () => {
    const video = videoRef.current
    if (!video) return
    if (video.paused) {
      video.play().catch(() => {})
      setVideoPaused(false)
    } else {
      video.pause()
      setVideoPaused(true)
    }
  }

  const phases = [
    { key: 'kitchen', n: '02' },
    { key: 'reserve', n: '03' },
  ]

  return (
    <section id="home" className={`hero ${scrub ? 'hero--scrub' : ''}`} ref={rootRef}>
      <div className="hero__sticky">
        <div className="hero__media">
          <div className="hero__fallback hero__fallback--visible" aria-hidden />
          {scrub ? (
            <canvas ref={canvasRef} className="hero__frames" aria-hidden />
          ) : (
            <video
              ref={videoRef}
              className="hero__video"
              autoPlay={!videoPaused}
              muted
              loop
              playsInline
            >
              <source src={HERO_VIDEO} type="video/mp4" />
            </video>
          )}
          <div className="hero__overlay" />
          <div className="hero__grain" aria-hidden />
        </div>

        {/* Fine corner brackets — a menu-card style frame */}
        <div className="hero__frame" aria-hidden>
          <span className="hero__corner hero__corner--tl" />
          <span className="hero__corner hero__corner--tr" />
          <span className="hero__corner hero__corner--bl" />
          <span className="hero__corner hero__corner--br" />
        </div>

        {/* Chapter 1 — welcome */}
        <div className="hero__phase hero__phase--1 hero__content container">
          <div className="hero__logo-stage">
            <Logo className="hero__logo" variant="hero" />
          </div>
          <p className="hero__tagline">{t('hero.tagline')}</p>
          <h1 className="hero__title" aria-label={title}>
            {[...title].map((char, i) => (
              <span className="hero__char" key={`${i}-${char}`} aria-hidden>
                {char}
              </span>
            ))}
          </h1>
          <p className="hero__subtitle">{t('hero.subtitle')}</p>
          <div className="hero__actions">
            <a href="#contact" className="btn btn--gold btn--lg">
              {t('hero.cta')}
            </a>
            <a href="#menu" className="btn btn--outline">
              {t('hero.menuCta')}
            </a>
          </div>
          <ul className="hero__meta">
            <li className={`hero__status ${open ? 'is-open' : ''}`}>
              <span className="hero__status-dot" aria-hidden />
              {open ? t('hero.openNow') : t('hero.closedNow')}
            </li>
            <li>
              <Icon name="clock" size={16} />
              {t('contact.hoursValue')}
            </li>
            <li>
              <Icon name="pin" size={16} />
              {t('contact.address')}
            </li>
          </ul>
        </div>

        {/* Chapters 2 & 3 — only in the scroll story */}
        {scrub &&
          phases.map(({ key, n }) => (
            <div key={key} className={`hero__phase hero__phase--${n === '02' ? 2 : 3} hero__chapter container`}>
              <span className="hero__chapter-num">{n}</span>
              <p className="hero__tagline">{t(`hero.chapters.${key}.kicker`)}</p>
              <h2 className="hero__chapter-title">{t(`hero.chapters.${key}.title`)}</h2>
              <p className="hero__subtitle">{t(`hero.chapters.${key}.text`)}</p>
              {key === 'reserve' && (
                <div className="hero__actions">
                  <a
                    href={whatsappLink(t('contact.wa.message'))}
                    className="btn btn--wa btn--lg"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Icon name="whatsapp" size={20} />
                    {t('contact.wa.cta')}
                  </a>
                  <a href="#menu" className="btn btn--outline">
                    {t('hero.menuCta')}
                  </a>
                </div>
              )}
            </div>
          ))}

        {/* Scroll-story progress rail */}
        {scrub && (
          <div className="hero__rail" aria-hidden>
            <span className="hero__rail-fill" />
          </div>
        )}

        {/* Branded loader while frames are being prepared */}
        {scrub && loaded < 100 && (
          <div className={`hero__loader ${loaded > 0 ? 'is-started' : ''}`} aria-hidden>
            <span className="hero__loader-bar" style={{ transform: `scaleX(${loaded / 100})` }} />
          </div>
        )}

        {!scrub && (
          <button
            type="button"
            className="hero__pause"
            onClick={toggleVideo}
            aria-label={videoPaused ? t('gallery.play') : t('gallery.pause')}
          >
            <Icon name={videoPaused ? 'play' : 'pause'} size={16} />
          </button>
        )}

        <div className="hero__scroll-wrap">
          <a href="#about" className="hero__scroll" aria-label={t('hero.scroll')}>
            <span className="hero__scroll-mouse" aria-hidden>
              <span className="hero__scroll-wheel" />
            </span>
            <span className="hero__scroll-text">{t('hero.scroll')}</span>
          </a>
        </div>
      </div>
    </section>
  )
}

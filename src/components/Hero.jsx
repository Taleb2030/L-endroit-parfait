import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import Logo from './Logo'
import Icon from './Icon'
import { gsap, useGSAP, motionOK } from '../animations/gsap'
import { assetUrl } from '../utils/assetUrl'

const HERO_VIDEO = assetUrl('assets/videos/video1.mp4')

export default function Hero() {
  const { t } = useTranslation()
  const rootRef = useRef(null)
  const videoRef = useRef(null)
  const [useVideo, setUseVideo] = useState(true)
  const [videoPaused, setVideoPaused] = useState(() => !motionOK())

  const title = t('hero.title')

  useGSAP(
    () => {
      if (!motionOK()) return

      // Intro sequence
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
      tl.from('.hero__media', { scale: 1.25, autoAlpha: 0, duration: 2, ease: 'power2.out' })
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
        .from('.hero__char', {
          yPercent: 120,
          rotationX: -90,
          autoAlpha: 0,
          duration: 1.1,
          ease: 'power4.out',
          stagger: 0.035,
        }, 0.85)
        .from('.hero__subtitle', { y: 26, autoAlpha: 0, duration: 1 }, 1.25)
        .from('.hero__actions', { y: 24, autoAlpha: 0, duration: 0.9 }, 1.45)
        .from('.hero__scroll, .hero__pause', { autoAlpha: 0, duration: 0.8 }, 1.8)
        // Gentle float after the logo lands
        .to('.hero__logo-stage', { y: -7, duration: 2.6, ease: 'sine.inOut', repeat: -1, yoyo: true }, 1.5)

      // Parallax while scrolling out of the hero
      const scrollTrigger = { trigger: rootRef.current, start: 'top top', end: 'bottom top', scrub: true }
      gsap.to('.hero__video, .hero__fallback', { yPercent: 18, scale: 1.08, ease: 'none', scrollTrigger })
      gsap.to('.hero__content', { y: -90, autoAlpha: 0, ease: 'none', scrollTrigger: { ...scrollTrigger, end: '75% top' } })
    },
    { scope: rootRef }
  )

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

  return (
    <section id="home" className="hero" ref={rootRef}>
      <div className="hero__media">
        {useVideo ? (
          <video
            ref={videoRef}
            className="hero__video"
            autoPlay={!videoPaused}
            muted
            loop
            playsInline
            onError={() => setUseVideo(false)}
          >
            <source src={HERO_VIDEO} type="video/mp4" />
          </video>
        ) : null}
        <div className={`hero__fallback ${useVideo ? '' : 'hero__fallback--visible'}`} aria-hidden />
        <div className="hero__overlay" />
        <div className="hero__grain" aria-hidden />
      </div>

      <div className="hero__content container">
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
      </div>

      {useVideo && (
        <button
          type="button"
          className="hero__pause"
          onClick={toggleVideo}
          aria-label={videoPaused ? t('gallery.play') : t('gallery.pause')}
        >
          <Icon name={videoPaused ? 'play' : 'pause'} size={16} />
        </button>
      )}

      <a href="#about" className="hero__scroll" aria-label={t('hero.scroll')}>
        <span className="hero__scroll-line" />
      </a>
    </section>
  )
}

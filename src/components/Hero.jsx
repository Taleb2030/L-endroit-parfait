import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import Logo from './Logo'
import Icon from './Icon'
import { gsap, useGSAP, motionOK } from '../animations/gsap'
import { assetUrl } from '../utils/assetUrl'
import { whatsappLink } from '../config/contact'

const HOME_VIDEO = assetUrl('assets/videos/video1.mp4')

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
 * Home — one screen. Text on the left, the food video inside a tall arch on
 * the right, with a turning badge and a "chef's pick" card from the menu.
 */
export default function Hero() {
  const { t } = useTranslation()
  const rootRef = useRef(null)
  const videoRef = useRef(null)
  const [paused, setPaused] = useState(() => !motionOK())
  const open = useOpenNow()
  const title = t('hero.title')

  // Chef's pick = first main dish on the menu (updates with the menu data)
  const categories = t('menu.categories', { returnObjects: true })
  const pick = Array.isArray(categories) ? (categories[1] ?? categories[0])?.items?.[0] : null

  const badgeText = t('hero.badge')

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const rtl = document.documentElement.dir === 'rtl' ? -1 : 1

        // Intro
        gsap
          .timeline({ defaults: { ease: 'power3.out' }, delay: 0.15 })
          .fromTo(
            '.home__arch-clip',
            { clipPath: 'inset(100% 0% 0% 0%)' },
            { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'power4.inOut' }
          )
          .from('.home__video', { scale: 1.35, duration: 2, ease: 'power3.out' }, 0.2)
          .from('.home__arch-outline', { autoAlpha: 0, scale: 0.94, duration: 1.2 }, 0.6)
          .from('.home__sun', { scale: 0.4, autoAlpha: 0, duration: 1.6, ease: 'expo.out' }, 0.3)
          .from('.home__kicker', { y: 16, autoAlpha: 0, duration: 0.8 }, 0.35)
          .from('.home__char', { yPercent: 110, autoAlpha: 0, duration: 1, ease: 'power4.out', stagger: 0.03 }, 0.45)
          .from('.home__headline', { y: 24, autoAlpha: 0, duration: 0.9 }, 0.85)
          .from('.home__lead', { y: 20, autoAlpha: 0, duration: 0.9 }, 1)
          // Animate the wrapper, not the .btn elements: buttons have their own CSS
          // transitions, which can fight a tween and leave them invisible
          .from('.home__actions', { y: 18, autoAlpha: 0, duration: 0.8 }, 1.1)
          .from('.home__meta > *', { y: 14, autoAlpha: 0, duration: 0.7, stagger: 0.08 }, 1.25)
          .from('.home__badge', { scale: 0, rotation: -90 * rtl, duration: 1.1, ease: 'back.out(1.6)' }, 1)
          .from('.home__pick', { x: 40 * rtl, autoAlpha: 0, duration: 1, ease: 'power4.out' }, 1.2)
          .from('.home__scroll', { autoAlpha: 0, duration: 0.8 }, 1.6)

        // Scroll: badge turns, arch and text drift at different speeds
        const st = { trigger: rootRef.current, start: 'top top', end: 'bottom top', scrub: 0.6 }
        gsap.to('.home__badge-ring', { rotation: 140 * rtl, ease: 'none', scrollTrigger: st })
        gsap.to('.home__visual', { yPercent: -10, ease: 'none', scrollTrigger: st })
        gsap.to('.home__text', { yPercent: 8, autoAlpha: 0.2, ease: 'none', scrollTrigger: st })

        // 3D tilt of the arch toward the pointer (desktop only)
        const visual = rootRef.current.querySelector('.home__arch')
        const rx = gsap.quickTo(visual, 'rotationX', { duration: 0.8, ease: 'power3.out' })
        const ry = gsap.quickTo(visual, 'rotationY', { duration: 0.8, ease: 'power3.out' })
        const onMove = (e) => {
          if (e.pointerType !== 'mouse') return
          rx(((e.clientY / window.innerHeight) - 0.5) * -8)
          ry(((e.clientX / window.innerWidth) - 0.5) * 10)
        }
        window.addEventListener('pointermove', onMove)
        return () => window.removeEventListener('pointermove', onMove)
      })
      return () => mm.revert()
    },
    { scope: rootRef }
  )

  const toggleVideo = () => {
    const video = videoRef.current
    if (!video) return
    if (video.paused) {
      video.play().catch(() => {})
      setPaused(false)
    } else {
      video.pause()
      setPaused(true)
    }
  }

  return (
    <section id="home" className="home" ref={rootRef}>
      <div className="home__bg" aria-hidden>
        <span className="home__sun" />
        <span className="home__dots" />
      </div>

      <div className="container home__grid">
        <div className="home__text">
          <p className="home__kicker">{t('hero.kicker')}</p>

          <h1 className="home__title" aria-label={title}>
            {[...title].map((char, i) => (
              <span className="home__char-mask" key={`${i}-${char}`} aria-hidden>
                <span className="home__char">{char}</span>
              </span>
            ))}
          </h1>

          <p className="home__headline">{t('hero.headline')}</p>
          <p className="home__lead">{t('hero.lead')}</p>

          <div className="home__actions">
            <a
              href={whatsappLink(t('contact.wa.message'))}
              className="btn btn--gold btn--lg"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Icon name="whatsapp" size={20} />
              {t('hero.ctaWhatsapp')}
            </a>
            <a href="#menu" className="btn home__link">
              {t('hero.menuCta')}
              <Icon name="chevronRight" size={18} className="home__link-arrow" />
            </a>
          </div>

          <ul className="home__meta">
            <li className={`home__status ${open ? 'is-open' : ''}`}>
              <span className="home__status-dot" aria-hidden />
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

        <div className="home__visual">
          <div className="home__arch">
            <span className="home__arch-outline" aria-hidden />
            <div className="home__arch-clip">
              <video
                ref={videoRef}
                className="home__video"
                src={HOME_VIDEO}
                autoPlay={!paused}
                muted
                loop
                playsInline
                preload="metadata"
                aria-hidden
              />
              <span className="home__arch-shade" aria-hidden />
            </div>
            <button
              type="button"
              className="home__play"
              onClick={toggleVideo}
              aria-label={paused ? t('gallery.play') : t('gallery.pause')}
            >
              <Icon name={paused ? 'play' : 'pause'} size={14} />
            </button>
          </div>

          {/* Turning badge: circular text around the logo */}
          <div className="home__badge" aria-hidden>
            <svg className="home__badge-ring" viewBox="0 0 200 200">
              <defs>
                <path id="home-badge-circle" d="M100,100 m-76,0 a76,76 0 1,1 152,0 a76,76 0 1,1 -152,0" />
              </defs>
              <text>
                <textPath href="#home-badge-circle" textLength="474">
                  {badgeText + badgeText}
                </textPath>
              </text>
            </svg>
            <Logo className="home__badge-logo" alt="" />
          </div>

          {pick && (
            <a href="#menu" className="home__pick">
              <span className="home__pick-label">{t('hero.pick')}</span>
              <span className="home__pick-name">{pick.name}</span>
              <span className="home__pick-price">
                {pick.price} <small>{t('menu.currency')}</small>
              </span>
            </a>
          )}
        </div>
      </div>

      <a href="#about" className="home__scroll" aria-label={t('hero.scroll')}>
        <span className="home__scroll-line" aria-hidden />
      </a>
    </section>
  )
}

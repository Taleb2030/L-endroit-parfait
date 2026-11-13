import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import SectionHeader from './SectionHeader'
import Icon from './Icon'
import { gsap, useGSAP, motionOK, onEnter } from '../animations/gsap'
import { assetUrl } from '../utils/assetUrl'

const PHOTO = assetUrl('assets/restaurant.jpg')

const STATS = [
  { key: 'seats', icon: 'seats' },
  { key: 'families', icon: 'heart' },
  { key: 'events', icon: 'sparkle' },
]

export default function About() {
  const { t } = useTranslation()
  const rootRef = useRef(null)

  useGSAP(
    () => {
      if (!motionOK()) return
      const dir = document.documentElement.dir === 'rtl' ? -1 : 1

      // Photo: curtain reveal, zoom settle, then a light sweep
      gsap
        .timeline({ scrollTrigger: onEnter('.about__grid', 'top 78%') })
        .from('.about__frame', {
          clipPath: 'inset(100% 0% 0% 0% round 28px)',
          duration: 1.4,
          ease: 'power4.inOut',
        })
        .from('.about__image', { scale: 1.4, duration: 1.8, ease: 'power3.out' }, 0.1)
        .fromTo(
          '.about__image-shine',
          { x: 0, xPercent: -120, autoAlpha: 1 },
          { x: 0, xPercent: 260, duration: 1.4, ease: 'power2.inOut' },
          0.9
        )
        .set('.about__image-shine', { autoAlpha: 0 })
        .from('.about__accent', { scale: 0.4, rotation: -25 * dir, autoAlpha: 0, duration: 1, ease: 'back.out(1.6)' }, 0.8)

      // Text and stat pills
      gsap
        .timeline({ scrollTrigger: onEnter('.about__text', 'top 80%') })
        .from('.about__p', { y: 34, autoAlpha: 0, duration: 1, stagger: 0.15 })
        .from(
          '.about__stats li',
          { y: 24, scale: 0.85, autoAlpha: 0, duration: 0.7, ease: 'back.out(2)', stagger: 0.1 },
          '-=0.5'
        )

      // Slow parallax on the photo while scrolling
      gsap.fromTo(
        '.about__parallax',
        { yPercent: -6 },
        {
          yPercent: 6,
          ease: 'none',
          scrollTrigger: { trigger: '.about__frame', start: 'top bottom', end: 'bottom top', scrub: true },
        }
      )
    },
    { scope: rootRef }
  )

  return (
    <section id="about" className="about section" ref={rootRef}>
      <div className="container">
        <SectionHeader label={t('about.label')} title={t('about.title')} />

        <div className="about__grid">
          <div className="about__image-wrap">
            <div className="about__frame">
              <div className="about__parallax">
                <img
                  src={PHOTO}
                  alt="L'endroit_parfait restaurant"
                  className="about__image"
                  onError={(e) => {
                    e.target.style.display = 'none'
                  }}
                />
              </div>
              <div className="about__image-fallback" aria-hidden />
              <div className="about__image-shine" aria-hidden />
            </div>
            <div className="about__accent" aria-hidden />
          </div>

          <div className="about__text">
            <p className="about__p">{t('about.p1')}</p>
            <p className="about__p">{t('about.p2')}</p>

            <ul className="about__stats">
              {STATS.map(({ key, icon }) => (
                <li key={key}>
                  <span className="about__stat-icon">
                    <Icon name={icon} size={18} />
                  </span>
                  <span>{t(`about.stats.${key}`)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

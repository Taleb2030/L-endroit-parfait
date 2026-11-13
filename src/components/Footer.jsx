import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import Logo from './Logo'
import { gsap, useGSAP, motionOK, onEnter } from '../animations/gsap'

export default function Footer() {
  const { t } = useTranslation()
  const year = new Date().getFullYear()
  const rootRef = useRef(null)

  useGSAP(
    () => {
      if (!motionOK()) return
      gsap
        .timeline({ scrollTrigger: onEnter(rootRef.current, 'top 95%') })
        .from('.footer__line', { scaleX: 0, duration: 1.4, ease: 'power3.inOut' })
        .from('.footer__logo', { scale: 0.5, rotation: -20, autoAlpha: 0, duration: 0.8, ease: 'back.out(2)' }, 0.3)
        .from('.footer__tagline, .footer__copy', { y: 16, autoAlpha: 0, duration: 0.8, stagger: 0.1 }, 0.45)
    },
    { scope: rootRef }
  )

  return (
    <footer className="footer" ref={rootRef}>
      <span className="footer__line" aria-hidden />
      <div className="container footer__inner">
        <div className="footer__brand">
          <Logo className="footer__logo" alt="" />
          <p className="footer__tagline">{t('footer.tagline')}</p>
        </div>
        <p className="footer__copy">
          © {year} L'endroit_parfait. {t('footer.rights')}
        </p>
      </div>
    </footer>
  )
}

import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from './LanguageSwitcher'
import Logo from './Logo'
import { gsap, useGSAP, motionOK } from '../animations/gsap'

export default function Navbar() {
  const { t } = useTranslation()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const rootRef = useRef(null)
  const menuTl = useRef(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e) => e.key === 'Escape' && setMenuOpen(false)
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [menuOpen])

  const links = [
    { href: '#home', label: t('nav.home') },
    { href: '#about', label: t('nav.about') },
    { href: '#gallery', label: t('nav.gallery') },
    { href: '#experience', label: t('nav.experience') },
    { href: '#contact', label: t('nav.contact') },
  ]

  useGSAP(
    () => {
      const animate = motionOK()

      // Page scroll progress — thin gold line under the navbar
      gsap.fromTo(
        '.navbar__progress',
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: 'none',
          scrollTrigger: { start: 0, end: 'max', scrub: animate ? 0.3 : true },
        }
      )

      // Mobile menu: one timeline, played forward to open and reversed to close
      menuTl.current = gsap
        .timeline({ paused: true })
        .fromTo(
          '.navbar__mobile',
          { autoAlpha: 0, yPercent: -6 },
          { autoAlpha: 1, yPercent: 0, duration: animate ? 0.35 : 0, ease: 'power2.out' }
        )
        .from(
          // (.btn has its own CSS transitions, so it fades with the panel instead)
          '.navbar__mobile > a:not(.btn), .navbar__mobile-lang',
          { y: -14, autoAlpha: 0, duration: animate ? 0.4 : 0, stagger: animate ? 0.05 : 0 },
          animate ? 0.1 : 0
        )

      if (!animate) return
      // Entrance
      gsap
        .timeline({ delay: 0.2 })
        .from('.navbar__inner', { yPercent: -120, autoAlpha: 0, duration: 1, ease: 'power4.out' })
        .from('.navbar__links li', { y: -12, autoAlpha: 0, stagger: 0.06, duration: 0.6 }, '-=0.5')
    },
    { scope: rootRef }
  )

  useEffect(() => {
    if (!menuTl.current) return
    if (menuOpen) menuTl.current.timeScale(1).play()
    else menuTl.current.timeScale(1.6).reverse()
  }, [menuOpen])

  const closeMenu = () => setMenuOpen(false)

  return (
    <header ref={rootRef} className={`navbar ${scrolled || menuOpen ? 'navbar--scrolled' : ''}`}>
      <nav className="navbar__inner container">
        <a href="#home" className="navbar__brand" onClick={closeMenu}>
          <Logo className="navbar__logo" />
          <span className="navbar__name">L'endroit_parfait</span>
        </a>

        <ul className="navbar__links">
          {links.map((link) => (
            <li key={link.href}>
              <a href={link.href}>{link.label}</a>
            </li>
          ))}
        </ul>

        <div className="navbar__actions">
          <LanguageSwitcher />
          <a href="#contact" className="btn btn--gold btn--sm">
            {t('nav.reserve')}
          </a>
          <button
            type="button"
            className={`navbar__toggle ${menuOpen ? 'navbar__toggle--open' : ''}`}
            aria-label={menuOpen ? t('nav.close') : t('nav.menu')}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </nav>

      <div id="mobile-menu" className="navbar__mobile" inert={!menuOpen}>
        {links.map((link) => (
          <a key={link.href} href={link.href} onClick={closeMenu}>
            {link.label}
          </a>
        ))}
        <div className="navbar__mobile-lang">
          <LanguageSwitcher />
        </div>
        <a href="#contact" className="btn btn--gold" onClick={closeMenu}>
          {t('nav.reserve')}
        </a>
      </div>

      <span className="navbar__progress" aria-hidden />
    </header>
  )
}

import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import SectionHeader from './SectionHeader'
import Icon from './Icon'
import { whatsappLink } from '../config/contact'
import { gsap, ScrollTrigger, useGSAP, motionOK, onEnter } from '../animations/gsap'

// Dishes, prices and categories live in the language files (src/i18n/locales/*.json → "menu").
export default function Menu() {
  const { t, i18n } = useTranslation()
  const [active, setActive] = useState(0)
  const rootRef = useRef(null)

  const raw = t('menu.categories', { returnObjects: true })
  const categories = Array.isArray(raw) ? raw : []
  const current = categories[active] ?? categories[0]

  // Tabs + card rise in on scroll
  useGSAP(
    () => {
      if (!motionOK()) return
      gsap
        .timeline({ scrollTrigger: onEnter('.menu__tabs', 'top 85%') })
        .from('.menu__tab', { y: 18, autoAlpha: 0, duration: 0.6, stagger: 0.08 })
        .from('.menu__board', { y: 50, autoAlpha: 0, duration: 1, ease: 'power4.out' }, 0.15)
    },
    { scope: rootRef }
  )

  // Dishes cascade in whenever the category (or language) changes
  useGSAP(
    () => {
      if (!motionOK()) return
      gsap.from('.menu__item', { y: 20, autoAlpha: 0, duration: 0.55, stagger: 0.06 })
    },
    { scope: rootRef, dependencies: [active, i18n.language] }
  )

  // Categories have different lengths — re-measure the sections below
  useEffect(() => {
    const id = requestAnimationFrame(() => ScrollTrigger.refresh())
    return () => cancelAnimationFrame(id)
  }, [active])

  if (!current) return null

  return (
    <section id="menu" className="menu section" ref={rootRef}>
      <div className="container">
        <SectionHeader
          label={t('menu.label')}
          title={t('menu.title')}
          subtitle={t('menu.subtitle')}
          centered
        />

        <div className="menu__tabs" role="tablist" aria-label={t('menu.label')}>
          {categories.map((cat, i) => (
            <button
              key={cat.title}
              type="button"
              role="tab"
              id={`menu-tab-${i}`}
              aria-selected={i === active}
              aria-controls="menu-panel"
              className={`menu__tab ${i === active ? 'is-active' : ''}`}
              onClick={() => setActive(i)}
            >
              {cat.title}
            </button>
          ))}
        </div>

        <div className="menu__board" id="menu-panel" role="tabpanel" aria-labelledby={`menu-tab-${active}`}>
          <ul className="menu__list">
            {current.items.map((item) => (
              <li key={item.name} className="menu__item">
                <div className="menu__item-head">
                  <h3 className="menu__item-name">{item.name}</h3>
                  <span className="menu__item-dots" aria-hidden />
                  <span className="menu__item-price">
                    {item.price} <small>{t('menu.currency')}</small>
                  </span>
                </div>
                {item.desc && <p className="menu__item-desc">{item.desc}</p>}
              </li>
            ))}
          </ul>

          <div className="menu__footer">
            <p>{t('menu.orderText')}</p>
            <a
              href={whatsappLink(t('menu.orderMessage'))}
              className="btn btn--wa"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Icon name="whatsapp" size={20} />
              {t('menu.orderCta')}
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import SectionHeader from './SectionHeader'
import Icon from './Icon'
import { whatsappLink } from '../config/contact'
import { gsap, ScrollTrigger, useGSAP, motionOK, onEnter } from '../animations/gsap'
import { scrollToY } from '../animations/useSmoothScroll'

// Dishes, prices and categories live in the language files (src/i18n/locales/*.json → "menu").

const hasWebGL = () => {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

function useCategories() {
  const { t } = useTranslation()
  const raw = t('menu.categories', { returnObjects: true })
  return Array.isArray(raw) ? raw : []
}

export default function Menu() {
  // 3D shelf when the device can do it; a classic tabbed menu card otherwise
  const [shelf] = useState(() => motionOK() && hasWebGL())
  return shelf ? <MenuShelf /> : <MenuBoard />
}

/* ------------------------------------------------------------------ */
/* 3D shelf: the section is pinned and scrolling walks through dishes  */
/* ------------------------------------------------------------------ */
function MenuShelf() {
  const { t, i18n } = useTranslation()
  const categories = useCategories()
  const rootRef = useRef(null)
  const canvasRef = useRef(null)
  const shelfRef = useRef(null)
  const triggerRef = useRef(null)
  const activeRef = useRef(0)
  const [active, setActive] = useState(0)

  // Flat list of dishes, each remembering its category
  const dishes = useMemo(
    () => categories.flatMap((c, ci) => c.items.map((item) => ({ ...item, category: c.title, ci }))),
    [categories]
  )
  const count = dishes.length
  const categoryKey = dishes.map((d) => d.ci).join(',')

  /** Scroll the page so dish `i` becomes the selected one. */
  const goTo = useCallback(
    (i) => {
      const st = triggerRef.current
      if (!st || count < 2) return
      const idx = Math.max(0, Math.min(count - 1, i))
      scrollToY(st.start + (idx / (count - 1)) * (st.end - st.start) + 1)
    },
    [count]
  )

  // three.js scene (rebuilt only if the dish list changes shape)
  useEffect(() => {
    if (!count) return
    let shelf
    let io
    let cancelled = false
    import('../three/menuShelf').then(({ createMenuShelf }) => {
      if (cancelled) return
      shelf = createMenuShelf(canvasRef.current, {
        categories: categoryKey.split(',').map(Number),
        onSelect: (i) => goTo(i),
        onStep: (s) => goTo(activeRef.current + s),
      })
      shelf.setTarget(activeRef.current)
      shelfRef.current = shelf
      io = new IntersectionObserver(([e]) => (e.isIntersecting ? shelf.start() : shelf.stop()))
      io.observe(canvasRef.current)
    })
    return () => {
      cancelled = true
      io?.disconnect()
      shelf?.dispose()
      shelfRef.current = null
    }
  }, [count, categoryKey, goTo])

  // Scroll position → selected dish
  useGSAP(
    () => {
      triggerRef.current = ScrollTrigger.create({
        trigger: rootRef.current,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => {
          const idx = Math.round(self.progress * (count - 1))
          if (idx !== activeRef.current) {
            activeRef.current = idx
            shelfRef.current?.setTarget(idx)
            setActive(idx)
          }
        },
      })
      gsap.from('.menu__stage', {
        y: 60,
        autoAlpha: 0,
        duration: 1.2,
        ease: 'power4.out',
        scrollTrigger: onEnter(rootRef.current, 'top 75%'),
      })
    },
    { scope: rootRef, dependencies: [count] }
  )

  // Arrow keys while the shelf is on screen (mirrored for Arabic)
  useEffect(() => {
    const onKey = (e) => {
      if (!triggerRef.current?.isActive) return
      if (e.target.closest?.('input, textarea, select')) return
      const rtl = document.documentElement.dir === 'rtl'
      if (e.key === 'ArrowRight') goTo(activeRef.current + (rtl ? -1 : 1))
      if (e.key === 'ArrowLeft') goTo(activeRef.current + (rtl ? 1 : -1))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [goTo])

  // Dish details crossfade on change
  useGSAP(
    () => {
      gsap.fromTo('.menu__info-body', { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.45, ease: 'power2.out' })
    },
    { scope: rootRef, dependencies: [active, i18n.language] }
  )

  const dish = dishes[active]
  if (!dish) return null
  const firstOf = (ci) => dishes.findIndex((d) => d.ci === ci)

  return (
    <section
      id="menu"
      className="menu menu--shelf"
      ref={rootRef}
      style={{ '--menu-steps': count }}
      aria-label={t('menu.label')}
    >
      <div className="menu__sticky">
        <div className="container menu__head">
          <SectionHeader label={t('menu.label')} title={t('menu.title')} centered />
        </div>

        <div className="menu__stage">
          <canvas ref={canvasRef} className="menu__canvas" aria-hidden />
        </div>

        <div className="container menu__info" aria-live="polite">
          <div className="menu__info-body">
            <span className="menu__info-cat" data-cat={dish.ci}>
              {dish.category}
              <span className="menu__info-count" dir="ltr">
                {String(active + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
              </span>
            </span>
            <h3 className="menu__info-name">{dish.name}</h3>
            {dish.desc && <p className="menu__info-desc">{dish.desc}</p>}
            <div className="menu__info-row">
              <span className="menu__info-price">
                {dish.price} <small>{t('menu.currency')}</small>
              </span>
              <a
                href={whatsappLink(t('menu.dishMessage', { dish: dish.name }))}
                className="btn btn--wa btn--sm"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Icon name="whatsapp" size={16} />
                {t('menu.orderDish')}
              </a>
            </div>
          </div>
        </div>

        <div className="container menu__controls">
          <button type="button" className="menu__arrow" onClick={() => goTo(active - 1)} disabled={active === 0} aria-label={t('menu.prev')}>
            <Icon name="chevronLeft" size={20} />
          </button>
          <div className="menu__cats">
            {categories.map((c, ci) => (
              <button
                key={c.title}
                type="button"
                className={`menu__tab ${dish.ci === ci ? 'is-active' : ''}`}
                aria-pressed={dish.ci === ci}
                onClick={() => goTo(firstOf(ci))}
              >
                {c.title}
              </button>
            ))}
          </div>
          <button type="button" className="menu__arrow" onClick={() => goTo(active + 1)} disabled={active === count - 1} aria-label={t('menu.next')}>
            <Icon name="chevronRight" size={20} />
          </button>
        </div>
      </div>

      {/* Full menu as plain text for screen readers & search engines */}
      <div className="sr-only">
        {categories.map((c) => (
          <div key={c.title}>
            <h3>{c.title}</h3>
            <ul>
              {c.items.map((item) => (
                <li key={item.name}>
                  {item.name} — {item.desc} — {item.price} {t('menu.currency')}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Fallback: tabbed menu card (reduced motion / no WebGL)              */
/* ------------------------------------------------------------------ */
function MenuBoard() {
  const { t } = useTranslation()
  const categories = useCategories()
  const [active, setActive] = useState(0)
  const current = categories[active] ?? categories[0]

  useEffect(() => {
    const id = requestAnimationFrame(() => ScrollTrigger.refresh())
    return () => cancelAnimationFrame(id)
  }, [active])

  if (!current) return null

  return (
    <section id="menu" className="menu section">
      <div className="container">
        <SectionHeader label={t('menu.label')} title={t('menu.title')} subtitle={t('menu.subtitle')} centered />

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
            <a href={whatsappLink(t('menu.orderMessage'))} className="btn btn--wa" target="_blank" rel="noopener noreferrer">
              <Icon name="whatsapp" size={20} />
              {t('menu.orderCta')}
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

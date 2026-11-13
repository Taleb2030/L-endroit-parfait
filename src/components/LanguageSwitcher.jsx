import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import Icon from './Icon'

const LANGUAGES = [
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'fr', label: 'Français', short: 'FR' },
  { code: 'ar', label: 'العربية', short: 'ع' },
]

export default function LanguageSwitcher() {
  const { t, i18n } = useTranslation()
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)

  const current =
    LANGUAGES.find((lang) => i18n.language?.startsWith(lang.code)) ?? LANGUAGES[0]

  useEffect(() => {
    if (!open) return

    const onPointer = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }

    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const selectLanguage = (code) => {
    i18n.changeLanguage(code)
    setOpen(false)
  }

  return (
    <div className="lang-dropdown" ref={rootRef}>
      <button
        type="button"
        className="lang-dropdown__trigger"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={t('nav.language')}
      >
        <Icon name="globe" size={16} className="lang-dropdown__globe" />
        <span className="lang-dropdown__current">{current.label}</span>
        <Icon
          name="chevronDown"
          size={14}
          className={`lang-dropdown__chevron ${open ? 'lang-dropdown__chevron--open' : ''}`}
        />
      </button>

      {open && (
        <ul className="lang-dropdown__menu" role="listbox" aria-label={t('nav.language')}>
          {LANGUAGES.map(({ code, label, short }) => {
            const active = i18n.language?.startsWith(code)
            return (
              <li key={code} role="option" aria-selected={active}>
                <button
                  type="button"
                  className={active ? 'active' : ''}
                  onClick={() => selectLanguage(code)}
                >
                  <span className="lang-dropdown__code" aria-hidden>
                    {short}
                  </span>
                  <span>{label}</span>
                  {active && <Icon name="check" size={16} className="lang-dropdown__check" />}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

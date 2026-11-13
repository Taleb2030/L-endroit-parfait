import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import SectionHeader from './SectionHeader'
import Icon from './Icon'
import { gsap, useGSAP, motionOK, onEnter } from '../animations/gsap'

export default function Contact() {
  const { t } = useTranslation()
  const [submitted, setSubmitted] = useState(false)
  const rootRef = useRef(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitted(true)
  }

  // Scroll entrance
  useGSAP(
    () => {
      if (!motionOK()) return
      const dir = document.documentElement.dir === 'rtl' ? -1 : 1

      gsap
        .timeline({ scrollTrigger: onEnter('.contact__grid', 'top 80%') })
        .from('.contact__details li', { x: -50 * dir, autoAlpha: 0, duration: 0.9, stagger: 0.12 })
        .from(
          '.contact__icon',
          { scale: 0, rotation: -90 * dir, duration: 0.7, ease: 'back.out(2.2)', stagger: 0.12 },
          0.25
        )
        .from('.contact__form', { x: 60 * dir, autoAlpha: 0, duration: 1.1, ease: 'power4.out' }, 0.1)
        .from('.contact__fields > *', { y: 22, autoAlpha: 0, duration: 0.7, stagger: 0.07 }, 0.45)
    },
    { scope: rootRef }
  )

  // Success state: check badge pops, tick draws itself
  useGSAP(
    () => {
      if (!submitted || !motionOK()) return
      gsap
        .timeline()
        .from('.contact__success-icon', { scale: 0, rotation: -120, duration: 0.9, ease: 'elastic.out(1, 0.55)' })
        .from('.contact__success-icon path', { strokeDasharray: 30, strokeDashoffset: 30, duration: 0.5, ease: 'power2.out' }, 0.25)
        .from('.contact__success-text', { y: 14, autoAlpha: 0, duration: 0.6 }, 0.35)
    },
    { scope: rootRef, dependencies: [submitted] }
  )

  return (
    <section id="contact" className="contact section" ref={rootRef}>
      <div className="container">
        <SectionHeader
          label={t('contact.label')}
          title={t('contact.title')}
          subtitle={t('contact.subtitle')}
        />

        <div className="contact__grid">
          <ul className="contact__details">
            {[
              {
                icon: 'phone',
                strong: t('contact.phone'),
                content: (
                  <a href="tel:+22222020202" dir="ltr">
                    +222 22 02 02 02
                  </a>
                ),
              },
              { icon: 'clock', strong: t('contact.hours'), content: <span>{t('contact.hoursValue')}</span> },
              { icon: 'pin', strong: t('contact.addressLabel'), content: <span>{t('contact.address')}</span> },
            ].map((item) => (
              <li key={item.icon}>
                <span className="contact__icon">
                  <Icon name={item.icon} size={20} />
                </span>
                <div>
                  <strong>{item.strong}</strong>
                  {item.content}
                </div>
              </li>
            ))}
          </ul>

          <form className="contact__form" onSubmit={handleSubmit}>
            {submitted ? (
              <div className="contact__success" role="status">
                <span className="contact__success-icon">
                  <Icon name="check" size={28} strokeWidth={2} />
                </span>
                <span className="contact__success-text">{t('contact.form.submit')}</span>
              </div>
            ) : (
              <div className="contact__fields">
                {[
                  { type: 'text', name: 'name', label: t('contact.form.name'), required: true },
                  { type: 'email', name: 'email', label: t('contact.form.email'), required: true },
                ].map((field) => (
                  <label key={field.name}>
                    <span>{field.label}</span>
                    <input type={field.type} name={field.name} required={field.required} />
                  </label>
                ))}
                <div className="contact__row">
                  <label>
                    <span>{t('contact.form.guests')}</span>
                    <input type="number" name="guests" min="1" max="50" defaultValue="2" />
                  </label>
                  <label>
                    <span>{t('contact.form.date')}</span>
                    <input type="date" name="date" required />
                  </label>
                </div>
                <label>
                  <span>{t('contact.form.message')}</span>
                  <textarea name="message" rows={4} />
                </label>
                <div>
                  <button type="submit" className="btn btn--gold btn--full">
                    {t('contact.form.submit')}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </section>
  )
}

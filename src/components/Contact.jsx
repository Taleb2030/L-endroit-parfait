import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import SectionHeader from './SectionHeader'
import Icon from './Icon'
import { PHONE_DISPLAY, PHONE_TEL, whatsappLink } from '../config/contact'
import { gsap, useGSAP, motionOK, onEnter } from '../animations/gsap'

export default function Contact() {
  const { t } = useTranslation()
  const rootRef = useRef(null)
  const waHref = whatsappLink(t('contact.wa.message'))

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
        .from('.contact__wa', { x: 60 * dir, autoAlpha: 0, duration: 1.1, ease: 'power4.out' }, 0.1)
        .from('.contact__wa-icon', { scale: 0, rotation: -120, duration: 0.9, ease: 'elastic.out(1, 0.55)' }, 0.5)
        .from('.contact__wa-body > *', { y: 22, autoAlpha: 0, duration: 0.7, stagger: 0.08 }, 0.55)
    },
    { scope: rootRef }
  )

  const steps = t('contact.wa.steps', { returnObjects: true })

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
                icon: 'whatsapp',
                strong: 'WhatsApp',
                content: (
                  <a href={waHref} target="_blank" rel="noopener noreferrer" dir="ltr">
                    {PHONE_DISPLAY}
                  </a>
                ),
              },
              {
                icon: 'phone',
                strong: t('contact.phone'),
                content: (
                  <a href={`tel:${PHONE_TEL}`} dir="ltr">
                    {PHONE_DISPLAY}
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

          <div className="contact__wa">
            <span className="contact__wa-icon">
              <Icon name="whatsapp" size={34} strokeWidth={1.6} />
            </span>
            <div className="contact__wa-body">
              <h3 className="contact__wa-title">{t('contact.wa.title')}</h3>
              <p className="contact__wa-text">{t('contact.wa.text')}</p>
              {Array.isArray(steps) && (
                <ol className="contact__wa-steps">
                  {steps.map((step, i) => (
                    <li key={step}>
                      <span className="contact__wa-num">{i + 1}</span>
                      {step}
                    </li>
                  ))}
                </ol>
              )}
              <a href={waHref} className="btn btn--wa btn--lg btn--full" target="_blank" rel="noopener noreferrer">
                <Icon name="whatsapp" size={22} />
                {t('contact.wa.cta')}
              </a>
              <p className="contact__wa-note">{t('contact.wa.note')}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { useRtl } from '../hooks/useRtl'
import SectionHeader from './SectionHeader'
import {
  slideFromStart,
  slideFromEnd,
  fadeUpSoft,
  staggerContainer,
  scaleIn,
  viewport,
  transition,
  ease,
} from '../animations/motion'

export default function Contact() {
  const { t } = useTranslation()
  const isRtl = useRtl()
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitted(true)
  }

  const slideInOpposite = isRtl ? slideFromStart(isRtl) : slideFromEnd(isRtl)

  return (
    <section id="contact" className="contact section">
      <div className="container">
        <SectionHeader
          label={t('contact.label')}
          title={t('contact.title')}
          subtitle={t('contact.subtitle')}
        />

        <div className="contact__grid">
          <motion.ul
            className="contact__details"
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
            variants={staggerContainer}
          >
            {[
              { strong: t('contact.phone'), content: <a href="tel:+22200000000">+222 22 02 02 02</a> },
              { strong: t('contact.hours'), content: <span>{t('contact.hoursValue')}</span> },
              { strong: t('contact.address'), content: <span>{t('contact.address')}</span> },
            ].map((item, i) => (
              <motion.li key={i} variants={fadeUpSoft} transition={{ ...transition, delay: i * 0.1 }}>
                <strong>{item.strong}</strong>
                {item.content}
              </motion.li>
            ))}
          </motion.ul>

          <motion.form
            className="contact__form"
            onSubmit={handleSubmit}
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
            variants={slideInOpposite}
            transition={{ duration: 0.9, ease }}
          >
            {submitted ? (
              <motion.p
                className="contact__success"
                role="status"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              >
                ✓ {t('contact.form.submit')}
              </motion.p>
            ) : (
              <motion.div
                className="contact__fields"
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={viewport}
              >
                {[
                  { type: 'text', name: 'name', label: t('contact.form.name'), required: true },
                  { type: 'email', name: 'email', label: t('contact.form.email'), required: true },
                ].map((field) => (
                  <motion.label key={field.name} variants={fadeUpSoft} transition={transition}>
                    <span>{field.label}</span>
                    <input type={field.type} name={field.name} required={field.required} />
                  </motion.label>
                ))}
                <motion.div className="contact__row" variants={fadeUpSoft} transition={transition}>
                  <label>
                    <span>{t('contact.form.guests')}</span>
                    <input type="number" name="guests" min="1" max="50" defaultValue="2" />
                  </label>
                  <label>
                    <span>{t('contact.form.date')}</span>
                    <input type="date" name="date" required />
                  </label>
                </motion.div>
                <motion.label variants={fadeUpSoft} transition={transition}>
                  <span>{t('contact.form.message')}</span>
                  <textarea name="message" rows={4} />
                </motion.label>
                <motion.button
                  type="submit"
                  className="btn btn--gold btn--full"
                  variants={scaleIn}
                  transition={{ ...transition, delay: 0.2 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {t('contact.form.submit')}
                </motion.button>
              </motion.div>
            )}
          </motion.form>
        </div>
      </div>
    </section>
  )
}

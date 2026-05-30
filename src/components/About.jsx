import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import SectionHeader from './SectionHeader'
import {
  imageReveal,
  fadeUpSoft,
  staggerContainer,
  viewport,
  transition,
  ease,
} from '../animations/motion'

import { assetUrl } from '../utils/assetUrl'

const PHOTO = assetUrl('assets/restaurant.jpg')

export default function About() {
  const { t } = useTranslation()

  const stats = [
    { key: 'seats', icon: '◆' },
    { key: 'families', icon: '♥' },
    { key: 'events', icon: '✦' },
  ]

  return (
    <section id="about" className="about section">
      <div className="container">
        <SectionHeader label={t('about.label')} title={t('about.title')} />

        <div className="about__grid">
          <motion.div
            className="about__image-wrap"
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
            variants={imageReveal}
            transition={{ duration: 0.95, ease }}
          >
            <motion.div
              className="about__frame"
              initial={{ scale: 1.12 }}
              whileInView={{ scale: 1 }}
              viewport={viewport}
              transition={{ duration: 1.1, ease, delay: 0.1 }}
            >
              <img
                src={PHOTO}
                alt="L'endroit_parfait restaurant"
                className="about__image"
                onError={(e) => {
                  e.target.style.display = 'none'
                }}
              />
              <div className="about__image-fallback" aria-hidden />
              <motion.div
                className="about__image-shine"
                initial={{ x: '-100%' }}
                whileInView={{ x: '120%' }}
                viewport={viewport}
                transition={{ duration: 1.4, ease, delay: 0.35 }}
                aria-hidden
              />
            </motion.div>
            <motion.div
              className="about__accent"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 0.5, scale: 1 }}
              viewport={viewport}
              transition={{ duration: 0.7, ease, delay: 0.4 }}
              aria-hidden
            />
          </motion.div>

          <motion.div
            className="about__text"
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
            variants={staggerContainer}
          >
            <motion.p className="about__p" variants={fadeUpSoft} transition={transition}>
              {t('about.p1')}
            </motion.p>
            <motion.p className="about__p" variants={fadeUpSoft} transition={transition}>
              {t('about.p2')}
            </motion.p>

            <motion.ul className="about__stats" variants={staggerContainer}>
              {stats.map(({ key, icon }, i) => (
                <motion.li
                  key={key}
                  variants={fadeUpSoft}
                  transition={{ ...transition, delay: i * 0.08 }}
                  whileHover={{ y: -3, transition: { duration: 0.25 } }}
                >
                  <span className="about__stat-icon">{icon}</span>
                  <span>{t(`about.stats.${key}`)}</span>
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

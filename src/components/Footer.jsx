import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import Logo from './Logo'
import { fadeUpSoft, viewport, transition } from '../animations/motion'

export default function Footer() {
  const { t } = useTranslation()
  const year = new Date().getFullYear()

  return (
    <motion.footer
      className="footer"
      initial="hidden"
      whileInView="visible"
      viewport={viewport}
      variants={fadeUpSoft}
      transition={transition}
    >
      <div className="container footer__inner">
        <div className="footer__brand">
          <Logo className="footer__logo" alt="" />
          <p className="footer__tagline">{t('footer.tagline')}</p>
        </div>
        <p className="footer__copy">
          © {year} L'endroit_parfait. {t('footer.rights')}
        </p>
      </div>
    </motion.footer>
  )
}

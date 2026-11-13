import { useTranslation } from 'react-i18next'
import Icon from './Icon'
import { whatsappLink } from '../config/contact'

// Round WhatsApp button that stays in the corner on every part of the page.
export default function WhatsAppFloat() {
  const { t } = useTranslation()
  return (
    <a
      href={whatsappLink(t('contact.wa.message'))}
      className="wa-float"
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t('contact.wa.float')}
    >
      <Icon name="whatsapp" size={28} strokeWidth={1.7} />
      <span className="wa-float__label">{t('contact.wa.float')}</span>
    </a>
  )
}

// Restaurant contact details — change them here and the whole site updates.

// WhatsApp number: country code + number, digits only (no +, spaces or dashes).
export const WHATSAPP_NUMBER = '22222020202'

// Phone number as shown on the page, and the version used for tap-to-call.
export const PHONE_DISPLAY = '+222 22 02 02 02'
export const PHONE_TEL = '+22222020202'

/** Link that opens a WhatsApp chat with the restaurant, with the message already typed. */
export function whatsappLink(message = '') {
  const text = message ? `?text=${encodeURIComponent(message)}` : ''
  return `https://wa.me/${WHATSAPP_NUMBER}${text}`
}

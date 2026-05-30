import { useLogo } from '../hooks/useLogo'

export default function Logo({ className = '', alt = 'L\'endroit_parfait', variant }) {
  const logoSrc = useLogo()
  const classes = ['logo', variant && `logo--${variant}`, className].filter(Boolean).join(' ')

  return <img src={logoSrc} alt={alt} className={classes} />
}

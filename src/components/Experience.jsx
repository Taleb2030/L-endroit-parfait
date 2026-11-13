import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import SectionHeader from './SectionHeader'
import ExperienceCarousel from './ExperienceCarousel'
import { gsap, useGSAP, motionOK, onEnter } from '../animations/gsap'

export default function Experience() {
  const { t } = useTranslation()
  const rootRef = useRef(null)

  useGSAP(
    () => {
      if (!motionOK()) return
      // Carousel rises in with a slight 3D tilt
      gsap.from('.experience__stage', {
        y: 80,
        rotationX: 12,
        scale: 0.94,
        autoAlpha: 0,
        duration: 1.4,
        ease: 'power4.out',
        transformPerspective: 1200,
        scrollTrigger: onEnter('.experience__stage', 'top 88%'),
      })
    },
    { scope: rootRef }
  )

  return (
    <section id="experience" className="experience section" ref={rootRef}>
      <div className="experience__bg" aria-hidden />
      <div className="container">
        <SectionHeader label={t('experience.label')} title={t('experience.title')} centered />
        <div className="experience__stage">
          <ExperienceCarousel />
        </div>
      </div>
    </section>
  )
}

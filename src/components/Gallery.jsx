import { useState, useRef, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { gsap, useGSAP } from '../animations/gsap'
import SectionHeader from './SectionHeader'
import Icon from './Icon'
import { useRtl } from '../hooks/useRtl'
import { assetUrl } from '../utils/assetUrl'

// Add more videos here — the slider adapts to any count.
const VIDEOS = [
  { id: 1, src: assetUrl('assets/videos/video1.mp4') },
  { id: 2, src: assetUrl('assets/videos/video2.mp4') },
  { id: 3, src: assetUrl('assets/videos/video3.mp4') },
]

const VISIBLE_SIDE = 2 // slides shown on each side of the active one
const MIN_RING = VISIBLE_SIDE * 2 + 2 // repeat videos until the loop looks full

// The "ring" repeats the video list so 5 cards are always on stage.
const RING = (() => {
  const ring = []
  while (ring.length < Math.max(MIN_RING, VIDEOS.length)) {
    VIDEOS.forEach((video, v) => ring.push({ ...video, v, key: `${video.id}-${ring.length}` }))
  }
  return ring
})()
const RING_SIZE = RING.length
const COUNT = VIDEOS.length

const SWIPE_PX = 50
const pad = (n) => String(n).padStart(2, '0')

// Shortest signed distance from the active slot, so the carousel loops.
function offsetFrom(i, active) {
  let d = i - active
  if (d > RING_SIZE / 2) d -= RING_SIZE
  if (d <= -RING_SIZE / 2) d += RING_SIZE
  return d
}

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Where a card sits for a given distance from the center.
function slotStyle(offset, dir) {
  const d = Math.abs(offset)
  const side = Math.sign(offset) * dir
  return {
    xPercent: side * (d === 0 ? 0 : d === 1 ? 64 : 116),
    z: -d * 160,
    rotationY: -side * Math.min(d, 1) * 30,
    scale: 1 - Math.min(d, 2) * 0.1,
    autoAlpha: d > VISIBLE_SIDE ? 0 : 1,
    filter: `brightness(${[1, 0.5, 0.3][Math.min(d, 2)]}) saturate(${d ? 0.75 : 1})`,
    zIndex: 10 - d,
  }
}

function VideoSlider() {
  const { t, i18n } = useTranslation()
  const isRtl = useRtl()
  const dir = isRtl ? -1 : 1
  const titles = t('gallery.items', { returnObjects: true })
  const titleOf = useCallback((v) => (Array.isArray(titles) ? titles[v] : '') ?? '', [titles])

  const [index, setIndex] = useState(0) // position in RING
  const [playing, setPlaying] = useState(() => !prefersReducedMotion())
  const [sound, setSound] = useState(false)
  const [progress, setProgress] = useState(0)
  const [inView, setInView] = useState(false)
  const [failed, setFailed] = useState({})
  const [announce, setAnnounce] = useState('')

  const rootRef = useRef(null)
  const stageRef = useRef(null)
  const videoRefs = useRef([])
  const prevOffsets = useRef(null)
  const dragging = useRef(false)
  const pointer = useRef(null)
  const entered = useRef(false)
  const [reduce] = useState(prefersReducedMotion)

  const activeVideo = RING[index].v

  const goTo = useCallback(
    (next, fromUser = false) => {
      const target = ((next % RING_SIZE) + RING_SIZE) % RING_SIZE
      setIndex(target)
      setProgress(0)
      if (fromUser) {
        const v = RING[target].v
        setAnnounce(`${t('gallery.slide', { current: v + 1, total: COUNT })}: ${titleOf(v)}`)
      }
    },
    [t, titleOf]
  )

  // Jump to the nearest copy of video `v` in the ring.
  const goToVideo = (v) => {
    let best = index
    let bestDist = Infinity
    RING.forEach((item, i) => {
      const dist = Math.abs(offsetFrom(i, index))
      if (item.v === v && dist < bestDist) {
        best = i
        bestDist = dist
      }
    })
    goTo(best, true)
  }

  // ---------- GSAP: card positions ----------
  useGSAP(
    () => {
      const cards = gsap.utils.toArray('.vslider__slide', rootRef.current)
      const first = prevOffsets.current === null
      const offsets = cards.map((_, i) => offsetFrom(i, index))

      cards.forEach((card, i) => {
        const { zIndex, ...style } = slotStyle(offsets[i], dir)
        gsap.set(card, { zIndex }) // stacking order snaps; it can't be tweened
        const prev = prevOffsets.current?.[i]
        // Cards that wrap around the back of the ring jump instead of flying across.
        const wraps = prev !== undefined && Math.abs(prev - offsets[i]) > 1
        if (first || wraps || reduce) {
          gsap.set(card, style)
        } else {
          gsap.to(card, { ...style, duration: 0.95, ease: 'power3.out', overwrite: 'auto' })
        }
      })
      prevOffsets.current = offsets
    },
    { scope: rootRef, dependencies: [index, dir] }
  )

  // ---------- GSAP: caption words + light sweep on the active card ----------
  useGSAP(
    () => {
      if (reduce) return
      const active = rootRef.current.querySelector('.vslider__slide.is-active')
      if (!active) return
      const tl = gsap.timeline()
      tl.fromTo(
        active.querySelectorAll('.vslider__word'),
        { yPercent: 110, autoAlpha: 0 },
        { yPercent: 0, autoAlpha: 1, duration: 0.7, ease: 'power3.out', stagger: 0.06 },
        0.25
      )
        .fromTo(
          active.querySelector('.vslider__count'),
          { autoAlpha: 0, y: 10 },
          { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power2.out' },
          0.2
        )
        .fromTo(
          active.querySelector('.vslider__shine'),
          { x: 0, xPercent: -160, autoAlpha: 1 },
          { x: 0, xPercent: 260, duration: 1.3, ease: 'power2.inOut' },
          0.1
        )
        .set(active.querySelector('.vslider__shine'), { autoAlpha: 0 })
    },
    { scope: rootRef, dependencies: [index, i18n.language] }
  )

  // ---------- GSAP: ambient glow ----------
  useGSAP(
    () => {
      if (reduce) return
      gsap.to('.vslider__glow', {
        scale: 1.15,
        opacity: 0.75,
        duration: 3.2,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
      })
    },
    { scope: rootRef }
  )

  // ---------- GSAP: entrance when the slider first scrolls into view ----------
  useGSAP(
    () => {
      const inners = gsap.utils.toArray('.vslider__card', rootRef.current)
      if (reduce) return
      if (!entered.current && !inView) {
        gsap.set(inners, { y: 140, autoAlpha: 0 })
        return
      }
      if (!entered.current && inView) {
        entered.current = true
        gsap.to(inners, {
          y: 0,
          autoAlpha: 1,
          duration: 1.2,
          ease: 'power4.out',
          stagger: { each: 0.09, from: 'center' },
          clearProps: 'transform,visibility,opacity',
        })
      }
    },
    { scope: rootRef, dependencies: [inView] }
  )

  // ---------- Mouse tilt on the active card (desktop only) ----------
  const tilt = useRef(null)
  useGSAP(
    () => {
      if (reduce || !window.matchMedia('(hover: hover)').matches) return
      const card = rootRef.current.querySelector('.vslider__slide.is-active .vslider__card')
      if (!card) return
      tilt.current = {
        card,
        rx: gsap.quickTo(card, 'rotationX', { duration: 0.6, ease: 'power3.out' }),
        ry: gsap.quickTo(card, 'rotationY', { duration: 0.6, ease: 'power3.out' }),
      }
      return () => {
        gsap.to(card, { rotationX: 0, rotationY: 0, duration: 0.5, ease: 'power3.out' })
        tilt.current = null
      }
    },
    { scope: rootRef, dependencies: [index] }
  )

  const onTiltMove = (e) => {
    const tl = tilt.current
    if (!tl) return
    const r = tl.card.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width - 0.5
    const py = (e.clientY - r.top) / r.height - 0.5
    tl.ry(px * 10)
    tl.rx(-py * 8)
  }

  const onTiltLeave = () => {
    tilt.current?.rx(0)
    tilt.current?.ry(0)
  }

  // Only play while the slider is on screen.
  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      threshold: 0.3,
    })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // Sync every <video> with the slider state.
  useEffect(() => {
    videoRefs.current.forEach((video, i) => {
      if (!video) return
      if (i !== index) {
        video.pause()
        if (video.currentTime > 0.2) video.currentTime = 0.1
        video.muted = true
        return
      }
      video.muted = !sound
      if (playing && inView) {
        video.play().catch(() => {
          // Browser blocked sound — fall back to muted playback.
          video.muted = true
          setSound(false)
          video.play().catch(() => setPlaying(false))
        })
      } else {
        video.pause()
      }
    })
  }, [index, playing, sound, inView])

  // ---------- Keyboard + swipe ----------
  const onKeyDown = (e) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      goTo(index + dir, true)
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      goTo(index - dir, true)
    }
  }

  const onPointerDown = (e) => {
    pointer.current = { x: e.clientX, id: e.pointerId }
    dragging.current = false
  }

  const onPointerMove = (e) => {
    onTiltMove(e)
    const p = pointer.current
    if (!p || p.id !== e.pointerId) return
    const dx = e.clientX - p.x
    if (Math.abs(dx) > 8) dragging.current = true
    if (dragging.current && !reduce) gsap.set(stageRef.current, { x: dx * 0.35 })
  }

  const onPointerUp = (e) => {
    const p = pointer.current
    pointer.current = null
    if (!p) return
    const dx = (e.clientX - p.x) * dir
    if (dragging.current) {
      if (dx < -SWIPE_PX) goTo(index + 1, true)
      else if (dx > SWIPE_PX) goTo(index - 1, true)
      gsap.to(stageRef.current, { x: 0, duration: 0.6, ease: 'power3.out' })
      setTimeout(() => {
        dragging.current = false
      }, 60)
    }
  }

  const togglePlay = () => {
    if (dragging.current) return
    setPlaying((p) => !p)
  }

  return (
    <div
      ref={rootRef}
      className="vslider"
      role="region"
      aria-roledescription="carousel"
      aria-label={t('gallery.carousel')}
      onKeyDown={onKeyDown}
    >
      <div className="vslider__glow" aria-hidden />

      <div
        ref={stageRef}
        className="vslider__stage"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onPointerLeave={(e) => {
          onTiltLeave()
          if (pointer.current) onPointerUp(e)
        }}
      >
        {RING.map((item, i) => {
          const offset = offsetFrom(i, index)
          const distance = Math.abs(offset)
          const active = offset === 0
          const title = titleOf(item.v)

          return (
            <div
              key={item.key}
              className={`vslider__slide ${active ? 'is-active' : ''}`}
              role="group"
              aria-roledescription="slide"
              aria-label={`${t('gallery.slide', { current: item.v + 1, total: COUNT })}: ${title}`}
              aria-hidden={!active}
            >
              <div className="vslider__card">
                {failed[item.id] ? (
                  <div className="vslider__placeholder">
                    <span>{pad(item.v + 1)}</span>
                  </div>
                ) : (
                  <video
                    ref={(el) => {
                      videoRefs.current[i] = el
                    }}
                    className="vslider__video"
                    src={`${item.src}#t=0.1`}
                    muted
                    playsInline
                    preload={distance <= VISIBLE_SIDE ? 'metadata' : 'none'}
                    onTimeUpdate={
                      active
                        ? (e) => {
                            const v = e.currentTarget
                            if (v.duration) setProgress(v.currentTime / v.duration)
                          }
                        : undefined
                    }
                    onEnded={active ? () => goTo(index + 1) : undefined}
                    onError={() => setFailed((f) => ({ ...f, [item.id]: true }))}
                  />
                )}

                <div className="vslider__shade" aria-hidden />
                <div className="vslider__shine" aria-hidden />

                {active ? (
                  <>
                    <button
                      type="button"
                      className="vslider__surface"
                      onClick={togglePlay}
                      tabIndex={-1}
                      aria-hidden
                    />

                    <div className="vslider__progress" aria-hidden>
                      <span style={{ transform: `scaleX(${progress})` }} />
                    </div>

                    <div className="vslider__top">
                      <button
                        type="button"
                        className="vslider__icon-btn"
                        onClick={togglePlay}
                        aria-label={playing ? t('gallery.pause') : t('gallery.play')}
                      >
                        <Icon name={playing ? 'pause' : 'play'} size={18} />
                      </button>
                      <button
                        type="button"
                        className={`vslider__icon-btn ${sound ? 'is-on' : ''}`}
                        onClick={() => setSound((s) => !s)}
                        aria-pressed={sound}
                        aria-label={sound ? t('media.soundOff') : t('media.soundOn')}
                      >
                        <Icon name={sound ? 'volume' : 'mute'} size={18} />
                      </button>
                    </div>

                    {!playing && (
                      <span className="vslider__big-play" aria-hidden>
                        <Icon name="play" size={30} />
                      </span>
                    )}

                    <div className="vslider__caption">
                      <span className="vslider__count" dir="ltr">
                        {pad(item.v + 1)} <span aria-hidden>/</span> {pad(COUNT)}
                      </span>
                      <h3 className="vslider__title">
                        {title.split(' ').map((word, w) => (
                          <span className="vslider__word-mask" key={`${w}-${word}`}>
                            <span className="vslider__word">{word}</span>
                          </span>
                        ))}
                      </h3>
                    </div>
                  </>
                ) : (
                  <button
                    type="button"
                    className="vslider__surface"
                    tabIndex={-1}
                    onClick={() => !dragging.current && goTo(i, true)}
                    aria-label={t('gallery.goTo', { n: item.v + 1, title })}
                  />
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="vslider__controls">
        <button
          type="button"
          className="vslider__arrow"
          onClick={() => goTo(index - 1, true)}
          aria-label={t('gallery.prev')}
        >
          <Icon name={isRtl ? 'chevronRight' : 'chevronLeft'} size={22} />
        </button>

        <div className="vslider__tabs">
          {VIDEOS.map((video, v) => (
            <button
              key={video.id}
              type="button"
              className={`vslider__tab ${v === activeVideo ? 'is-active' : ''}`}
              onClick={() => goToVideo(v)}
              aria-label={t('gallery.goTo', { n: v + 1, title: titleOf(v) })}
              aria-current={v === activeVideo ? 'true' : undefined}
            >
              <span className="vslider__tab-num">{pad(v + 1)}</span>
              <span className="vslider__tab-title">{titleOf(v)}</span>
              <span className="vslider__tab-bar" aria-hidden>
                <span style={{ transform: `scaleX(${v === activeVideo ? progress : 0})` }} />
              </span>
            </button>
          ))}
        </div>

        <button
          type="button"
          className="vslider__arrow"
          onClick={() => goTo(index + 1, true)}
          aria-label={t('gallery.next')}
        >
          <Icon name={isRtl ? 'chevronLeft' : 'chevronRight'} size={22} />
        </button>
      </div>

      <p className="vslider__hint" aria-hidden>
        {t('gallery.swipe')}
      </p>

      <span className="sr-only" aria-live="polite">
        {announce}
      </span>
    </div>
  )
}

export default function Gallery() {
  const { t } = useTranslation()

  return (
    <section id="gallery" className="gallery section">
      <div className="container">
        <SectionHeader
          label={t('gallery.label')}
          title={t('gallery.title')}
          subtitle={t('gallery.subtitle')}
          centered
        />
        <VideoSlider />
      </div>
    </section>
  )
}

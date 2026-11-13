# Video Slider — Handoff Spec & Accessibility Audit

Component: `VideoSlider` in [src/components/Gallery.jsx](../src/components/Gallery.jsx) · Styles: `.vslider*` in [src/index.css](../src/index.css)

## Overview

The Gallery section shows the restaurant's vertical (9:16) short videos as a looping **coverflow carousel**. The active video sits large in the center and plays muted. Up to two cards on each side are tilted back, pushed deeper in 3D and dimmed. When there are fewer than 6 videos, the list repeats around the loop so the stage always looks full. All motion runs on **GSAP** (`gsap` + `@gsap/react` `useGSAP`). A story-style progress bar fills while the video plays, and the slider advances to the next video when one ends. The design follows the familiar Instagram/TikTok "stories" pattern, so guests understand it without instructions. The videos come from the restaurant's TikTok.

To add a video, put the file in `public/assets/videos/` and add an entry to `VIDEOS` plus a title in `gallery.items` in each locale (`en`, `fr`, `ar`). Everything else adapts to the new count.

## Layout

```
┌──────────────── .vslider (region) ─────────────────┐
│        ╱‾‾‾╲   ┌──────────────┐   ╱‾‾‾╲            │
│       │prev │  │ ▬▬▬▬▬▬───────│  │next │  .stage   │
│       │dim  │  │ [❚❚]    [🔇] │  │dim  │  (perspective)
│       │-24° │  │              │  │+24° │           │
│       │ 80% │  │  01 / 03     │  │ 80% │           │
│        ╲___╱   │  Title       │   ╲___╱            │
│                └──────────────┘                    │
│      (‹)   01 ▬▬▬   02 ───   03 ───   (›)  .controls│
└────────────────────────────────────────────────────┘
```

- All slides share one CSS grid cell (`grid-area: 1/1`) and are positioned with transforms only. Nothing triggers layout during animation.
- Slide size: `height: 100%` of the stage, `aspect-ratio: 9/16`, `max-width: 82vw`.
- Stage height: `clamp(420px, 64vh, 640px)` on desktop and `min(68vh, 560px)` at ≤640px.

## Design Tokens Used

| Token | Value | Usage |
|---|---|---|
| `--color-gold` | #d6b27c | Tab numbers, active borders, progress fill end |
| `--color-gold-light` | #ecd3a6 | Progress fill start, arrow icons, counter |
| `--color-on-gold` | #1a120a | Icons on gold (sound-on, big play, hovered arrow) |
| `--color-surface` | #1c1814 | Slide background while the video loads |
| `--color-border` | gold @ 16% | Slide and arrow borders |
| `--color-muted` | #b5aa9a | Inactive tab titles, swipe hint |
| `--radius-xl` | 28px | Slide corners |
| `--font-display` | Cormorant Garamond 600 | Slide title, tab numbers |
| `--font-arabic` | Noto Sans Arabic | Slide title in Arabic |
| `--ease-out` / `ease` | cubic-bezier(.22,1,.36,1) | All slide transitions |

## Components

| Element | Class | Notes |
|---|---|---|
| Region | `.vslider` | `role="region"`, `aria-roledescription="carousel"`; handles ←/→ keys |
| Stage | `.vslider__stage` | Pointer swipe: follows the finger at 35% and springs back with GSAP; `touch-action: pan-y` keeps vertical page scroll |
| Slide shell / card | `.vslider__slide` / `.vslider__card` | GSAP positions the shell; the inner card holds the visuals and tilts toward the mouse |
| Light sweep | `.vslider__shine` | Hidden at rest; GSAP sweeps it across on each change |
| Slide | `.vslider__slide(.is-active)` | `role="group"`, `aria-roledescription="slide"`, label "Video 1 of 3: Title" |
| Progress (story bar) | `.vslider__progress` | 3px; `scaleX(currentTime/duration)` |
| Play/pause, sound | `.vslider__icon-btn(.is-on)` | 44×44, glass background; sound turns gold when on |
| Big play | `.vslider__big-play` | 76px gold disc, only while paused; pulses |
| Caption | `.vslider__count`, `.vslider__title` | Counter forced LTR so it reads "02 / 03" in Arabic |
| Arrows | `.vslider__arrow` | 52×52; mirrored icons in RTL |
| Tabs | `.vslider__tab(.is-active)` | Number + title + mini progress bar; `aria-current` |

## States and Interactions

| Element | State | Behavior |
|---|---|---|
| Active video | Default | Autoplays muted when ≥35% on screen; pauses when scrolled away |
| Active video | Tap/click | Toggles play/pause (ignored right after a drag) |
| Active video | Ended | Advances to the next slide (loops from last to first) |
| Neighbor slide | Tap/click | Becomes active |
| Stage | Drag/swipe | ≥50px or a fast flick → next/prev (direction flipped in RTL) |
| Sound button | Click | Unmutes the active video; when the slide changes, the new video keeps the setting; if the browser blocks sound it falls back to muted |
| Arrow | Hover | Fills gold, icon turns dark, scale 1.05 |
| Tab | Hover / active | Text turns cream; active tab's bar shows live progress |
| Any button | Keyboard focus | 2px `--color-gold-light` outline, 3px offset (global `:focus-visible`) |

## Responsive Behavior

| Breakpoint | Changes |
|---|---|
| > 640px | Tabs show number + title (title ellipsized); stage up to 640px tall |
| ≤ 640px | Tabs show number only (44px wide); stage `min(68vh, 560px)`; "Swipe to explore" hint appears; neighbors peek at the screen edges |

## Edge Cases

- **Video fails to load**: the slide shows a dark gradient with its large gold number (`.vslider__placeholder`). Navigation still works.
- **Slow connection**: only the active video and its two neighbors preload metadata (`#t=0.1` shows the first frame as a poster); the others use `preload="none"`.
- **Long titles** (French or Arabic): the caption wraps over at most a few lines at the bottom of the slide, and tab titles ellipsize.
- **One video**: no neighbors appear; arrows and tabs still render but stay on the same slide. Hide `.vslider__controls` if this happens.
- **More videos**: cards more than two steps away hide (`autoAlpha: 0`), and the carousel still loops through all of them. With fewer than 6 videos the list repeats in the loop, so the numbered tabs jump to the nearest copy.

## Animation / Motion

| Element | Trigger | Animation | Duration | Easing |
|---|---|---|---|---|
| Slides | Index change | xPercent 0 / ±64 / ±116, z 0 / −160 / −320, rotationY ∓30°, scale 1 / 0.9 / 0.8, brightness 1 / 0.5 / 0.3 | 950ms | `power3.out` |
| Cards wrapping around the back | Index change | Jump into place (`gsap.set`) so they never fly across the stage | 0 | — |
| Title words | Slide becomes active | Rise out of a mask (yPercent 110 → 0), 60ms stagger | 700ms | `power3.out` |
| Light sweep | Slide becomes active | xPercent −160 → 260 | 1.3s | `power2.inOut` |
| Cards | First scroll into view | Rise 140px + fade, staggered from the center | 1.2s, 90ms stagger | `power4.out` |
| Active card | Mouse move (hover devices) | Tilt up to ±5° on each axis (`gsap.quickTo`) | 600ms | `power3.out` |
| Glow | Always | Scale 1 → 1.15, opacity 0.5 → 0.75, yoyo | 3.2s loop | `sine.inOut` |
| Progress bars | `timeupdate` (~4×/s) | scaleX | 250ms | linear |
| Big play | Paused | Halo pulse | 2.4s loop | ease-in-out |

With **reduced motion** turned on (`prefers-reduced-motion`), videos don't autoplay (the play button shows instead), and every GSAP animation in the slider is skipped: cards jump into place with no tilt, sweep, word reveal or glow. The rest of the page uses the same rule: every section checks `motionOK()` from [src/animations/gsap.js](../src/animations/gsap.js) and skips its animations when it returns false.

---

## Accessibility Audit: Video Slider

**Standard:** WCAG 2.1 AA · **Date:** 2026-11-13 · **Method:** code review + headless Chrome screenshots (EN, FR, AR/RTL, 1440px and 390px). No screen reader was tested yet; manual NVDA/VoiceOver testing is still needed.

### Summary
**Issues found:** 3 · **Critical:** 0 · **Major:** 1 (fixed) · **Minor:** 2

### Findings

| # | Issue | WCAG | Severity | Status / Recommendation |
|---|---|---|---|---|
| 1 | The hero background video loops with no pause control | 2.2.2 Pause, Stop, Hide | 🟡 Major | ✅ Fixed: pause button in the hero (bottom corner); no autoplay with reduced motion |
| 2 | Videos have no captions | 1.2.2 Captions | 🟢 Minor | Open: needed only if the videos contain speech; they are muted ambience by default |
| 3 | Arrow button border is low contrast (gold @ 16%) | 1.4.11 Non-text contrast | 🟢 Minor | Accepted: the icon itself (#ecd3a6, 9:1+) identifies the control |
| — | Slider autoplays | 2.2.2 | ✅ Fixed | Pause button on the slide, pauses off-screen, no autoplay with reduced motion |
| — | Animations ignored the reduced-motion setting | 2.3.3 (AAA) / best practice | ✅ Fixed | Every GSAP animation is gated by `motionOK()` |
| — | Emoji used as icons (🔊 ▶ ‹ ›) | 1.1.1 / 4.1.2 | ✅ Fixed | SVG icons with `aria-hidden`; buttons carry translated `aria-label`s |

### Color Contrast Check

| Element | Foreground | Background | Ratio | Required | Pass? |
|---|---|---|---|---|---|
| Inactive tab title | #b5aa9a | #0c0a08 | 8.6:1 | 4.5:1 | ✅ |
| Tab number | #d6b27c | #0c0a08 | 9.8:1 | 4.5:1 | ✅ |
| Icon on gold | #1a120a | #d6b27c | 9.3:1 | 3:1 | ✅ |
| Slide title (cream on 90% dark shade) | #f7f1e8 | ≈#171411 | >12:1 | 3:1 (large) | ✅ |
| Progress track | white @ 22% | video | n/a | decorative | — |

### Keyboard Navigation

| Element | Tab order | Enter/Space | Arrow keys |
|---|---|---|---|
| Play/pause | 1 | Toggle playback | ←/→ change slide (focus inside region) |
| Sound | 2 | Toggle sound | same |
| Prev arrow | 3 | Previous slide | same |
| Tabs 01…N | 4… | Go to slide | same |
| Next arrow | last | Next slide | same |

Neighbor slides and the tap surface are `tabIndex=-1`, so keyboard users get one clear path through the controls.

### Screen Reader

| Element | Announced as |
|---|---|
| Region | "Video gallery, carousel" |
| Active slide | "Video 1 of 3: Signature Plates, slide" |
| Inactive slides | Hidden (`aria-hidden`) |
| Slide change (user-initiated) | Polite live region: "Video 2 of 3: Around the Table" |
| Autoplay advance | Not announced, so automatic changes don't interrupt |

### Priority Fixes
1. **Add captions if any video has speech**: affects deaf and hard-of-hearing visitors.
2. **Test with NVDA and VoiceOver**: confirms the announcements above on real assistive technology.

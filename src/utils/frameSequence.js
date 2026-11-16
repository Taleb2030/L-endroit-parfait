// Turns a video into an image sequence *in the browser*, so it can be scrubbed
// smoothly with scroll (seeking a <video> directly is choppy).
// Frames are captured coarse-to-fine: the whole timeline is roughly covered
// after a few frames, then gaps fill in. Each frame is kept as a compressed
// JPEG blob (small in memory, fast to encode) and decoded by the browser when drawn.

/** 0, n-1, then halves, quarters… so early frames span the whole clip. */
function coarseToFine(n) {
  const out = [0, n - 1]
  const seen = new Set(out)
  for (let step = 2 ** Math.ceil(Math.log2(n)); step >= 1; step /= 2) {
    for (let i = 0; i < n; i += step) {
      if (!seen.has(i)) {
        seen.add(i)
        out.push(i)
      }
    }
  }
  return out
}

/** Wait for a media event, failing after `ms` so one stuck step can't freeze everything. */
const once = (el, type, ms = 8000) =>
  new Promise((resolve, reject) => {
    const timer = setTimeout(() => finish(new Error(`video ${type} timed out`)), ms)
    const ok = () => finish()
    const fail = () => finish(new Error(`video ${type} failed`))
    function finish(err) {
      clearTimeout(timer)
      el.removeEventListener(type, ok)
      el.removeEventListener('error', fail)
      err ? reject(err) : resolve()
    }
    el.addEventListener(type, ok)
    el.addEventListener('error', fail)
  })

const timeout = (ms) => new Promise((r) => setTimeout(r, ms))

/**
 * @param {string} src         video URL (same origin)
 * @param {object} opts
 * @param {number} opts.count  number of frames to capture
 * @param {number} opts.width  max frame width in px
 * @param {(ready:number, total:number) => void} [opts.onProgress]
 */
export function createFrameSequence(src, { count = 60, width = 1080, onProgress } = {}) {
  const frames = new Array(count).fill(null)
  let cancelled = false
  let ready = 0
  const urls = []

  const video = document.createElement('video')
  video.muted = true
  video.playsInline = true
  video.preload = 'auto'
  video.src = src

  const done = (async () => {
    // Some browsers only fetch an off-page video's data once it plays (iOS,
    // data-saver, headless) — so start a muted play first, but never wait long
    video.load()
    try {
      await Promise.race([video.play(), timeout(1500)])
    } catch {
      /* autoplay blocked — seeking still works on most browsers */
    }
    if (video.readyState < 2) await once(video, 'loadeddata', 15000)
    video.pause()

    const w = Math.min(width, video.videoWidth || width)
    const h = Math.round((w * video.videoHeight) / video.videoWidth)
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    const last = Math.max(0, video.duration - 0.05)

    for (const i of coarseToFine(count)) {
      if (cancelled) return
      video.currentTime = (i / (count - 1)) * last
      try {
        await once(video, 'seeked', 4000)
      } catch {
        continue // skip a frame that won't seek; neighbours fill the gap
      }
      ctx.drawImage(video, 0, 0, w, h)
      const blob = await new Promise((r) => canvas.toBlob(r, 'image/jpeg', 0.82))
      if (!blob || cancelled) continue
      const url = URL.createObjectURL(blob)
      urls.push(url)
      const img = new Image()
      img.src = url
      await img.decode().catch(() => {})
      frames[i] = img
      ready += 1
      onProgress?.(ready, count)
    }
    video.removeAttribute('src')
    video.load()
  })()

  /** Nearest captured frame to a fractional index (searches outward). */
  const nearest = (index) => {
    const target = Math.round(Math.max(0, Math.min(count - 1, index)))
    for (let d = 0; d < count; d++) {
      if (frames[target - d]) return frames[target - d]
      if (frames[target + d]) return frames[target + d]
    }
    return null
  }

  return {
    count,
    done,
    nearest,
    dispose() {
      cancelled = true
      urls.forEach((u) => URL.revokeObjectURL(u))
    },
  }
}

/** Draw an image so it covers the whole canvas (like CSS object-fit: cover). */
export function drawCover(ctx, img, cw, ch) {
  const ir = img.width / img.height
  const cr = cw / ch
  let w, h
  if (ir > cr) {
    h = ch
    w = h * ir
  } else {
    w = cw
    h = w / ir
  }
  ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h)
}

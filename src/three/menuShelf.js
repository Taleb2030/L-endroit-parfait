// Menu "shelf": dish cards standing on a curved arc (coverflow). The selected
// dish slides forward and turns to face the viewer. Card faces are decorative
// illustrations only — names, descriptions and prices stay real HTML.
import * as THREE from 'three'

// One colour story per menu category (starters, mains, desserts, drinks)
const CATEGORY_STYLES = [
  { main: '#3f5a3c', soft: '#a9c29a', food: ['#6f8f5a', '#c9d8bd', '#e8b08c', '#f3e7c9'] },
  { main: '#a4532f', soft: '#e8b08c', food: ['#8c4426', '#c7713f', '#e9c08e', '#6f8f5a'] },
  { main: '#8e4a5a', soft: '#e9b7b9', food: ['#5a3428', '#c98a6a', '#f2d4c4', '#b8536a'] },
  { main: '#1f5e63', soft: '#8fc3c0', food: ['#2f7f6f', '#d9a441', '#f0c8a0', '#9fd0c4'] },
]
const PAPER = '#fbf8f2'
const CARD_W = 1.1
const CARD_H = 1.5

// Small deterministic random so each dish always gets the same illustration
function rng(seed) {
  let s = seed * 9301 + 49297
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

function drawCard(canvas, index, style, fontFamily) {
  const ctx = canvas.getContext('2d')
  const W = canvas.width
  const H = canvas.height
  const r = rng(index + 7)

  // Paper + soft vignette
  ctx.fillStyle = PAPER
  ctx.fillRect(0, 0, W, H)
  const vig = ctx.createRadialGradient(W / 2, H * 0.42, W * 0.2, W / 2, H * 0.5, W * 0.9)
  vig.addColorStop(0, 'rgba(255,255,255,0)')
  vig.addColorStop(1, 'rgba(120,90,60,0.08)')
  ctx.fillStyle = vig
  ctx.fillRect(0, 0, W, H)

  // Double frame, like a printed menu card
  ctx.strokeStyle = style.main
  ctx.lineWidth = 3
  ctx.strokeRect(22, 22, W - 44, H - 44)
  ctx.lineWidth = 1
  ctx.globalAlpha = 0.6
  ctx.strokeRect(34, 34, W - 68, H - 68)
  ctx.globalAlpha = 1

  // Plate seen from above
  const cx = W / 2
  const cy = H * 0.42
  const R = W * 0.32
  ctx.save()
  ctx.shadowColor = 'rgba(60,40,20,0.22)'
  ctx.shadowBlur = 28
  ctx.shadowOffsetY = 10
  ctx.fillStyle = '#ffffff'
  ctx.beginPath()
  ctx.arc(cx, cy, R, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
  ctx.strokeStyle = style.soft
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.arc(cx, cy, R * 0.93, 0, Math.PI * 2)
  ctx.stroke()
  ctx.fillStyle = '#f7f3ec'
  ctx.beginPath()
  ctx.arc(cx, cy, R * 0.7, 0, Math.PI * 2)
  ctx.fill()

  // Abstract "food": soft blobs + garnish leaves, unique per dish
  const blobs = 5 + Math.floor(r() * 5)
  for (let i = 0; i < blobs; i++) {
    const a = r() * Math.PI * 2
    const d = r() * R * 0.38
    const br = R * (0.12 + r() * 0.2)
    ctx.fillStyle = style.food[Math.floor(r() * style.food.length)]
    ctx.globalAlpha = 0.85
    ctx.beginPath()
    ctx.ellipse(cx + Math.cos(a) * d, cy + Math.sin(a) * d, br, br * (0.7 + r() * 0.3), r() * Math.PI, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalAlpha = 1
  const leaves = 3 + Math.floor(r() * 4)
  for (let i = 0; i < leaves; i++) {
    const a = r() * Math.PI * 2
    const d = R * (0.1 + r() * 0.4)
    ctx.save()
    ctx.translate(cx + Math.cos(a) * d, cy + Math.sin(a) * d)
    ctx.rotate(r() * Math.PI)
    ctx.fillStyle = '#4f7a46'
    ctx.beginPath()
    ctx.ellipse(0, 0, R * 0.09, R * 0.035, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }
  // Sauce dots around the rim
  ctx.fillStyle = style.main
  for (let i = 0; i < 7; i++) {
    const a = -Math.PI * 0.9 + i * 0.16
    ctx.beginPath()
    ctx.arc(cx + Math.cos(a) * R * 0.8, cy + Math.sin(a) * R * 0.8, 4 + i * 0.6, 0, Math.PI * 2)
    ctx.fill()
  }

  // Ornament + dish number (decorative)
  const oy = H * 0.76
  ctx.strokeStyle = style.main
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(W * 0.3, oy)
  ctx.lineTo(W * 0.44, oy)
  ctx.moveTo(W * 0.56, oy)
  ctx.lineTo(W * 0.7, oy)
  ctx.stroke()
  ctx.fillStyle = style.main
  ctx.save()
  ctx.translate(W / 2, oy)
  ctx.rotate(Math.PI / 4)
  ctx.fillRect(-7, -7, 14, 14)
  ctx.restore()

  ctx.fillStyle = style.main
  ctx.font = `600 ${Math.round(W * 0.15)}px ${fontFamily}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(String(index + 1).padStart(2, '0'), W / 2, H * 0.87)
}

function shadowTexture() {
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const ctx = c.getContext('2d')
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64)
  g.addColorStop(0, 'rgba(60,45,30,0.45)')
  g.addColorStop(1, 'rgba(60,45,30,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 128, 128)
  return new THREE.CanvasTexture(c)
}

/**
 * @param {HTMLCanvasElement} canvas
 * @param {object} opts
 * @param {number[]} opts.categories  category index for each dish (length = dish count)
 * @param {(index:number) => void} opts.onSelect  user clicked a card
 * @param {(step:number) => void} opts.onStep    user swiped (+1 next / -1 previous)
 */
export function createMenuShelf(canvas, { categories, onSelect, onStep }) {
  const count = categories.length
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setClearColor(0x000000, 0)

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 50)

  scene.add(new THREE.HemisphereLight(0xffffff, 0xe9dccb, 2.4))
  const key = new THREE.DirectionalLight(0xffffff, 1.4)
  key.position.set(2, 3, 5)
  scene.add(key)

  const geometry = new THREE.BoxGeometry(CARD_W, CARD_H, 0.035)
  const shadowGeo = new THREE.PlaneGeometry(1, 1)
  const shadowTex = shadowTexture()
  const fontFamily = '"Cormorant Garamond", Georgia, serif'

  const cards = []
  const shadows = []
  const textures = []
  const materials = []
  const paperMat = new THREE.MeshStandardMaterial({ color: PAPER, roughness: 0.9 })
  materials.push(paperMat)

  for (let i = 0; i < count; i++) {
    const style = CATEGORY_STYLES[categories[i] % CATEGORY_STYLES.length]
    const face = document.createElement('canvas')
    face.width = 512
    face.height = 698
    drawCard(face, i, style, fontFamily)
    const tex = new THREE.CanvasTexture(face)
    tex.colorSpace = THREE.SRGBColorSpace
    tex.anisotropy = 4
    textures.push({ tex, face, style, i })

    const edge = new THREE.MeshStandardMaterial({ color: style.main, roughness: 0.6 })
    const front = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.75 })
    materials.push(edge, front)
    // BoxGeometry face order: +x, -x, +y, -y, +z (front), -z (back)
    const mesh = new THREE.Mesh(geometry, [edge, edge, edge, edge, front, paperMat])
    mesh.userData.index = i
    scene.add(mesh)
    cards.push(mesh)

    const sm = new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false })
    materials.push(sm)
    const shadow = new THREE.Mesh(shadowGeo, sm)
    shadow.rotation.x = -Math.PI / 2
    scene.add(shadow)
    shadows.push(shadow)
  }

  // Redraw the numbers once the display font has loaded
  document.fonts?.load(`600 64px ${fontFamily}`).then(() => {
    textures.forEach(({ tex, face, style, i }) => {
      drawCard(face, i, style, fontFamily)
      tex.needsUpdate = true
    })
  })

  let small = false
  const resize = () => {
    const w = canvas.clientWidth
    const h = canvas.clientHeight
    if (!w || !h) return
    small = w < 700
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.position.set(0, 0.2, small ? 6.2 : 5.4)
    camera.lookAt(0, -0.05, 0)
    camera.updateProjectionMatrix()
  }
  const ro = new ResizeObserver(resize)
  ro.observe(canvas)
  resize()

  // --- Input: click a card, or swipe sideways ---------------------------
  const raycaster = new THREE.Raycaster()
  const ndc = new THREE.Vector2()
  let downX = 0
  let downY = 0
  const onDown = (e) => {
    downX = e.clientX
    downY = e.clientY
  }
  const onUp = (e) => {
    const dx = e.clientX - downX
    const dy = e.clientY - downY
    const rtl = document.documentElement.dir === 'rtl'
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
      onStep?.((dx < 0 ? 1 : -1) * (rtl ? -1 : 1))
      return
    }
    if (Math.hypot(dx, dy) > 8) return
    const rect = canvas.getBoundingClientRect()
    ndc.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1)
    raycaster.setFromCamera(ndc, camera)
    const hit = raycaster.intersectObjects(cards.filter((c) => c.visible))[0]
    if (hit) onSelect?.(hit.object.userData.index)
  }
  canvas.addEventListener('pointerdown', onDown)
  canvas.addEventListener('pointerup', onUp)

  // --- Layout loop -------------------------------------------------------
  let target = 0
  let current = 0
  const timer = new THREE.Timer()

  const render = (time) => {
    timer.update(time)
    const t = timer.getElapsed()
    // Frame-rate independent easing: same speed at 30, 60 or 120 fps
    const k = 1 - Math.pow(1 - 0.09, Math.min(timer.getDelta(), 0.1) * 60)
    current += (target - current) * k
    const dir = document.documentElement.dir === 'rtl' ? -1 : 1
    const step = small ? 0.46 : 0.36
    const R = 4.2

    for (let i = 0; i < count; i++) {
      const card = cards[i]
      const d = i - current
      const visible = Math.abs(d) < 6
      card.visible = visible
      shadows[i].visible = visible
      if (!visible) continue

      const a = d * step
      const focus = Math.max(0, 1 - Math.abs(d)) // 1 = selected
      card.position.set(
        dir * R * Math.sin(a),
        focus * Math.sin(t * 1.4) * 0.035,
        -R * (1 - Math.cos(a)) + focus * 0.75
      )
      card.rotation.y = -dir * a * 1.1 * (1 - focus)
      card.rotation.x = -0.04
      card.scale.setScalar(1 + focus * 0.16)

      const s = shadows[i]
      s.position.set(card.position.x, -CARD_H * 0.62, card.position.z + 0.05)
      s.scale.set(1.5 * card.scale.x, 0.55, 1)
      s.material.opacity = 0.55 + focus * 0.45
    }
    renderer.render(scene, camera)
  }

  let running = false
  const start = () => {
    if (running) return
    running = true
    renderer.setAnimationLoop(render)
  }
  const stop = () => {
    running = false
    renderer.setAnimationLoop(null)
  }
  start()

  return {
    setTarget: (i) => {
      target = i
    },
    start,
    stop,
    dispose() {
      stop()
      ro.disconnect()
      canvas.removeEventListener('pointerdown', onDown)
      canvas.removeEventListener('pointerup', onUp)
      geometry.dispose()
      shadowGeo.dispose()
      shadowTex.dispose()
      textures.forEach(({ tex }) => tex.dispose())
      materials.forEach((m) => m.dispose())
      renderer.dispose()
    },
  }
}

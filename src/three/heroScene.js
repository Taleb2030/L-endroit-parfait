// Hero "candle-light" scene: soft glowing motes drifting upward over the video,
// like warm light and steam in a dining room. Plain three.js (no React layer),
// loaded lazily by <HeroCanvas> so it never blocks the first paint.
import * as THREE from 'three'

// Palette — ivory light, terracotta glow, a hint of olive (matches the site)
const COLORS = ['#fff4e2', '#fff4e2', '#f2c9ae', '#e8b08c', '#c9d8bd']

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uHeight;
  attribute float aSize;
  attribute float aSpeed;
  attribute float aPhase;
  attribute vec3 aColor;
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vec3 p = position;
    // Rise slowly and wrap around, swaying gently side to side
    p.y = mod(p.y + uTime * aSpeed + uHeight * 0.5, uHeight) - uHeight * 0.5;
    p.x += sin(uTime * 0.35 + aPhase) * 0.35;
    p.z += cos(uTime * 0.25 + aPhase) * 0.25;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aSize * uPixelRatio * (9.0 / -mv.z);

    // Fade in at the bottom, out at the top, and twinkle softly
    float edge = smoothstep(-0.5, -0.3, p.y / uHeight) * (1.0 - smoothstep(0.25, 0.5, p.y / uHeight));
    float twinkle = 0.65 + 0.35 * sin(uTime * 1.3 + aPhase * 3.0);
    vAlpha = edge * twinkle;
    vColor = aColor;
  }
`

const fragmentShader = /* glsl */ `
  uniform float uOpacity;
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    // Bright core with a wide soft halo (bokeh)
    float core = smoothstep(0.5, 0.0, d);
    float glow = pow(core, 2.2);
    gl_FragColor = vec4(vColor, glow * vAlpha * uOpacity);
  }
`

export function createHeroScene(canvas, { reducedMotion = false } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: 'low-power' })
  const dpr = Math.min(window.devicePixelRatio, 2)
  renderer.setPixelRatio(dpr)
  renderer.setClearColor(0x000000, 0)

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 50)
  camera.position.set(0, 0, 8)

  // Fewer particles on small screens
  const isSmall = window.innerWidth < 700
  const count = isSmall ? 260 : 560
  const height = 14
  const width = isSmall ? 9 : 18

  const positions = new Float32Array(count * 3)
  const sizes = new Float32Array(count)
  const speeds = new Float32Array(count)
  const phases = new Float32Array(count)
  const colors = new Float32Array(count * 3)
  const color = new THREE.Color()

  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * width
    positions[i * 3 + 1] = (Math.random() - 0.5) * height
    positions[i * 3 + 2] = (Math.random() - 0.5) * 8
    // Mostly tiny motes, a few big soft bokeh discs
    const big = Math.random() < 0.08
    sizes[i] = big ? 18 + Math.random() * 26 : 3 + Math.random() * 7
    speeds[i] = (big ? 0.08 : 0.15) + Math.random() * 0.25
    phases[i] = Math.random() * Math.PI * 2
    color.set(COLORS[(Math.random() * COLORS.length) | 0])
    colors.set([color.r, color.g, color.b], i * 3)
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))
  geometry.setAttribute('aSpeed', new THREE.BufferAttribute(speeds, 1))
  geometry.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1))
  geometry.setAttribute('aColor', new THREE.BufferAttribute(colors, 3))

  const uniforms = {
    uTime: { value: 0 },
    uPixelRatio: { value: dpr },
    uHeight: { value: height },
    uOpacity: { value: 0 },
  }
  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  })
  const points = new THREE.Points(geometry, material)
  scene.add(points)

  // Mouse parallax (eased in the loop)
  const pointer = { x: 0, y: 0 }
  const onPointer = (e) => {
    pointer.x = (e.clientX / window.innerWidth - 0.5) * 2
    pointer.y = (e.clientY / window.innerHeight - 0.5) * 2
  }
  if (!reducedMotion) window.addEventListener('pointermove', onPointer, { passive: true })

  const resize = () => {
    const w = canvas.clientWidth
    const h = canvas.clientHeight
    if (!w || !h) return
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
  }
  const ro = new ResizeObserver(resize)
  ro.observe(canvas)
  resize()

  const clock = new THREE.Clock()
  let scrollProgress = 0 // 0 at top of hero → 1 when hero has scrolled away

  const render = () => {
    const t = clock.getElapsedTime()
    uniforms.uTime.value = reducedMotion ? 12 : t
    // Fade in over the first 2s, fade out as the hero scrolls away
    uniforms.uOpacity.value = Math.min(1, t / 2) * (1 - scrollProgress * 0.9)
    camera.position.x += (pointer.x * 0.6 - camera.position.x) * 0.04
    camera.position.y += (-pointer.y * 0.4 - camera.position.y) * 0.04
    camera.position.z = 8 - scrollProgress * 2.5 // gentle dolly-in while scrolling
    camera.lookAt(0, 0, 0)
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

  if (reducedMotion) {
    uniforms.uOpacity.value = 1
    clock.elapsedTime = 2
    render()
  } else {
    start()
  }

  return {
    start: () => !reducedMotion && start(),
    stop,
    setScroll: (p) => {
      scrollProgress = p
      if (reducedMotion) render()
    },
    dispose: () => {
      stop()
      ro.disconnect()
      window.removeEventListener('pointermove', onPointer)
      geometry.dispose()
      material.dispose()
      renderer.dispose()
    },
  }
}

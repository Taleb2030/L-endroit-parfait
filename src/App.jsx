import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import './i18n'
import { useRtl } from './hooks/useRtl'
import { ScrollTrigger } from './animations/gsap'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import Gallery from './components/Gallery'
import Experience from './components/Experience'
import Contact from './components/Contact'
import Footer from './components/Footer'

function App() {
  useRtl()
  const { i18n } = useTranslation()

  // Text length and direction change with the language — re-measure scroll triggers
  useEffect(() => {
    const id = requestAnimationFrame(() => ScrollTrigger.refresh())
    return () => cancelAnimationFrame(id)
  }, [i18n.language])

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <About />
        <Gallery />
        <Experience />
        <Contact />
      </main>
      <Footer />
    </>
  )
}

export default App

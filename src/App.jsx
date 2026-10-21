import { useEffect, useState } from 'react'
import Navbar from './components/Navbar.jsx'
import Hero from './components/Hero.jsx'
import Features from './components/Features.jsx'
import Footer from './components/Footer.jsx'
import Notice from './components/Notice.jsx'
import PredictPage from './pages/PredictPage.jsx'
import AuthPage from './pages/AuthPage.jsx'

// Simple routing without a library: the URL hash decides which page shows.
// Each page has its own hash; anything else shows the homepage.
const PAGE_HASHES = { '#/predict': 'predict', '#/login': 'login', '#/register': 'register' }

function getRoute() {
  return PAGE_HASHES[window.location.hash] ?? 'home'
}

export default function App() {
  const [route, setRoute] = useState(getRoute)
  const [unavailable, setUnavailable] = useState(null)

  // Listen for hash changes (link clicks, browser back button).
  useEffect(() => {
    function onHashChange() {
      const hash = window.location.hash
      if (PAGE_HASHES[hash]) setRoute(PAGE_HASHES[hash])
      else if (hash === '' || hash === '#top' || hash === '#features') setRoute('home')
      // other hashes (like #contact) are in the footer, which is on every page
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  // After switching page, jump to the top or to the section that was requested.
  useEffect(() => {
    const hash = window.location.hash
    if (PAGE_HASHES[hash] || hash === '') {
      window.scrollTo(0, 0)
    } else {
      document.getElementById(hash.slice(1))?.scrollIntoView()
    }
  }, [route])

  return (
    <>
      <Navbar onUnavailable={setUnavailable} />
      {unavailable && (
        <Notice name={unavailable} onClose={() => setUnavailable(null)} />
      )}
      <main>
        {route === 'predict' ? (
          <PredictPage />
        ) : route === 'login' || route === 'register' ? (
          <AuthPage key={route} mode={route} />
        ) : (
          <>
            <Hero />
            <Features />
          </>
        )}
      </main>
      <Footer onUnavailable={setUnavailable} />
    </>
  )
}
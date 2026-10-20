import { useEffect, useState } from 'react'
import Navbar from './components/Navbar.jsx'
import Hero from './components/Hero.jsx'
import Features from './components/Features.jsx'
import Footer from './components/Footer.jsx'
import Notice from './components/Notice.jsx'
import PredictPage from './pages/PredictPage.jsx'

// Simple routing without a library: the URL hash decides which page shows.
// "#/predict" shows the Predict Disease page, anything else shows the homepage.
function getRoute() {
  return window.location.hash === '#/predict' ? 'predict' : 'home'
}

export default function App() {
  const [route, setRoute] = useState(getRoute)
  const [unavailable, setUnavailable] = useState(null)

  // Listen for hash changes (link clicks, browser back button).
  useEffect(() => {
    function onHashChange() {
      const hash = window.location.hash
      if (hash === '#/predict') setRoute('predict')
      else if (hash === '' || hash === '#top' || hash === '#features') setRoute('home')
      // other hashes (like #contact) are in the footer, which is on every page
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  // After switching page, jump to the top or to the section that was requested.
  useEffect(() => {
    const hash = window.location.hash
    if (hash === '#/predict' || hash === '') {
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
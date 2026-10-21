import { useState } from 'react'
import { useAuth } from '../AuthContext.jsx'
import './Navbar.css'

// href = real destination on this page; built:false = page does not exist yet
const links = [
  { label: 'Home', href: '#top', built: true },
  { label: 'Login', href: '#/login', built: true },
  { label: 'Predict Disease', href: '#/predict', built: true },
  { label: 'Hospitals', built: false },
  { label: 'About Us', built: false },
  { label: 'Contact', href: '#contact', built: true },
]

export default function Navbar({ onUnavailable }) {
  const [open, setOpen] = useState(false)
  const { user, logout } = useAuth()

  function handleClick(e, link) {
    setOpen(false)
    if (!link.built) {
      e.preventDefault()
      onUnavailable(link.label)
    }
  }

  async function handleLogout() {
    setOpen(false)
    const result = await logout()
    if (!result.ok) window.alert(`Could not log out: ${result.error}`)
  }

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <a href="#top" className="brand" aria-label="MEDS-AI home">
          <span className="brand-mark" aria-hidden="true">+</span>
          MEDS<span className="brand-ai">-AI</span>
        </a>

        <button
          className="menu-toggle"
          aria-expanded={open}
          aria-controls="nav-links"
          onClick={() => setOpen(!open)}
        >
          {open ? 'Close' : 'Menu'}
        </button>

        <nav id="nav-links" className={open ? 'nav-links open' : 'nav-links'} aria-label="Main">
          <ul>
            {links.map((link) =>
              // Login turns into Logout only when the server has confirmed a signed-in user.
              link.label === 'Login' && user ? (
                <li key="logout">
                  <button type="button" className="nav-logout" onClick={handleLogout}>Logout</button>
                </li>
              ) : (
                <li key={link.label}>
                  <a href={link.href ?? '#'} onClick={(e) => handleClick(e, link)}>
                    {link.label}
                  </a>
                </li>
              )
            )}
          </ul>
        </nav>
      </div>
    </header>
  )
}
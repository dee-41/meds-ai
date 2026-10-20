import { useState } from 'react'
import './Navbar.css'

// href = real destination on this page; built:false = page does not exist yet
const links = [
  { label: 'Home', href: '#top', built: true },
  { label: 'Login', built: false },
  { label: 'Predict Disease', href: '#/predict', built: true },
  { label: 'Hospitals', built: false },
]

export default function Navbar({ onUnavailable }) {
  const [open, setOpen] = useState(false)

  function handleClick(e, link) {
    setOpen(false)
    if (!link.built) {
      e.preventDefault()
      onUnavailable(link.label)
    }
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
            {links.map((link) => (
              <li key={link.label}>
                <a href={link.href ?? '#'} onClick={(e) => handleClick(e, link)}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  )
}
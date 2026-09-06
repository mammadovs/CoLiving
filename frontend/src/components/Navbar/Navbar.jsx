import { useState } from 'react'
import { Link } from 'react-router-dom'

import './Navbar.css'

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  const toggleMenu = () => {
    setIsMenuOpen((previous) => !previous)
  }

  return (
    <nav className="navbar">

      {/* Logo */}
      <div className="navbar-logo">
        <Link
          to="/"
          onClick={closeMenu}
        >
          CoLiving
        </Link>
      </div>

      {/* Mobile Menu Button */}
      <button
        type="button"
        className="menu-button"
        onClick={toggleMenu}
        aria-label="Toggle navigation menu"
        aria-expanded={isMenuOpen}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      {/* Navigation Menu */}
      <div
        className={`navbar-menu ${isMenuOpen ? 'open' : ''
          }`}
      >

        {/* Navigation Links */}
        <div className="navbar-links">

          <Link
            to="/"
            onClick={closeMenu}
          >
            Home
          </Link>

          <Link
            to="/rooms"
            onClick={closeMenu}
          >
            Find a Room
          </Link>

          <Link
            to="/about"
            onClick={closeMenu}
          >
            About
          </Link>

          <Link to="/messages" onClick={closeMenu}>Messages</Link>
          <Link to="/profile/me" onClick={closeMenu}>Profile</Link>
          <Link to="/listings/new" onClick={closeMenu}>List a room</Link>

        </div>

        {/* Authentication Buttons */}
        <div className="navbar-actions">

          <Link
            to="/login"
            className="login-button"
            onClick={closeMenu}
          >
            Log In
          </Link>

          <Link
            to="/signup"
            className="signup-button"
            onClick={closeMenu}
          >
            Sign Up
          </Link>

        </div>

      </div>

    </nav>
  )
}

export default Navbar
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import './Navbar.css'

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { isAuthenticated, logout } = useAuth()

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  const toggleMenu = () => {
    setIsMenuOpen((previous) => !previous)
  }

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/" onClick={closeMenu}>CoLiving</Link>
      </div>

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

      <div className={`navbar-menu ${isMenuOpen ? 'open' : ''}`}>
        <div className="navbar-links">
          <Link to="/" onClick={closeMenu}>Home</Link>
          <Link to="/rooms" onClick={closeMenu}>Find a Room</Link>
          <Link to="/about" onClick={closeMenu}>About</Link>
          <Link to="/messages" onClick={closeMenu}>Messages</Link>
          <Link to="/profile/me" onClick={closeMenu}>Profile</Link>
          <Link to="/listings/new" onClick={closeMenu}>List a room</Link>
        </div>

        <div className="navbar-actions">
          {isAuthenticated ? (
            <button
              type="button"
              className="login-button"
              onClick={() => {
                logout()
                closeMenu()
              }}
            >
              Log Out
            </button>
          ) : (
            <>
              <Link to="/login" className="login-button" onClick={closeMenu}>
                Log In
              </Link>
              <Link to="/signup" className="signup-button" onClick={closeMenu}>
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar

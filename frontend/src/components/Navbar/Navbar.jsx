import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import './Navbar.css'

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const closeMenu = () => setIsMenuOpen(false)
  const toggleMenu = () => setIsMenuOpen((prev) => !prev)

  const handleLogout = () => {
    logout()
    closeMenu()
    navigate('/')
  }

  return (
    <nav className="navbar">

      {/* Logo */}
      <div className="navbar-logo">
        <Link to="/" onClick={closeMenu}>CoLiving</Link>
      </div>

      {/* Mobile hamburger */}
      <button
        type="button"
        className="menu-button"
        onClick={toggleMenu}
        aria-label="Naviqasiya menyusunu aç/bağla"
        aria-expanded={isMenuOpen}
      >
        <span className={isMenuOpen ? 'open' : ''}></span>
        <span className={isMenuOpen ? 'open' : ''}></span>
        <span className={isMenuOpen ? 'open' : ''}></span>
      </button>

      {/* Desktop + Mobile menu */}
      <div className={`navbar-menu ${isMenuOpen ? 'open' : ''}`}>

        {/* Nav links */}
        <div className="navbar-links">
          <Link to="/" onClick={closeMenu}>Ana Səhifə</Link>
          <Link to="/listings" onClick={closeMenu}>Elanlar</Link>
          <Link to="/about" onClick={closeMenu}>Haqqında</Link>

          {/* Auth-dependent links — always in nav-links on mobile for easy access */}
          {user && (
            <>
              <Link to="/messages" onClick={closeMenu} className="nav-link-mobile-only">
                Mesajlar
              </Link>
              {user.is_student ? (
                <Link to="/listings" onClick={closeMenu} className="nav-link-mobile-only">
                  Elan Axtar
                </Link>
              ) : (
                <Link to="/my-listings" onClick={closeMenu} className="nav-link-mobile-only">
                  Elanlarım
                </Link>
              )}
              <Link to="/profile" onClick={closeMenu} className="nav-link-mobile-only">
                Profil
              </Link>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="navbar-actions">
          {user ? (
            <>
              {/* Desktop-only action links */}
              <Link to="/messages" onClick={closeMenu} className="nav-action-link">
                💬 Mesajlar
              </Link>
              {user.is_student ? null : (
                <Link to="/my-listings" onClick={closeMenu} className="nav-action-link">
                  🏠 Elanlarım
                </Link>
              )}
              <Link to="/profile" onClick={closeMenu} className="nav-action-link">
                👤 {user.full_name ? user.full_name.split(' ')[0] : 'Profil'}
              </Link>
              <button className="logout-button" onClick={handleLogout}>
                Çıxış
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="login-button" onClick={closeMenu}>
                Daxil ol
              </Link>
              <Link to="/signup" className="signup-button" onClick={closeMenu}>
                Qeydiyyat
              </Link>
            </>
          )}
        </div>

      </div>
    </nav>
  )
}

export default Navbar
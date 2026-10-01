import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Home, User, MessageCircle, PlusCircle, LogOut, ChevronDown } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

import './Navbar.css'

function UserDropdown({ user, onClose }) {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    onClose()
    navigate('/')
  }

  return (
    <div className="user-dropdown-menu" role="menu">
      <div className="user-dropdown-header">
        <span className="user-dropdown-name">{user?.name || user?.email}</span>
        <span className="user-dropdown-email">{user?.name ? user.email : ''}</span>
      </div>
      <hr className="user-dropdown-divider" />
      <Link to="/profile/me" className="user-dropdown-item" onClick={onClose} role="menuitem">
        <span className="dropdown-icon"><User size={16} strokeWidth={2} /></span> Profile
      </Link>
      <Link to="/messages" className="user-dropdown-item" onClick={onClose} role="menuitem">
        <span className="dropdown-icon"><MessageCircle size={16} strokeWidth={2} /></span> Messages
      </Link>
      <Link to="/listings/new" className="user-dropdown-item" onClick={onClose} role="menuitem">
        <span className="dropdown-icon"><PlusCircle size={16} strokeWidth={2} /></span> List a room
      </Link>
      <hr className="user-dropdown-divider" />
      <button className="user-dropdown-item user-dropdown-logout" onClick={handleLogout} role="menuitem">
        <span className="dropdown-icon"><LogOut size={16} strokeWidth={2} /></span> Log out
      </button>
    </div>
  )
}

function Navbar() {
  const [isMenuOpen, setIsMenuOpen]       = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isScrolled, setIsScrolled]       = useState(false)
  const dropdownRef = useRef(null)
  const { user, isAuthenticated } = useAuth()

  const closeMenu     = () => setIsMenuOpen(false)
  const toggleMenu    = () => setIsMenuOpen((prev) => !prev)
  const toggleDropdown = () => setIsDropdownOpen((prev) => !prev)
  const closeDropdown  = () => setIsDropdownOpen(false)

  // Sticky shadow on scroll
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isDropdownOpen) return
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) closeDropdown()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [isDropdownOpen])

  // Close dropdown on Escape
  useEffect(() => {
    if (!isDropdownOpen) return
    const handler = (e) => { if (e.key === 'Escape') closeDropdown() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isDropdownOpen])

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? '?'

  return (
    <nav className={`navbar${isScrolled ? ' navbar--scrolled' : ''}`}>

      {/* Logo */}
      <div className="navbar-logo">
        <Link to="/" onClick={closeMenu} aria-label="CoLiving home">
          <span className="navbar-logo-icon" aria-hidden="true">
            <Home size={18} strokeWidth={2.2} />
          </span>
          CoLiving
        </Link>
      </div>

      {/* Mobile hamburger */}
      <button
        type="button"
        className={`menu-button${isMenuOpen ? ' menu-button--open' : ''}`}
        onClick={toggleMenu}
        aria-label="Toggle navigation menu"
        aria-expanded={isMenuOpen}
      >
        <span />
        <span />
        <span />
      </button>

      {/* Navigation menu */}
      <div className={`navbar-menu${isMenuOpen ? ' open' : ''}`}>

        {/* Nav links */}
        <div className="navbar-links">
          <Link className="nav-link" to="/"      onClick={closeMenu}>Home</Link>
          <Link className="nav-link" to="/rooms" onClick={closeMenu}>Find a Room</Link>
          <Link className="nav-link" to="/about" onClick={closeMenu}>About</Link>

          {isAuthenticated && (
            <>
              <Link className="nav-link mobile-only-link" to="/messages"     onClick={closeMenu}>Messages</Link>
              <Link className="nav-link mobile-only-link" to="/profile/me"   onClick={closeMenu}>Profile</Link>
              <Link className="nav-link mobile-only-link" to="/listings/new" onClick={closeMenu}>List a room</Link>
            </>
          )}
        </div>

        {/* Auth / user area */}
        <div className="navbar-actions">
          {isAuthenticated ? (
            <div className="user-menu" ref={dropdownRef}>
              <button
                type="button"
                className="user-avatar-btn"
                onClick={toggleDropdown}
                aria-haspopup="true"
                aria-expanded={isDropdownOpen}
                aria-label="Open user menu"
              >
                {user?.avatar_url ? (
                  <img src={user.avatar_url} alt={user.name || 'User avatar'} className="user-avatar-img" />
                ) : (
                  <span className="user-avatar-initials">{initials}</span>
                )}
                <span className="user-display-name">{user?.name?.split(' ')[0] || user?.email}</span>
                <span className={`user-chevron${isDropdownOpen ? ' open' : ''}`}>
                  <ChevronDown size={16} />
                </span>
              </button>

              {isDropdownOpen && <UserDropdown user={user} onClose={closeDropdown} />}
            </div>
          ) : (
            <>
              <Link to="/login"  className="login-button"  onClick={closeMenu}>Log In</Link>
              <Link to="/signup" className="signup-button" onClick={closeMenu}>Sign Up</Link>
            </>
          )}
        </div>

      </div>
    </nav>
  )
}

export default Navbar
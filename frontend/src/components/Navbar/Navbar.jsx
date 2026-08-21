import { Link } from 'react-router-dom'
import './Navbar.css'

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/">CoLiving</Link>
      </div>

      <div className="navbar-links">
        <Link to="/">Home</Link>
        <Link to="/rooms">Find a Room</Link>
        <Link to="/about">About</Link>
      </div>

      <div className="navbar-actions">
        <button className="login-button">
          Log In
        </button>

        <button className="signup-button">
          Sign Up
        </button>
      </div>
    </nav>
  )
}

export default Navbar
import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom'
import { AlertCircle } from 'lucide-react'

import AuthLayout from '../components/AuthLayout/AuthLayout'
import Input from '../components/Input/Input'
import PasswordInput from '../components/PasswordInput/PasswordInput'
import Button from '../components/Button/Button'
import Modal from '../components/Modal/Modal'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

import './Login.css'

function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isAuthenticated } = useAuth()
  const { showToast } = useToast()

  // ── State (all hooks before any conditional return) ──────────────
  const [email, setEmail] = useState(() => {
    try { return localStorage.getItem('remembered_email') || '' } catch { return '' }
  })
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(() => {
    try { return Boolean(localStorage.getItem('remembered_email')) } catch { return false }
  })
  const [fieldErrors, setFieldErrors] = useState({})
  const [serverError, setServerError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [forgotOpen, setForgotOpen] = useState(false)

  // Document title
  useEffect(() => { document.title = 'Log in – CoLiving' }, [])

  // ── Early redirect ───────────────────────────────────────────────
  if (isAuthenticated) return <Navigate to="/" replace />

  // ── Handlers ─────────────────────────────────────────────────────
  const clearServerError = () => setServerError(null)

  const handleEmailChange = (e) => {
    setEmail(e.target.value)
    clearServerError()
    if (fieldErrors.email) setFieldErrors((p) => ({ ...p, email: null }))
  }

  const handlePasswordChange = (e) => {
    setPassword(e.target.value)
    clearServerError()
    if (fieldErrors.password) setFieldErrors((p) => ({ ...p, password: null }))
  }

  const validate = () => {
    const errs = {}
    if (!email.trim()) {
      errs.email = 'Email is required.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = 'Please enter a valid email address.'
    }
    if (!password) {
      errs.password = 'Password is required.'
    }
    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (submitting) return
    if (!validate()) return

    setSubmitting(true)
    setServerError(null)

    try {
      await login(email.trim(), password)

      try {
        if (rememberMe) {
          localStorage.setItem('remembered_email', email.trim())
        } else {
          localStorage.removeItem('remembered_email')
        }
      } catch { /* ignore storage errors */ }

      showToast('Welcome back!', 'success')

      const from = location.state?.from?.pathname || '/'
      navigate(from, { replace: true })
    } catch (err) {
      if (err.status === 401) {
        setServerError('Incorrect email or password.')
      } else if (!err.status) {
        setServerError('Cannot reach the server. Please try again.')
      } else {
        setServerError(err.message || 'Something went wrong. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to find your perfect room and roommate."
    >
      <div className="login-card">

        {/* Header */}
        <div className="login-header">
          <h1>Welcome back</h1>
          <p>Log in to find your perfect room and roommate.</p>
        </div>

        {/* Server error alert */}
        {serverError && (
          <div className="login-alert" role="alert">
            <AlertCircle size={16} />
            <span>{serverError}</span>
          </div>
        )}

        {/* Login Form – Enter in any field submits via form onSubmit */}
        <form className="login-form" onSubmit={handleSubmit} noValidate>

          <Input
            id="login-email"
            name="email"
            label="Email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={handleEmailChange}
            autoComplete="email"
            required
            error={fieldErrors.email}
            autoFocus
          />

          <PasswordInput
            id="login-password"
            name="password"
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChange={handlePasswordChange}
            autoComplete="current-password"
            required
            error={fieldErrors.password}
          />

          {/* Options row */}
          <div className="login-options">
            <label className="remember-me">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span>Remember me</span>
            </label>

            <button
              type="button"
              className="forgot-password"
              onClick={() => setForgotOpen(true)}
            >
              Forgot password?
            </button>
          </div>

          <Button
            type="submit"
            disabled={submitting}
            aria-busy={submitting}
          >
            {submitting ? 'Logging in…' : 'Log In'}
          </Button>

        </form>

        {/* Divider + secondary action */}
        <div className="login-divider"><span>or</span></div>

        <Button
          variant="secondary"
          onClick={() => navigate('/rooms')}
        >
          Browse rooms without an account
        </Button>

        {/* Sign Up link */}
        <div className="login-signup">
          <p>Don&apos;t have an account?</p>
          <Link to="/signup">Sign Up</Link>
        </div>

      </div>

      {/* Forgot Password Modal */}
      {forgotOpen && (
        <Modal title="Forgot password?" onClose={() => setForgotOpen(false)}>
          <p className="modal-body-text">
            Password reset is coming soon. For now please contact support at{' '}
            <a href="mailto:support@coliving.az">support@coliving.az</a>.
          </p>
          <div className="modal-actions">
            <Button type="button" onClick={() => setForgotOpen(false)}>
              Close
            </Button>
          </div>
        </Modal>
      )}
    </AuthLayout>
  )
}

export default Login
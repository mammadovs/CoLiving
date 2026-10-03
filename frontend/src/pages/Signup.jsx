import { useState, useEffect } from 'react'
import { useNavigate, Link, Navigate } from 'react-router-dom'
import { AlertCircle } from 'lucide-react'

import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import AuthLayout from '../components/AuthLayout/AuthLayout'
import Input from '../components/Input/Input'
import PasswordInput from '../components/PasswordInput/PasswordInput'
import Checkbox from '../components/Checkbox/Checkbox'
import Button from '../components/Button/Button'

import './Signup.css'

import { UNIVERSITIES } from '../constants/options'

/** Returns 0-4 strength score for a password */
function getPasswordStrength(pw) {
  if (!pw) return 0
  let score = 0
  if (pw.length >= 6) score++
  if (pw.length >= 8) score++
  if (/\d/.test(pw)) score++
  if (/[A-Z!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pw)) score++
  return score
}

const STRENGTH_LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong']
const STRENGTH_CLASSES = ['', 'strength-weak', 'strength-fair', 'strength-good', 'strength-strong']

export default function Signup() {
  const navigate = useNavigate()
  const { register, isAuthenticated } = useAuth()
  const { showToast } = useToast()

  // ── State (all hooks before any conditional return) ──────────────
  const [isStudent, setIsStudent] = useState(true)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    university: 'ADA University',
    profession: '',
  })
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [errors, setErrors] = useState({})
  const [serverAlert, setServerAlert] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  // Document title
  useEffect(() => { document.title = 'Sign up – CoLiving' }, [])

  // ── Early redirect ───────────────────────────────────────────────
  if (isAuthenticated) return <Navigate to="/" replace />

  const strength = getPasswordStrength(formData.password)

  // ── Handlers ─────────────────────────────────────────────────────
  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }))
    setServerAlert(null)
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }))
  }

  const validate = () => {
    const next = {}

    if (!formData.full_name.trim()) {
      next.full_name = 'Full name is required.'
    }

    if (!formData.email.trim()) {
      next.email = 'Email is required.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      next.email = 'Please enter a valid email address.'
    } else if (isStudent && !formData.email.trim().toLowerCase().endsWith('edu.az')) {
      next.email = 'Students must register with a university email ending in edu.az.'
    }

    if (!formData.password) {
      next.password = 'Password is required.'
    } else if (formData.password.length < 6) {
      next.password = 'Password must be at least 6 characters.'
    }

    if (!formData.confirmPassword) {
      next.confirmPassword = 'Please confirm your password.'
    } else if (formData.password !== formData.confirmPassword) {
      next.confirmPassword = 'Passwords do not match.'
    }

    if (!agreedToTerms) {
      next.terms = 'You must accept the terms.'
    }

    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setSubmitting(true)
    setServerAlert(null)
    try {
      const payload = {
        email: formData.email.trim(),
        password: formData.password,
        full_name: formData.full_name.trim(),
        is_student: isStudent,
        university: isStudent ? formData.university : 'Other',
        profession: isStudent ? null : (formData.profession.trim() || null),
      }

      await register(payload)
      showToast('Account created! Welcome to CoLiving.', 'success')
      navigate(isStudent ? '/onboarding' : '/rooms')
    } catch (err) {
      if (err.status === 400) {
        setErrors((prev) => ({ ...prev, email: 'An account with this email already exists.' }))
      } else if (!err.status) {
        setServerAlert('Cannot reach the server. Please try again.')
      } else {
        setServerAlert(err.message || 'Something went wrong. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="Join CoLiving"
      subtitle="Find your compatible roommate in Baku."
    >
      <div className="signup-card">

        {/* Header */}
        <h1 className="signup-title">Create your account</h1>
        <p className="signup-subtitle">Find your compatible roommate in Baku</p>

        {/* Student / Host toggle */}
        <div className="signup-toggle">
          <button
            type="button"
            className={`toggle-option ${isStudent ? 'active' : ''}`}
            onClick={() => setIsStudent(true)}
          >
            I&apos;m a student
          </button>
          <button
            type="button"
            className={`toggle-option ${!isStudent ? 'active' : ''}`}
            onClick={() => setIsStudent(false)}
          >
            I&apos;m a host / landlord
          </button>
        </div>

        {/* Toggle helper text */}
        <p className="toggle-helper">
          {isStudent
            ? 'Use your university email (edu.az) to get a verified student badge and roommate matching.'
            : 'List rooms and talk to students looking for a place.'}
        </p>

        {/* Server alert */}
        {serverAlert && (
          <div className="signup-alert" role="alert">
            <AlertCircle size={16} />
            <span>{serverAlert}</span>
          </div>
        )}

        {/* Form – Enter in any field submits via form onSubmit */}
        <form onSubmit={handleSubmit} noValidate className="signup-form">

          <Input
            id="signup-full-name"
            name="full_name"
            label="Full name"
            type="text"
            placeholder="Your full name"
            value={formData.full_name}
            onChange={handleChange('full_name')}
            autoComplete="name"
            required
            error={errors.full_name}
            autoFocus
          />

          <Input
            id="signup-email"
            name="email"
            label="Email"
            type="email"
            placeholder={isStudent ? 'you@university.edu.az' : 'you@example.com'}
            value={formData.email}
            onChange={handleChange('email')}
            autoComplete="email"
            required
            error={errors.email}
            hint={isStudent ? 'Must be a university email ending in edu.az' : undefined}
          />

          {/* Password + strength meter */}
          <div className="signup-password-group">
            <PasswordInput
              id="signup-password"
              name="password"
              label="Password"
              placeholder="At least 6 characters"
              value={formData.password}
              onChange={handleChange('password')}
              autoComplete="new-password"
              required
              error={errors.password}
            />

            {formData.password && (
              <div className="password-strength">
                <div className="strength-bar">
                  {[1, 2, 3, 4].map((seg) => (
                    <div
                      key={seg}
                      className={`strength-segment ${strength >= seg ? STRENGTH_CLASSES[strength] : ''}`}
                    />
                  ))}
                </div>
                <span className={`strength-label ${STRENGTH_CLASSES[strength]}`}>
                  {STRENGTH_LABELS[strength]}
                </span>
              </div>
            )}
          </div>

          <PasswordInput
            id="signup-confirm-password"
            name="confirmPassword"
            label="Confirm password"
            placeholder="Repeat your password"
            value={formData.confirmPassword}
            onChange={handleChange('confirmPassword')}
            autoComplete="new-password"
            required
            error={errors.confirmPassword}
          />

          {/* University / Profession */}
          {isStudent ? (
            <div className="form-group">
              <label htmlFor="signup-university">University</label>
              <select
                id="signup-university"
                value={formData.university}
                onChange={handleChange('university')}
              >
                {UNIVERSITIES.map((uni) => (
                  <option key={uni} value={uni}>{uni}</option>
                ))}
              </select>
            </div>
          ) : (
            <Input
              id="signup-profession"
              name="profession"
              label="Profession (optional)"
              type="text"
              placeholder="e.g. Property manager"
              value={formData.profession}
              onChange={handleChange('profession')}
              autoComplete="organization-title"
            />
          )}

          {/* Terms checkbox */}
          <div className="terms-row">
            <Checkbox
              checked={agreedToTerms}
              onChange={(e) => {
                setAgreedToTerms(e.target.checked)
                if (errors.terms) setErrors((p) => ({ ...p, terms: null }))
              }}
              label={
                <>
                  I agree to the{' '}
                  <Link to="/terms" target="_blank" rel="noopener noreferrer" className="terms-link" onClick={(e) => e.stopPropagation()}>Terms of Use</Link>
                  {' '}and{' '}
                  <Link to="/privacy" target="_blank" rel="noopener noreferrer" className="terms-link" onClick={(e) => e.stopPropagation()}>Privacy Policy</Link>
                </>
              }
            />
            {errors.terms && (
              <span className="field-error">{errors.terms}</span>
            )}
          </div>

          <Button
            type="submit"
            disabled={submitting}
            aria-busy={submitting}
          >
            {submitting ? 'Creating account…' : 'Sign up'}
          </Button>

        </form>

        <p className="signup-footer">
          Already have an account? <Link to="/login">Log in</Link>
        </p>

      </div>
    </AuthLayout>
  )
}
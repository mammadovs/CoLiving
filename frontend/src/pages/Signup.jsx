import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

import Input from '../components/Input/Input'
import Button from '../components/Button/Button'

import './Signup.css'

const UNIVERSITIES = [
  'ADA University',
  'BDU',
  'ADNSU',
  'ATU',
  'Khazar University',
  'Other'
];

function Signup() {
  const navigate = useNavigate()
  const { register } = useAuth()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  
  const [isStudent, setIsStudent] = useState(true)
  const [university, setUniversity] = useState(UNIVERSITIES[0])
  const [profession, setProfession] = useState('')

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (password !== confirmPassword) {
      setError('Şifrələr uyğun gəlmir.')
      return
    }

    const payload = {
      email,
      password,
      full_name: fullName,
      is_student: isStudent,
      ...(isStudent ? { university } : { profession: profession || undefined })
    }

    setIsLoading(true)
    try {
      await register(payload)
      setSuccess('Qeydiyyat uğurla tamamlandı! Giriş səhifəsinə yönləndirilirsiniz...')
      setTimeout(() => {
        navigate('/login')
      }, 2000)
    } catch (err) {
      if (err.status === 400) {
        setError('Bu email artıq qeydiyyatdan keçib')
      } else {
        // Backend validation or 422 message
        setError(err.message || 'Xəta baş verdi. Yenidən cəhd edin.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="signup-page">
      <div className="signup-card">

        <div className="signup-header">
          <div className="signup-logo">
            CoLiving
          </div>

          <h1>Create your account</h1>

          <p>
            Join CoLiving and find your perfect place and roommate.
          </p>
        </div>

        {error && <div className="signup-error" style={{ color: 'red', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
        {success && <div className="signup-success" style={{ color: 'green', marginBottom: '1rem', textAlign: 'center' }}>{success}</div>}

        <form
          className="signup-form"
          onSubmit={handleSubmit}
        >

          <Input
            label="Full Name"
            type="text"
            placeholder="Enter your full name"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            required
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: '500' }}>Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              style={{
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '1rem',
                outline: 'none'
              }}
            />
            {isStudent && <span style={{ fontSize: '0.75rem', color: '#666' }}>Email .edu.az ilə bitməlidir</span>}
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input 
                type="radio" 
                checked={isStudent} 
                onChange={() => setIsStudent(true)} 
              />
              Mən tələbəyəm
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input 
                type="radio" 
                checked={!isStudent} 
                onChange={() => setIsStudent(false)} 
              />
              Mən ev sahibiyəm
            </label>
          </div>

          {isStudent ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: '500' }}>University</label>
              <select 
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                style={{
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  outline: 'none',
                  backgroundColor: '#fff'
                }}
              >
                {UNIVERSITIES.map(uni => (
                  <option key={uni} value={uni}>{uni}</option>
                ))}
              </select>
            </div>
          ) : (
            <Input
              label="Profession (Optional)"
              type="text"
              placeholder="Enter your profession"
              value={profession}
              onChange={(event) => setProfession(event.target.value)}
            />
          )}

          <Input
            label="Password"
            type="password"
            placeholder="Create a password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />

          <Input
            label="Confirm Password"
            type="password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
          />

          <label className="signup-terms">
            <input type="checkbox" required />
            <span>
              I agree to the Terms of Service and Privacy Policy.
            </span>
          </label>

          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Loading...' : 'Create Account'}
          </Button>

        </form>

        <div className="signup-divider">
          <span>or</span>
        </div>

        <div className="signup-login">
          <p>
            Already have an account?
          </p>

          <Link to="/login">
            Log In
          </Link>
        </div>

      </div>
    </div>
  )
}

export default Signup

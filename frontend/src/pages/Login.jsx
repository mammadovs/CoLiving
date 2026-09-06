import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

import Input from '../components/Input/Input'
import Button from '../components/Button/Button'

import './Login.css'

function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const user = await login(email, password)
      
      if (!user) {
         setError('İstifadəçi məlumatları tapılmadı')
         return
      }
      
      // Onboarding yoxlanışı (əgər hələ heç bir lifestyle sahəsi doldurulmayıbsa)
      // Əgər backend has_completed_onboarding kimi bir flag qaytarırsa və ya lifestyle obyekti boşdursa:
      if (user.has_completed_onboarding === false || user.is_onboarding_completed === false) {
        navigate('/onboarding')
        return
      }

      // Rola görə yönləndirmə
      if (user.is_student) {
        navigate('/listings')
      } else {
        navigate('/my-listings')
      }
      
    } catch (err) {
      if (err.status === 403 || err.status === 401) {
        setError('Email və ya şifrə yanlışdır')
      } else {
        setError('Xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="login-page">

      <div className="login-card">

        <div className="login-header">
          <div className="login-logo">
            CoLiving
          </div>
          <h1>Welcome back</h1>
          <p>Log in to find your perfect room and roommate.</p>
        </div>
        
        {error && (
          <div className="login-error" style={{ color: 'red', marginBottom: '1rem', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form
          className="login-form"
          onSubmit={handleSubmit}
        >
          <Input
            label="Email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />

          <div className="login-options">
            <label className="remember-me">
              <input type="checkbox" />
              <span>Remember me</span>
            </label>
            <button type="button" className="forgot-password">
              Forgot password?
            </button>
          </div>

          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Loading...' : 'Log In'}
          </Button>
        </form>

        <div className="login-divider">
          <span>or</span>
        </div>

        <div className="login-signup">
          <p>Don't have an account?</p>
          <Link to="/signup">
            Sign Up
          </Link>
        </div>

      </div>

    </div>
  )
}

export default Login
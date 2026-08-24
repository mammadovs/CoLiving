import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'

import Input from '../components/Input/Input'
import Button from '../components/Button/Button'

import './Login.css'

function Login() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()

    // Backend hazır olanda burada login API-si qoşulacaq
    console.log('Login:', {
      email,
      password,
    })

    navigate('/')
  }

  return (
    <div className="login-page">

      <div className="login-card">

        {/* Header */}
        <div className="login-header">

          <div className="login-logo">
            CoLiving
          </div>

          <h1>
            Welcome back
          </h1>

          <p>
            Log in to find your perfect room and roommate.
          </p>

        </div>

        {/* Login Form */}
        <form
          className="login-form"
          onSubmit={handleSubmit}
        >

          <Input
            label="Email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
          />

          <Input
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
          />

          {/* Login Options */}
          <div className="login-options">

            <label className="remember-me">

              <input
                type="checkbox"
              />

              <span>
                Remember me
              </span>

            </label>

            <button
              type="button"
              className="forgot-password"
            >
              Forgot password?
            </button>

          </div>

          {/* Login Button */}
          <Button type="submit">
            Log In
          </Button>

        </form>

        {/* Divider */}
        <div className="login-divider">
          <span>
            or
          </span>
        </div>

        {/* Sign Up */}
        <div className="login-signup">

          <p>
            Don't have an account?
          </p>

          <Link to="/signup">
            Sign Up
          </Link>

        </div>

      </div>

    </div>
  )
}

export default Login
import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'

import Input from '../components/Input/Input'
import Button from '../components/Button/Button'

import './Signup.css'

function Signup() {
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()

    if (password !== confirmPassword) {
      alert('Passwords do not match.')
      return
    }

    // Backend hazır olanda burada registration API-si qoşulacaq
    console.log('Sign Up:', {
      name,
      email,
      password,
    })

    navigate('/')
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

        <form
          className="signup-form"
          onSubmit={handleSubmit}
        >

          <Input
            label="Full Name"
            type="text"
            placeholder="Enter your full name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />

          <Input
            label="Email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />

          <Input
            label="Password"
            type="password"
            placeholder="Create a password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />

          <Input
            label="Confirm Password"
            type="password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
          />

          <label className="signup-terms">
            <input type="checkbox" required />

            <span>
              I agree to the Terms of Service and Privacy Policy.
            </span>
          </label>

          <Button type="submit">
            Create Account
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
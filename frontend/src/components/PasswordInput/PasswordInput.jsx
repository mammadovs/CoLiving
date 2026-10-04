import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import '../Input/Input.css'
import './PasswordInput.css'

function PasswordInput({
  label,
  placeholder,
  value,
  onChange,
  id,
  name,
  autoComplete,
  error,
  hint,
  required,
}) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="input-container">
      {label && (
        <label htmlFor={id}>
          {label}
          {required && <span aria-hidden="true"> *</span>}
        </label>
      )}

      <div className="password-input-wrapper">
        <input
          id={id}
          name={name}
          type={showPassword ? 'text' : 'password'}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          required={required}
          className={error ? 'input--error' : ''}
          aria-invalid={!!error}
          aria-describedby={
            error ? `${id}-error` : hint ? `${id}-hint` : undefined
          }
        />

        <button
          type="button"
          className="password-toggle-btn"
          onClick={() => setShowPassword((prev) => !prev)}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          aria-pressed={showPassword}
          tabIndex={0}
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      {error && (
        <span id={`${id}-error`} className="input-error-text" role="alert">
          {error}
        </span>
      )}
      {!error && hint && (
        <span id={`${id}-hint`} className="input-hint-text">
          {hint}
        </span>
      )}
    </div>
  )
}

export default PasswordInput

import { useId } from 'react'
import './Input.css'

function Input({
  label,
  placeholder,
  type = 'text',
  value,
  onChange,
  id: propId,
  name,
  autoComplete,
  required,
  error,
  hint,
  disabled,
  autoFocus,
}) {
  const generatedId = useId()
  const id = propId || generatedId

  return (
    <div className="input-container">
      {label && (
        <label htmlFor={id}>
          {label}
          {required && <span aria-hidden="true"> *</span>}
        </label>
      )}

      <input
        id={id}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        required={required}
        disabled={disabled}
        autoFocus={autoFocus}
        className={error ? 'input--error' : ''}
        aria-invalid={!!error}
        aria-describedby={
          error ? `${id}-error` : hint ? `${id}-hint` : undefined
        }
      />

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

export default Input
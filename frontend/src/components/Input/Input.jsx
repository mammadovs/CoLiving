import './Input.css'

function Input({
  label,
  placeholder,
  type = 'text',
  value,
  onChange,
  name,
  id,
  required,
  min,
  max,
  rows = 4,
  error,
  className = '',
  ...rest
}) {
  const inputId = id || name

  return (
    <div className={`input-container ${className}`}>
      {label && (
        <label htmlFor={inputId} className="input-label">
          {label}
          {required && <span className="input-required-star"> *</span>}
        </label>
      )}

      {type === 'textarea' ? (
        <textarea
          id={inputId}
          name={name}
          placeholder={placeholder}
          value={value ?? ''}
          onChange={onChange}
          rows={rows}
          required={required}
          className="custom-input custom-textarea"
          {...rest}
        />
      ) : (
        <input
          id={inputId}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value ?? ''}
          onChange={onChange}
          required={required}
          min={min}
          max={max}
          className="custom-input"
          {...rest}
        />
      )}

      {error && <span className="input-error-msg">{error}</span>}
    </div>
  )
}

export default Input
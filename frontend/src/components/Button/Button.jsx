import './Button.css'

function Button({
  children,
  variant = 'primary',
  type = 'button',
  onClick,
  disabled,
  loading,
  className,
  'aria-label': ariaLabel,
  'aria-busy': ariaBusy,
  ...rest
}) {
  const isDisabled = disabled || loading

  return (
    <button
      className={['button', `button-${variant}`, className].filter(Boolean).join(' ')}
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      aria-busy={loading ? true : ariaBusy}
      aria-label={ariaLabel}
      {...rest}
    >
      {loading && <span className="button-spinner" aria-hidden="true" />}
      {children}
    </button>
  )
}

export default Button
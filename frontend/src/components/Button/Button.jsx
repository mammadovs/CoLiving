import './Button.css'

function Button({
  children,
  variant = 'primary',
  type = 'button',
  onClick,
  disabled = false,
  className = '',
  ...rest
}) {
  return (
    <button
      className={`button button-${variant}${className ? ' ' + className : ''}`}
      type={type}
      onClick={onClick}
      disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  )
}

export default Button
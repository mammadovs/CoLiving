import { forwardRef, useId } from 'react'
import './Input.css'

const Input = forwardRef(function Input({
    label,
    placeholder,
    type = 'text',
    value,
    onChange,
    name,
    required = false,
    error,
    min,
    max,
    step,
    ...rest
}, ref) {
    const uid = useId()
    return (
        <div className={`input-container${error ? ' has-error' : ''}`}>
            {label && (
                <label htmlFor={uid}>
                    {label}
                    {required && <span className="field-required" aria-hidden="true"> *</span>}
                </label>
            )}
            <input
                ref={ref}
                id={uid}
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                name={name}
                required={required}
                min={min}
                max={max}
                step={step}
                {...rest}
            />
            {error && <span className="field-error">{error}</span>}
        </div>
    )
})

export default Input
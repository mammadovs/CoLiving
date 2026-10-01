import { forwardRef, useId } from 'react'
import './Select.css'

const Select = forwardRef(function Select({
    label,
    value,
    onChange,
    options = [],
    placeholder = 'Select an option',
    name,
    required = false,
    error,
    ...rest
}, ref) {
    const uid = useId()
    return (
        <div className={`select-container${error ? ' has-error' : ''}`}>
            {label && (
                <label htmlFor={uid}>
                    {label}
                    {required && <span className="field-required" aria-hidden="true"> *</span>}
                </label>
            )}
            <select
                ref={ref}
                id={uid}
                value={value}
                onChange={onChange}
                name={name}
                required={required}
                {...rest}
            >
                <option value="">{placeholder}</option>
                {options.map((option) => (
                    <option key={option} value={option}>{option}</option>
                ))}
            </select>
            {error && <span className="field-error">{error}</span>}
        </div>
    )
})

export default Select

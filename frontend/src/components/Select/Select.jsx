import { useId } from 'react'
import './Select.css'
function Select({ label, value, onChange, options = [], placeholder = 'Select an option', required, error, hint, id: propId, name }) {
    const generatedId = useId()
    const id = propId || generatedId
    return (
        <div className="select-container">
            {label && <label htmlFor={id}>{label}{required && <span aria-hidden="true"> *</span>}</label>}
            <select id={id} name={name} value={value} onChange={onChange} required={required} className={error ? 'input--error' : ''} aria-invalid={!!error} aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}>
                <option value="">{placeholder}</option>
                {options.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
            {error && <span id={`${id}-error`} className="input-error-text" role="alert">{error}</span>}
            {!error && hint && <span id={`${id}-hint`} className="input-hint-text">{hint}</span>}
        </div>
    )
}
export default Select

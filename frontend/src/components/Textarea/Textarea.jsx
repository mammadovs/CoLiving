import { useId } from 'react'
import './Textarea.css'
function Textarea({ label, value, onChange, placeholder, rows = 4, required, error, hint, id: propId, name }) {
    const generatedId = useId()
    const id = propId || generatedId
    return (
        <div className="textarea-container">
            {label && <label htmlFor={id}>{label}{required && <span aria-hidden="true"> *</span>}</label>}
            <textarea id={id} name={name} value={value} onChange={onChange} placeholder={placeholder} rows={rows} required={required} className={error ? 'input--error' : ''} aria-invalid={!!error} aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined} />
            {error && <span id={`${id}-error`} className="input-error-text" role="alert">{error}</span>}
            {!error && hint && <span id={`${id}-hint`} className="input-hint-text">{hint}</span>}
        </div>
    )
}
export default Textarea

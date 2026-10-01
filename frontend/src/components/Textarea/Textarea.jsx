import { useId } from 'react'
import './Textarea.css'

function Textarea({
    label,
    value,
    onChange,
    placeholder,
    rows = 4,
    name,
    required = false,
    error,
    ...rest
}) {
    const uid = useId()
    return (
        <div className={`textarea-container${error ? ' has-error' : ''}`}>
            {label && (
                <label htmlFor={uid}>
                    {label}
                    {required && <span className="field-required" aria-hidden="true"> *</span>}
                </label>
            )}
            <textarea
                id={uid}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                rows={rows}
                name={name}
                required={required}
                {...rest}
            />
            {error && <span className="field-error">{error}</span>}
        </div>
    )
}

export default Textarea

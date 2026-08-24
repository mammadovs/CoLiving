import './Input.css'

function Input({ label, placeholder, type = 'text', value, onChange }) {
  return (
    <div className="input-container">
      {label && <label>{label}</label>}

      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    </div>
  )
}

export default Input
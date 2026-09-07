import './Select.css'
function Select({ label, value, onChange, options = [], placeholder = 'Select an option' }) { return <div className="select-container"><label>{label}</label><select value={value} onChange={onChange}><option value="">{placeholder}</option>{options.map((option) => <option key={option} value={option}>{option}</option>)}</select></div> }
export default Select

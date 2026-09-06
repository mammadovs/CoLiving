import './Checkbox.css'
function Checkbox({ label, checked, onChange, toggle = false }) { return <label className={`checkbox-label${toggle ? ' checkbox-toggle' : ''}`}><input type="checkbox" checked={checked} onChange={onChange} /><span>{label}</span></label> }
export default Checkbox

import './Textarea.css'
function Textarea({ label, value, onChange, placeholder, rows = 4 }) { return <div className="textarea-container"><label>{label}</label><textarea value={value} onChange={onChange} placeholder={placeholder} rows={rows} /></div> }
export default Textarea

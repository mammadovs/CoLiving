import './Avatar.css'
function Avatar({ name = '', size = 'md' }) { const initials = name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0].toUpperCase()).join('') || '?'; return <div className={`avatar avatar-${size}`} aria-label={name}>{initials}</div> }
export default Avatar

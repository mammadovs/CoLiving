import { SearchX } from 'lucide-react'
import './EmptyState.css'

function EmptyState({ title, message, icon: Icon = SearchX, action }) {
    return <div className="empty-state"><Icon size={42} aria-hidden="true" /><h2>{title}</h2>{message && <p>{message}</p>}{action}</div>
}

export default EmptyState

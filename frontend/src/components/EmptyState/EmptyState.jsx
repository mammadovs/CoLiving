import { SearchX } from 'lucide-react'
import './EmptyState.css'

function EmptyState({ title = "No data found", message = "There is nothing here yet.", icon: Icon = SearchX, action }) {
    return <div className="empty-state"><Icon size={42} aria-hidden="true" /><h2>{title}</h2>{message && <p>{message}</p>}{action}</div>
}

export default EmptyState

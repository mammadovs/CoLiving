import './DemoBadge.css'

const IS_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

function DemoBadge() {
    if (!IS_MOCK) return null
    return (
        <div className="demo-badge" role="status" aria-label="Running in demo mode — no backend required">
            <span className="demo-badge-dot" aria-hidden="true" />
            Demo mode
        </div>
    )
}

export default DemoBadge

import { CheckCircle2 } from 'lucide-react'
import './Compatibility.css'

function Compatibility({ score = 86, breakdown = [] }) {
    return (
        <section className="compatibility">
            <div className="compatibility-score"><strong>{score}%</strong><span>Compatibility</span></div>
            <div className="compatibility-breakdown">
                {breakdown.map((item) => (
                    <div className="compatibility-row" key={item.label}>
                        <span><CheckCircle2 size={16} />{item.label}</span><strong>{item.score}%</strong>
                    </div>
                ))}
            </div>
        </section>
    )
}

export default Compatibility

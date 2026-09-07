import Button from '../Button/Button';
import './EmptyState.css';

/**
 * EmptyState
 * Props:
 *   icon: ReactNode (emoji string or JSX icon)
 *   title: string
 *   description: string (optional)
 *   ctaLabel: string (optional — shows a button if provided)
 *   onCta: fn (required if ctaLabel is provided)
 */
function EmptyState({ icon = '📭', title, description, ctaLabel, onCta }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon}</div>
      {title       && <h3 className="empty-state-title">{title}</h3>}
      {description && <p  className="empty-state-desc">{description}</p>}
      {ctaLabel && onCta && (
        <Button onClick={onCta} style={{ marginTop: '1.5rem' }}>
          {ctaLabel}
        </Button>
      )}
    </div>
  );
}

export default EmptyState;

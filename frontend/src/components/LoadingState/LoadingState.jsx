import './LoadingState.css';

/**
 * LoadingState
 * Props:
 *   variant: 'spinner' (default) | 'skeleton'
 *   count: number of skeleton cards (only for skeleton variant, default 6)
 *   skeletonHeight: px height for each skeleton (default 220)
 *   text: optional label below spinner
 */
function LoadingState({ variant = 'spinner', count = 6, skeletonHeight = 220, text }) {
  if (variant === 'skeleton') {
    return (
      <div
        className="ls-skeleton-grid"
        style={{ '--skeleton-h': `${skeletonHeight}px` }}
      >
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="ls-skeleton-card" />
        ))}
      </div>
    );
  }

  return (
    <div className="ls-spinner-wrap">
      <div className="ls-spinner" />
      {text && <p className="ls-spinner-text">{text}</p>}
    </div>
  );
}

export default LoadingState;

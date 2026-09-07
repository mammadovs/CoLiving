import Button from '../Button/Button';
import './ErrorState.css';

/**
 * ErrorState
 * Props:
 *   message: string (optional, default generic message)
 *   onRetry: fn (optional — shows retry button if provided)
 */
function ErrorState({
  message = 'Məlumatlar yüklənərkən xəta baş verdi.',
  onRetry,
}) {
  return (
    <div className="error-state">
      <div className="error-state-icon">⚠️</div>
      <h3 className="error-state-title">Xəta baş verdi</h3>
      <p className="error-state-message">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} style={{ marginTop: '1.5rem' }}>
          Yenidən cəhd et
        </Button>
      )}
    </div>
  );
}

export default ErrorState;

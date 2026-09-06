import { useState } from 'react';
import { apiClient } from '../../api/client';
import './CompatibilityView.css';

const BREAKDOWN_LABELS = {
  sleep_schedule:          'Yuxu Rejimi',
  cleanliness_level:       'Təmizlik',
  noise_tolerance:         'Səs-küy',
  guest_frequency:         'Qonaq',
  work_or_study_schedule:  'Qrafik',
  personality_type:        'Şəxsiyyət',
  religion:                'Din',
  smoking_habit:           'Siqaret',
  drinks_alcohol:          'Spirtli içki',
  pet_friendly:            'Ev heyvanı',
  budget:                  'Büdcə',
};

function ScoreColor(score) {
  if (score === 100) return '#10b981'; // green
  if (score === 50)  return '#f59e0b'; // yellow — no data
  return '#ef4444';                    // red — mismatch
}

function ScoreLabel(score) {
  if (score === 100) return 'Uyğun';
  if (score === 50)  return 'Məlumat yoxdur';
  return 'Uyğun deyil';
}

// SVG ring for overall score
function ScoreRing({ score }) {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const color =
    score >= 75 ? '#10b981' :
    score >= 50 ? '#f59e0b' :
                  '#ef4444';

  return (
    <div className="score-ring-container">
      <svg width="180" height="180" viewBox="0 0 180 180">
        {/* track */}
        <circle
          cx="90" cy="90" r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="14"
        />
        {/* progress */}
        <circle
          cx="90" cy="90" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 90 90)"
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
      </svg>
      <div className="score-ring-text">
        <span className="score-value" style={{ color }}>{score}%</span>
        <span className="score-label">Uyğunluq</span>
      </div>
    </div>
  );
}

function BreakdownBar({ label, score }) {
  const color = ScoreColor(score);
  const text  = ScoreLabel(score);
  return (
    <div className="breakdown-row">
      <span className="breakdown-label">{label}</span>
      <div className="breakdown-bar-wrap">
        <div
          className="breakdown-bar-fill"
          style={{ width: `${score}%`, background: color }}
        />
      </div>
      <span className="breakdown-tag" style={{ color, background: `${color}18` }}>
        {text}
      </span>
    </div>
  );
}

/**
 * CompatibilityView
 * Props:
 *   otherUserId (required) — whose compatibility to check against current user
 *   inline (bool) — if true renders inline, if false renders as modal
 *   onClose (fn) — only used when !inline
 */
function CompatibilityView({ otherUserId, inline = false, onClose }) {
  const [result, setResult]     = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);
  const [checked, setChecked]   = useState(false);

  const checkCompatibility = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient(`/users/${otherUserId}/compatibility`);
      setResult(data);
      setChecked(true);
    } catch (err) {
      setError(err.message || 'Uyğunluq yoxlanarkən xəta baş verdi.');
    } finally {
      setLoading(false);
    }
  };

  const content = (
    <div className={`compat-content ${inline ? 'compat-inline' : ''}`}>
      {!checked && !loading && (
        <div className="compat-cta">
          <p>Bu istifadəçi ilə yaşam tərzinizin nə dərəcədə uyğun olduğunu öyrənin.</p>
          <button className="compat-check-btn" onClick={checkCompatibility}>
            Uyğunluğu Yoxla
          </button>
        </div>
      )}

      {loading && (
        <div className="compat-loading">
          <div className="compat-spinner" />
          Hesablanır...
        </div>
      )}

      {error && (
        <div className="compat-error">
          <p>{error}</p>
          <button className="compat-retry-btn" onClick={checkCompatibility}>Yenidən cəhd et</button>
        </div>
      )}

      {result && !loading && (
        <div className="compat-result">
          <ScoreRing score={result.compatibility_score ?? 0} />

          {result.breakdown && Object.keys(result.breakdown).length > 0 && (
            <div className="breakdown-list">
              <h4 className="breakdown-title">Ətraflı Nəticə</h4>
              {Object.entries(result.breakdown).map(([key, score]) =>
                BREAKDOWN_LABELS[key] ? (
                  <BreakdownBar
                    key={key}
                    label={BREAKDOWN_LABELS[key]}
                    score={score}
                  />
                ) : null
              )}
            </div>
          )}

          {!inline && (
            <button className="compat-recheck-btn" onClick={checkCompatibility}>
              Yenidən Hesabla
            </button>
          )}
        </div>
      )}
    </div>
  );

  if (inline) return <section className="compat-section">{content}</section>;

  // Modal mode
  return (
    <div className="compat-modal-overlay" onClick={onClose}>
      <div className="compat-modal" onClick={e => e.stopPropagation()}>
        <div className="compat-modal-header">
          <h3>Uyğunluq Nəticəsi</h3>
          <button className="compat-close-btn" onClick={onClose}>✕</button>
        </div>
        {content}
      </div>
    </div>
  );
}

export default CompatibilityView;

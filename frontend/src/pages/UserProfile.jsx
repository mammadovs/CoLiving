import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';
import CompatibilityView from '../components/CompatibilityView/CompatibilityView';
import LoadingState from '../components/LoadingState/LoadingState';
import EmptyState from '../components/EmptyState/EmptyState';
import ErrorState from '../components/ErrorState/ErrorState';
import { User, GraduationCap, Briefcase, Activity, ArrowLeft } from 'lucide-react';
import Button from '../components/Button/Button';
import './UserProfile.css';

const LABELS = {
  sleep_schedule:          { early_bird: '🌅 Erkən qalxan', night_owl: '🦉 Gecə quşu', flexible: '🔄 Sərbəst' },
  cleanliness_level:       { very_tidy: '✨ Çox səliqəli', average: '🙂 Normal', relaxed: '😌 Rahat' },
  noise_tolerance:         { quiet: '🤫 Sakit', moderate: '🎵 Orta', loud_ok: '🎉 Fərq etmir' },
  guest_frequency:         { rarely: '🚪 Nadir', sometimes: '🙋 Hərdən', often: '🎊 Tez-tez' },
  work_or_study_schedule:  { mostly_home: '🏠 Çox evdə', mostly_out: '🚶 Çox çöldə', mixed: '⚖️ Qarışıq' },
  personality_type:        { introvert: '🧘 İntrovert', extrovert: '🗣️ Ekstrovert', ambivert: '⚡ Ambivert' },
  religion:                { muslim: '☪️ Müsəlman', christian: '✝️ Xristian', secular: '🌐 Sekulyar', other: '🔮 Digər' },
};

function Field({ label, value }) {
  if (value === null || value === undefined || value === '') return null;
  return (
    <div className="up-field">
      <span className="up-field-label">{label}</span>
      <span className="up-field-value">{value}</span>
    </div>
  );
}

function UserProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [profile, setProfile]     = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [showCompat, setShowCompat] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiClient(`/users/${id}`);
        setProfile(data);
      } catch (err) {
        setError(err.status === 404 ? '404' : 'ERROR');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  // ---- Loading ----
  if (loading) {
    return (
      <div className="user-profile-page">
        <LoadingState variant="spinner" text="Profil yüklənir..." />
      </div>
    );
  }

  // ---- 404 ----
  if (error === '404' || !profile) {
    return (
      <div className="user-profile-page">
        <EmptyState
          icon="👤"
          title="İstifadəçi tapılmadı"
          description="Bu profil artıq mövcud deyil və ya silinib."
          ctaLabel="Geri Qayıt"
          onCta={() => navigate(-1)}
        />
      </div>
    );
  }

  if (error === 'ERROR') {
    return (
      <div className="user-profile-page">
        <ErrorState
          message="Profil yüklənərkən xəta baş verdi."
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  // Can current user check compatibility?
  const canCheckCompat =
    currentUser &&
    currentUser.is_student &&
    currentUser.id !== profile.id;

  const hasLifestyle =
    profile.sleep_schedule || profile.cleanliness_level || profile.noise_tolerance ||
    profile.guest_frequency || profile.work_or_study_schedule || profile.personality_type ||
    profile.religion || profile.budget;

  return (
    <div className="user-profile-page">

      {/* Back button */}
      <button className="up-back-btn" onClick={() => navigate(-1)}>
        <ArrowLeft size={18} /> Geri
      </button>

      <div className="up-card">

        {/* Header */}
        <div className="up-header">
          <div className="up-avatar"><User size={48} /></div>
          <div className="up-identity">
            <h1>{profile.full_name || 'İstifadəçi'}</h1>
            <span className={`up-role-badge ${profile.is_student ? 'student' : 'host'}`}>
              {profile.is_student ? '🎓 Tələbə' : '🏠 Ev Sahibi'}
            </span>
          </div>

          {/* Compatibility button — only for logged-in students looking at someone else */}
          {canCheckCompat && (
            <button className="up-compat-btn" onClick={() => setShowCompat(true)}>
              Uyğunluğu Yoxla
            </button>
          )}
        </div>

        {/* Basic info */}
        <section className="up-section">
          <h2>
            {profile.is_student
              ? <><GraduationCap size={18} /> Akademik Məlumatlar</>
              : <><Briefcase size={18} /> İş Məlumatları</>
            }
          </h2>
          <div className="up-fields">
            {profile.is_student
              ? <Field label="Universitet" value={profile.university} />
              : <Field label="Peşə" value={profile.profession} />
            }
            {profile.budget && (
              <Field label="Büdcə" value={`${profile.budget} AZN / ay`} />
            )}
          </div>
        </section>

        {/* Lifestyle — only show if something is filled */}
        {hasLifestyle && (
          <section className="up-section">
            <h2><Activity size={18} /> Həyat Tərzi</h2>
            <div className="up-fields">
              {profile.sleep_schedule && (
                <Field label="Yuxu Rejimi"  value={LABELS.sleep_schedule[profile.sleep_schedule]} />
              )}
              {profile.personality_type && (
                <Field label="Şəxsiyyət"    value={LABELS.personality_type[profile.personality_type]} />
              )}
              {profile.work_or_study_schedule && (
                <Field label="Qrafik"        value={LABELS.work_or_study_schedule[profile.work_or_study_schedule]} />
              )}
              {profile.cleanliness_level && (
                <Field label="Təmizlik"      value={LABELS.cleanliness_level[profile.cleanliness_level]} />
              )}
              {profile.noise_tolerance && (
                <Field label="Səs-küy"       value={LABELS.noise_tolerance[profile.noise_tolerance]} />
              )}
              {profile.guest_frequency && (
                <Field label="Qonaq"         value={LABELS.guest_frequency[profile.guest_frequency]} />
              )}
              {profile.religion && (
                <Field label="Din"           value={LABELS.religion[profile.religion]} />
              )}
              {profile.smoking_habit !== undefined && profile.smoking_habit !== null && (
                <Field label="Siqaret"       value={profile.smoking_habit ? '✅ Bəli' : '❌ Xeyr'} />
              )}
              {profile.drinks_alcohol !== undefined && profile.drinks_alcohol !== null && (
                <Field label="Spirtli içki"  value={profile.drinks_alcohol ? '✅ Bəli' : '❌ Xeyr'} />
              )}
              {profile.pet_friendly !== undefined && profile.pet_friendly !== null && (
                <Field label="Ev heyvanı"    value={profile.pet_friendly ? '✅ Bəli' : '❌ Xeyr'} />
              )}
            </div>
          </section>
        )}

      </div>

      {/* Compatibility modal */}
      {showCompat && (
        <CompatibilityView
          otherUserId={profile.id}
          inline={false}
          onClose={() => setShowCompat(false)}
        />
      )}

    </div>
  );
}

export default UserProfile;

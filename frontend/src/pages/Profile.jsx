import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button/Button';
import LoadingState from '../components/LoadingState/LoadingState';
import { Edit, Trash2, User, GraduationCap, Briefcase, Activity } from 'lucide-react';
import './Profile.css';

// Enum label maps
const LABELS = {
  sleep_schedule:          { early_bird: '🌅 Erkən qalxan', night_owl: '🦉 Gecə quşu', flexible: '🔄 Sərbəst' },
  cleanliness_level:       { very_tidy: '✨ Çox səliqəli', average: '🙂 Normal', relaxed: '😌 Rahat' },
  noise_tolerance:         { quiet: '🤫 Sakit mühit', moderate: '🎵 Orta', loud_ok: '🎉 Fərq etmir' },
  guest_frequency:         { rarely: '🚪 Nadir', sometimes: '🙋 Hərdən', often: '🎊 Tez-tez' },
  work_or_study_schedule:  { mostly_home: '🏠 Çox evdə', mostly_out: '🚶 Çox çöldə', mixed: '⚖️ Qarışıq' },
  personality_type:        { introvert: '🧘 İntrovert', extrovert: '🗣️ Ekstrovert', ambivert: '⚡ Ambivert' },
  religion:                { muslim: '☪️ Müsəlman', christian: '✝️ Xristian', secular: '🌐 Sekulyar', other: '🔮 Digər' },
};

function boolLabel(val) {
  return val ? '✅ Bəli' : '❌ Xeyr';
}

function ProfileField({ label, value }) {
  if (value === null || value === undefined || value === '') return null;
  return (
    <div className="profile-field">
      <span className="field-label">{label}</span>
      <span className="field-value">{value}</span>
    </div>
  );
}

function Profile() {
  const navigate = useNavigate();
  const { user, deleteAccount } = useAuth();

  if (!user) {
    return (
      <div className="profile-page">
        <LoadingState variant="spinner" text="Profil yüklənir..." />
      </div>
    );
  }

  const handleDelete = async () => {
    const confirmed = window.confirm(
      'Bu əməliyyat bütün elanlarınızı və mesajlarınızı da siləcək, geri qaytarıla bilməz.\n\nHesabınızı silmək istədiyinizə əminsiniz?'
    );
    if (!confirmed) return;
    try {
      await deleteAccount();
      navigate('/');
    } catch (err) {
      alert('Hesab silinərkən xəta baş verdi.');
    }
  };

  const hasLifestyle =
    user.sleep_schedule || user.cleanliness_level || user.noise_tolerance ||
    user.guest_frequency || user.work_or_study_schedule || user.personality_type ||
    user.religion || user.budget ||
    user.smoking_habit !== undefined || user.drinks_alcohol !== undefined || user.pet_friendly !== undefined;

  return (
    <div className="profile-page">
      <div className="profile-card">

        {/* Header */}
        <div className="profile-header">
          <div className="profile-avatar">
            <User size={48} />
          </div>
          <div className="profile-identity">
            <h1>{user.full_name || 'İstifadəçi'}</h1>
            <span className={`role-badge ${user.is_student ? 'student' : 'host'}`}>
              {user.is_student ? '🎓 Tələbə' : '🏠 Ev Sahibi'}
            </span>
            <p className="profile-email">{user.email}</p>
          </div>
          <div className="profile-actions">
            <Button onClick={() => navigate('/profile/edit')} className="edit-btn">
              <Edit size={16} style={{ marginRight: 6 }} /> Redaktə et
            </Button>
            <button className="delete-account-btn" onClick={handleDelete}>
              <Trash2 size={16} style={{ marginRight: 6 }} /> Hesabı sil
            </button>
          </div>
        </div>

        {/* Basic Info */}
        <section className="profile-section">
          <h2>
            {user.is_student
              ? <><GraduationCap size={20} /> Akademik Məlumatlar</>
              : <><Briefcase size={20} /> İş Məlumatları</>
            }
          </h2>
          <div className="profile-fields">
            {user.is_student
              ? <ProfileField label="Universitet" value={user.university} />
              : <ProfileField label="Peşə" value={user.profession} />
            }
            {user.budget && (
              <ProfileField label="Büdcə" value={`${user.budget} AZN / ay`} />
            )}
          </div>
        </section>

        {/* Lifestyle */}
        {hasLifestyle ? (
          <section className="profile-section">
            <h2><Activity size={20} /> Həyat Tərzi</h2>
            <div className="profile-fields">
              {user.sleep_schedule && (
                <ProfileField label="Yuxu Rejimi" value={LABELS.sleep_schedule[user.sleep_schedule]} />
              )}
              {user.personality_type && (
                <ProfileField label="Şəxsiyyət" value={LABELS.personality_type[user.personality_type]} />
              )}
              {user.work_or_study_schedule && (
                <ProfileField label="Qrafik" value={LABELS.work_or_study_schedule[user.work_or_study_schedule]} />
              )}
              {user.cleanliness_level && (
                <ProfileField label="Təmizlik" value={LABELS.cleanliness_level[user.cleanliness_level]} />
              )}
              {user.noise_tolerance && (
                <ProfileField label="Səs-küy" value={LABELS.noise_tolerance[user.noise_tolerance]} />
              )}
              {user.guest_frequency && (
                <ProfileField label="Qonaq" value={LABELS.guest_frequency[user.guest_frequency]} />
              )}
              {user.religion && (
                <ProfileField label="Din" value={LABELS.religion[user.religion]} />
              )}
              {user.smoking_habit !== undefined && user.smoking_habit !== null && (
                <ProfileField label="Siqaret" value={boolLabel(user.smoking_habit)} />
              )}
              {user.drinks_alcohol !== undefined && user.drinks_alcohol !== null && (
                <ProfileField label="Spirtli içki" value={boolLabel(user.drinks_alcohol)} />
              )}
              {user.pet_friendly !== undefined && user.pet_friendly !== null && (
                <ProfileField label="Ev heyvanı" value={boolLabel(user.pet_friendly)} />
              )}
            </div>
          </section>
        ) : (
          <section className="profile-section onboarding-prompt">
            <p>Həyat tərzi məlumatlarını dolduraraq daha yaxşı ev yoldaşı tapın.</p>
            <Button onClick={() => navigate('/onboarding')} style={{ marginTop: '1rem' }}>
              Profili Tamamla
            </Button>
          </section>
        )}

      </div>
    </div>
  );
}

export default Profile;

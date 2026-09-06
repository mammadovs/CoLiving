import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';
import Button from '../components/Button/Button';
import Input from '../components/Input/Input';
import './ProfileEdit.css';

const UNIVERSITIES = ['ADA University', 'BDU', 'ADNSU', 'ATU', 'Khazar University', 'Other'];

function ProfileEdit() {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    full_name:              user?.full_name              ?? '',
    university:             user?.university             ?? (UNIVERSITIES[0]),
    profession:             user?.profession             ?? '',
    budget:                 user?.budget                 ?? '',
    sleep_schedule:         user?.sleep_schedule         ?? '',
    cleanliness_level:      user?.cleanliness_level      ?? '',
    religion:               user?.religion               ?? '',
    noise_tolerance:        user?.noise_tolerance        ?? '',
    smoking_habit:          user?.smoking_habit          ?? false,
    drinks_alcohol:         user?.drinks_alcohol         ?? false,
    pet_friendly:           user?.pet_friendly           ?? false,
    guest_frequency:        user?.guest_frequency        ?? '',
    work_or_study_schedule: user?.work_or_study_schedule ?? '',
    personality_type:       user?.personality_type       ?? '',
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      // Build payload — strip empty strings so backend ignores them
      const payload = {};
      for (const [key, val] of Object.entries(formData)) {
        if (typeof val === 'boolean') {
          payload[key] = val;
        } else if (val !== '' && val !== null) {
          payload[key] = key === 'budget' ? Number(val) : val;
        }
      }

      await apiClient('/users/me', { method: 'PATCH', body: payload });
      await refreshUser(); // Global context-i yenilə
      setSuccess(true);
      setTimeout(() => navigate('/profile'), 1200);
    } catch (err) {
      setError(err.message || 'Yadda saxlayarkən xəta baş verdi.');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return <div className="profile-edit-loading">Yüklənir...</div>;

  return (
    <div className="profile-edit-page">
      <div className="profile-edit-card">
        <div className="profile-edit-header">
          <h1>Profili Redaktə Et</h1>
          <button className="back-link" onClick={() => navigate('/profile')}>← Geri qayıt</button>
        </div>

        {error   && <div className="pe-error">{error}</div>}
        {success && <div className="pe-success">✅ Yadda saxlandı! Yönləndirilirsiniz...</div>}

        <form onSubmit={handleSubmit} className="profile-edit-form">

          {/* ---- Əsas məlumatlar ---- */}
          <fieldset className="pe-fieldset">
            <legend>Əsas Məlumatlar</legend>
            <Input
              label="Ad Soyad"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
            />

            {user.is_student ? (
              <div className="pe-field">
                <label className="pe-label">Universitet</label>
                <select name="university" value={formData.university} onChange={handleChange} className="pe-select">
                  {UNIVERSITIES.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
            ) : (
              <Input
                label="Peşə (İstəyə bağlı)"
                name="profession"
                value={formData.profession}
                onChange={handleChange}
              />
            )}

            <Input
              label="Aylıq Büdcə (AZN)"
              name="budget"
              type="number"
              min="0"
              value={formData.budget}
              onChange={handleChange}
            />
          </fieldset>

          {/* ---- Şəxsiyyət & Qrafik ---- */}
          <fieldset className="pe-fieldset">
            <legend>Şəxsiyyət &amp; Qrafik</legend>
            <div className="pe-grid">
              <div className="pe-field">
                <label className="pe-label">Şəxsiyyət Tipi</label>
                <select name="personality_type" value={formData.personality_type} onChange={handleChange} className="pe-select">
                  <option value="">Seçin</option>
                  <option value="introvert">İntrovert</option>
                  <option value="extrovert">Ekstrovert</option>
                  <option value="ambivert">Ambivert</option>
                </select>
              </div>
              <div className="pe-field">
                <label className="pe-label">Yuxu Rejimi</label>
                <select name="sleep_schedule" value={formData.sleep_schedule} onChange={handleChange} className="pe-select">
                  <option value="">Seçin</option>
                  <option value="early_bird">Erkən qalxan</option>
                  <option value="night_owl">Gecə quşu</option>
                  <option value="flexible">Sərbəst</option>
                </select>
              </div>
              <div className="pe-field">
                <label className="pe-label">İş / Təhsil Qrafiki</label>
                <select name="work_or_study_schedule" value={formData.work_or_study_schedule} onChange={handleChange} className="pe-select">
                  <option value="">Seçin</option>
                  <option value="mostly_home">Çox evdə</option>
                  <option value="mostly_out">Çox çöldə</option>
                  <option value="mixed">Qarışıq</option>
                </select>
              </div>
            </div>
          </fieldset>

          {/* ---- Mühit tərcihlər ---- */}
          <fieldset className="pe-fieldset">
            <legend>Mühit Tərcihlər</legend>
            <div className="pe-grid">
              <div className="pe-field">
                <label className="pe-label">Təmizlik Səviyyəsi</label>
                <select name="cleanliness_level" value={formData.cleanliness_level} onChange={handleChange} className="pe-select">
                  <option value="">Seçin</option>
                  <option value="very_tidy">Çox səliqəli</option>
                  <option value="average">Normal</option>
                  <option value="relaxed">Rahat</option>
                </select>
              </div>
              <div className="pe-field">
                <label className="pe-label">Səs-küy Tolerantlığı</label>
                <select name="noise_tolerance" value={formData.noise_tolerance} onChange={handleChange} className="pe-select">
                  <option value="">Seçin</option>
                  <option value="quiet">Sakit mühit</option>
                  <option value="moderate">Orta</option>
                  <option value="loud_ok">Fərq etmir</option>
                </select>
              </div>
              <div className="pe-field">
                <label className="pe-label">Qonaq Tezliyi</label>
                <select name="guest_frequency" value={formData.guest_frequency} onChange={handleChange} className="pe-select">
                  <option value="">Seçin</option>
                  <option value="rarely">Nadir</option>
                  <option value="sometimes">Hərdən</option>
                  <option value="often">Tez-tez</option>
                </select>
              </div>
              <div className="pe-field">
                <label className="pe-label">Din</label>
                <select name="religion" value={formData.religion} onChange={handleChange} className="pe-select">
                  <option value="">Seçin</option>
                  <option value="muslim">Müsəlman</option>
                  <option value="christian">Xristian</option>
                  <option value="secular">Sekulyar</option>
                  <option value="other">Digər</option>
                </select>
              </div>
            </div>
          </fieldset>

          {/* ---- Vərdişlər ---- */}
          <fieldset className="pe-fieldset">
            <legend>Vərdişlər</legend>
            <div className="pe-checks">
              <label className="pe-check">
                <input type="checkbox" name="smoking_habit"   checked={formData.smoking_habit}   onChange={handleChange} />
                Siqaret çəkirəm
              </label>
              <label className="pe-check">
                <input type="checkbox" name="drinks_alcohol"  checked={formData.drinks_alcohol}  onChange={handleChange} />
                Spirtli içki qəbul edirəm
              </label>
              <label className="pe-check">
                <input type="checkbox" name="pet_friendly"    checked={formData.pet_friendly}    onChange={handleChange} />
                Ev heyvanlarını sevərəm
              </label>
            </div>
          </fieldset>

          <Button type="submit" disabled={saving} style={{ width: '100%', marginTop: '0.5rem' }}>
            {saving ? 'Yadda saxlanılır...' : 'Dəyişiklikləri Yadda Saxla'}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default ProfileEdit;

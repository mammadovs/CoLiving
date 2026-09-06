import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';
import Button from '../components/Button/Button';
import './Onboarding.css';

const STEPS = 3;

function Onboarding() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    budget: '',
    sleep_schedule: '',
    cleanliness_level: '',
    religion: '',
    noise_tolerance: '',
    smoking_habit: false,
    drinks_alcohol: false,
    pet_friendly: false,
    guest_frequency: '',
    work_or_study_schedule: '',
    personality_type: ''
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleNext = () => {
    if (currentStep < STEPS) {
      setCurrentStep(curr => curr + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(curr => curr - 1);
  };

  const handleSkip = () => {
    redirectBasedOnRole();
  };

  const redirectBasedOnRole = () => {
    if (user?.is_student) {
      navigate('/listings');
    } else {
      navigate('/my-listings');
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError('');
    
    // Prepare payload (convert budget to number if provided, ignore empty strings)
    const payload = {};
    for (const [key, value] of Object.entries(formData)) {
      if (value !== '' && value !== null) {
        if (key === 'budget') {
          payload[key] = Number(value);
        } else {
          payload[key] = value;
        }
      }
    }

    try {
      await apiClient('/users/me', {
        method: 'PATCH',
        body: payload
      });
      redirectBasedOnRole();
    } catch (err) {
      setError(err.message || 'Məlumatları yeniləyərkən xəta baş verdi.');
    } finally {
      setIsLoading(false);
    }
  };

  const progressPercentage = ((currentStep) / STEPS) * 100;

  return (
    <div className="onboarding-page">
      <div className="onboarding-card">
        
        <div className="onboarding-header">
          <div className="onboarding-header-top">
            <h1>Profilini tamamla, daha yaxşı ev yoldaşı tap</h1>
            <button className="skip-btn" onClick={handleSkip}>Bunu keç</button>
          </div>
          <div className="progress-bar-container">
            <div className="progress-bar" style={{ width: `${progressPercentage}%` }}></div>
          </div>
          <p>Addım {currentStep} / {STEPS}</p>
        </div>

        {error && <div className="onboarding-error">{error}</div>}

        <div className="onboarding-content">
          {currentStep === 1 && (
            <div className="step-content">
              <h3>Büdcə və Şəxsiyyət</h3>
              
              <div className="form-group">
                <label>Aylıq Büdcə (AZN)</label>
                <input 
                  type="number" 
                  name="budget" 
                  value={formData.budget} 
                  onChange={handleChange} 
                  placeholder="Məs: 300"
                />
              </div>

              <div className="form-group">
                <label>Şəxsiyyət Tipi</label>
                <select name="personality_type" value={formData.personality_type} onChange={handleChange}>
                  <option value="">Seçin</option>
                  <option value="introvert">İntrovert (Sakit)</option>
                  <option value="extrovert">Ekstrovert (Sosial)</option>
                  <option value="ambivert">Ambivert (Hər ikisi)</option>
                </select>
              </div>

              <div className="form-group">
                <label>İş/Təhsil Qrafiki</label>
                <select name="work_or_study_schedule" value={formData.work_or_study_schedule} onChange={handleChange}>
                  <option value="">Seçin</option>
                  <option value="mostly_home">Çox vaxt evdə</option>
                  <option value="mostly_out">Çox vaxt çöldə</option>
                  <option value="mixed">Qarışıq</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Yuxu Rejimi</label>
                <select name="sleep_schedule" value={formData.sleep_schedule} onChange={handleChange}>
                  <option value="">Seçin</option>
                  <option value="early_bird">Erkən qalxan</option>
                  <option value="night_owl">Gecə quşu</option>
                  <option value="flexible">Sərbəst</option>
                </select>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="step-content">
              <h3>Həyat Tərzi və Vərdişlər</h3>
              
              <div className="form-group">
                <label>Təmizlik Səviyyəsi</label>
                <select name="cleanliness_level" value={formData.cleanliness_level} onChange={handleChange}>
                  <option value="">Seçin</option>
                  <option value="very_tidy">Çox səliqəli</option>
                  <option value="average">Normal</option>
                  <option value="relaxed">Rahat/Sərbəst</option>
                </select>
              </div>

              <div className="form-group">
                <label>Səs-küyə Tolerantlıq</label>
                <select name="noise_tolerance" value={formData.noise_tolerance} onChange={handleChange}>
                  <option value="">Seçin</option>
                  <option value="quiet">Sakitlik sevən</option>
                  <option value="moderate">Orta</option>
                  <option value="loud_ok">Səs-küy problem deyil</option>
                </select>
              </div>

              <div className="form-group">
                <label>Qonaq Tezliyi</label>
                <select name="guest_frequency" value={formData.guest_frequency} onChange={handleChange}>
                  <option value="">Seçin</option>
                  <option value="rarely">Nadir hallarda</option>
                  <option value="sometimes">Hərdən</option>
                  <option value="often">Tez-tez</option>
                </select>
              </div>

              <div className="form-group">
                <label>Din</label>
                <select name="religion" value={formData.religion} onChange={handleChange}>
                  <option value="">Seçin (İstəyə bağlı)</option>
                  <option value="muslim">Müsəlman</option>
                  <option value="christian">Xristian</option>
                  <option value="secular">Sekulyar/Dinsiz</option>
                  <option value="other">Digər</option>
                </select>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="step-content">
              <h3>Əlavə Üstünlüklər</h3>
              
              <div className="form-group-checkbox">
                <label>
                  <input 
                    type="checkbox" 
                    name="smoking_habit" 
                    checked={formData.smoking_habit} 
                    onChange={handleChange} 
                  />
                  <span>Siqaret çəkirsiniz?</span>
                </label>
              </div>

              <div className="form-group-checkbox">
                <label>
                  <input 
                    type="checkbox" 
                    name="drinks_alcohol" 
                    checked={formData.drinks_alcohol} 
                    onChange={handleChange} 
                  />
                  <span>Spirtli içki qəbul edirsiniz?</span>
                </label>
              </div>

              <div className="form-group-checkbox">
                <label>
                  <input 
                    type="checkbox" 
                    name="pet_friendly" 
                    checked={formData.pet_friendly} 
                    onChange={handleChange} 
                  />
                  <span>Ev heyvanlarına münasibətiniz yaxşıdır?</span>
                </label>
              </div>
            </div>
          )}
        </div>

        <div className="onboarding-actions">
          {currentStep > 1 ? (
            <Button type="button" onClick={handlePrev} className="btn-secondary">
              Geri
            </Button>
          ) : (
            <div></div> // empty spacer
          )}
          
          <Button type="button" onClick={handleNext} disabled={isLoading}>
            {isLoading ? 'Yüklənir...' : (currentStep === STEPS ? 'Tamamla' : 'İrəli')}
          </Button>
        </div>

      </div>
    </div>
  );
}

export default Onboarding;

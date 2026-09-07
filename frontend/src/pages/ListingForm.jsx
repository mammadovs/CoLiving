import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import Button from '../components/Button/Button';
import Input from '../components/Input/Input';
import './ListingForm.css';

const DISTRICTS = ['Nasimi', 'Yasamal', 'Sabail', 'Narimanov', 'Nizami', 'Khatai', 'Binagadi', 'Qaradagh', 'Sabunchu', 'Surakhani', 'Other'];
const UNIVERSITIES = ['ADA University', 'BDU', 'ADNSU', 'ATU', 'Khazar University', 'Other'];

function ListingForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  
  const [listingId, setListingId] = useState(id || null);
  const [imagesLoading, setImagesLoading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price_per_person: '',
    address: '',
    district: 'Other',
    nearest_university: 'ADA University',
    available_spots: '',
    phone_number: '',
    preferred_gender: 'any',
    smoking_allowed: false,
    alcohol_allowed: false,
    religion_preference: 'secular',
    has_wifi: true,
    is_furnished: true,
    is_active: true
  });

  useEffect(() => {
    if (isEditMode) {
      const fetchListing = async () => {
        try {
          const data = await apiClient(`/listings/${id}`);
          setFormData({
            title: data.title || '',
            description: data.description || '',
            price_per_person: data.price_per_person || '',
            address: data.address || '',
            district: data.district || 'Other',
            nearest_university: data.nearest_university || 'ADA University',
            available_spots: data.available_spots || '',
            phone_number: data.phone_number || '',
            preferred_gender: data.preferred_gender || 'any',
            smoking_allowed: Boolean(data.smoking_allowed),
            alcohol_allowed: Boolean(data.alcohol_allowed),
            religion_preference: data.religion_preference || 'secular',
            has_wifi: data.has_wifi !== false,
            is_furnished: data.is_furnished !== false,
            is_active: data.is_active !== false
          });
        } catch (err) {
          setError('Elan məlumatları yüklənə bilmədi.');
        } finally {
          setLoading(false);
        }
      };
      fetchListing();
    }
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateForm = () => {
    if (Number(formData.price_per_person) <= 0) {
      setError('Qiymət 0-dan böyük olmalıdır.');
      return false;
    }
    if (Number(formData.available_spots) <= 0) {
      setError('Boş yerlərin sayı 0-dan böyük olmalıdır.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) return;

    setSaving(true);
    try {
      const payload = {
        ...formData,
        price_per_person: Number(formData.price_per_person),
        available_spots: Number(formData.available_spots)
      };

      if (isEditMode) {
        await apiClient(`/listings/${id}`, {
          method: 'PUT',
          body: payload
        });
        navigate('/my-listings');
      } else {
        const result = await apiClient(`/listings/`, {
          method: 'POST',
          body: payload
        });
        setListingId(result.id);
        alert('Elan yaradıldı! İndi şəkil yükləyə bilərsiniz.');
        // Don't navigate yet, let them upload images
      }
    } catch (err) {
      setError(err.message || 'Elanı yadda saxlayarkən xəta baş verdi.');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !listingId) return;

    setImagesLoading(true);
    setUploadError(null);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formDataPayload = new FormData();
        formDataPayload.append('file', file);
        
        await apiClient(`/listings/${listingId}/images`, {
          method: 'POST',
          body: formDataPayload
        });
      }
      alert('Şəkillər uğurla yükləndi!');
      if (!isEditMode) {
        navigate('/my-listings');
      }
    } catch (err) {
      setUploadError(err.message || 'Şəkilləri yükləyərkən xəta baş verdi.');
    } finally {
      setImagesLoading(false);
      e.target.value = null;
    }
  };

  if (loading) {
    return <div className="form-loading">Yüklənir...</div>;
  }

  return (
    <div className="listing-form-page">
      <div className="listing-form-card">
        <h1>{isEditMode ? 'Elanı Redaktə Et' : 'Yeni Elan Yarat'}</h1>
        
        {error && <div className="form-error">{error}</div>}

        <form onSubmit={handleSubmit} className="listing-form">
          
          <div className="form-row">
            <Input
              label="Başlıq"
              name="title"
              placeholder="Məs: 2 otaqlı mənzildə 1 otaq yoldaşı axtarılır"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <Input
              label="Təsvir (Ətraflı)"
              name="description"
              type="textarea"
              placeholder="Mənzil və şərtlər haqqında ətraflı məlumat..."
              value={formData.description}
              onChange={handleChange}
              rows={4}
              required
            />
          </div>

          <div className="form-row split">
            <div className="form-group">
              <Input
                label="Aylıq Qiymət (AZN)"
                name="price_per_person"
                type="number"
                min="1"
                placeholder="Məs: 250"
                value={formData.price_per_person}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <Input
                label="Boş Yerlərin Sayı"
                name="available_spots"
                type="number"
                min="1"
                placeholder="Məs: 1"
                value={formData.available_spots}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row split">
            <div className="form-group">
              <label className="form-label">Rayon</label>
              <select name="district" value={formData.district} onChange={handleChange} className="form-select">
                {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Ən Yaxın Universitet</label>
              <select name="nearest_university" value={formData.nearest_university} onChange={handleChange} className="form-select">
                {UNIVERSITIES.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>

          <div className="form-row split">
            <div className="form-group">
              <Input
                label="Ünvan (Küçə, Bina)"
                name="address"
                placeholder="Məs: Nəsimi r., 28 May m/st yaxınlığı"
                value={formData.address}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <Input
                label="Əlaqə Nömrəsi"
                name="phone_number"
                placeholder="Məs: +994 50 123 45 67"
                value={formData.phone_number}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row split">
            <div className="form-group">
              <label className="form-label">Gender Tərcihi</label>
              <select name="preferred_gender" value={formData.preferred_gender} onChange={handleChange} className="form-select">
                <option value="any">Fərq etmir</option>
                <option value="male">Kişi</option>
                <option value="female">Qadın</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Din Tərcihi</label>
              <select name="religion_preference" value={formData.religion_preference} onChange={handleChange} className="form-select">
                <option value="secular">Sekulyar / Fərq etmir</option>
                <option value="muslim">Müsəlman</option>
                <option value="christian">Xristian</option>
                <option value="other">Digər</option>
              </select>
            </div>
          </div>

          <div className="form-toggles">
            <label className="toggle-label">
              <input type="checkbox" name="has_wifi" checked={formData.has_wifi} onChange={handleChange} />
              <span>WiFi var</span>
            </label>
            <label className="toggle-label">
              <input type="checkbox" name="is_furnished" checked={formData.is_furnished} onChange={handleChange} />
              <span>Əşyalıdır</span>
            </label>
            <label className="toggle-label">
              <input type="checkbox" name="smoking_allowed" checked={formData.smoking_allowed} onChange={handleChange} />
              <span>Siqaret icazəsi</span>
            </label>
            <label className="toggle-label">
              <input type="checkbox" name="alcohol_allowed" checked={formData.alcohol_allowed} onChange={handleChange} />
              <span>Spirtli içki icazəsi</span>
            </label>
          </div>
          
          <div className="form-row" style={{ marginTop: '1.5rem', borderTop: '1px solid #e5e7eb', paddingTop: '1.5rem' }}>
            <label className="toggle-label" style={{ fontWeight: '600' }}>
              <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleChange} />
              <span>Elan aktivdir</span>
            </label>
            <p style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.5rem', marginLeft: '2rem' }}>
              Sönülü olduqda elan axtarışda görünmür, lakin silinmir. İstədiyiniz zaman yenidən aktivləşdirə bilərsiniz.
            </p>
          </div>

          <div className="form-actions" style={{ marginTop: '2rem' }}>
            <Button type="submit" disabled={saving || (listingId && !isEditMode)} style={{ width: '100%' }}>
              {saving ? 'Yadda saxlanılır...' : (isEditMode ? 'Dəyişiklikləri Yadda Saxla' : 'Elanı Yarat')}
            </Button>
          </div>
        </form>

        {/* Image Upload Section - Visible only if editing or after creation */}
        {listingId && (
          <div className="image-upload-section">
            <h3>Şəkilləri Yüklə</h3>
            <p>Elanınıza bir və ya bir neçə şəkil əlavə edin.</p>
            {uploadError && <div className="form-error" style={{ marginBottom: '1rem' }}>{uploadError}</div>}
            
            <div className="upload-container">
              <input 
                type="file" 
                multiple 
                accept="image/*" 
                onChange={handleImageUpload} 
                disabled={imagesLoading}
                id="image-upload"
                className="file-input"
              />
              <label htmlFor="image-upload" className="file-label">
                {imagesLoading ? 'Yüklənir...' : 'Şəkilləri Seç və Yüklə'}
              </label>
            </div>
            
            {!isEditMode && (
              <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                <Button onClick={() => navigate('/my-listings')} style={{ background: '#4b5563' }}>
                  Bitir və Dashboard-a Dön
                </Button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

export default ListingForm;

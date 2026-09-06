import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';
import Button from '../components/Button/Button';
import LoadingState from '../components/LoadingState/LoadingState';
import EmptyState from '../components/EmptyState/EmptyState';
import ErrorState from '../components/ErrorState/ErrorState';
import CompatibilityView from '../components/CompatibilityView/CompatibilityView';
import { formatPrice, resolveImageUrl } from '../utils/format';
import './ListingDetail.css';

// lucide-react icons
import { MapPin, School, Users, Wifi, Sofa, Phone, Trash2, Edit, MessageCircle, Image as ImageIcon } from 'lucide-react';

function ListingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [listing, setListing] = useState(null);
  const [owner, setOwner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // '404' or 'ERROR'
  
  const [showCompat, setShowCompat] = useState(false);

  // Gallery State
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchListingAndOwner = async () => {
      setLoading(true);
      setError(null);
      try {
        const listingData = await apiClient(`/listings/${id}`);
        setListing(listingData);
        
        // Fetch owner info if user_id is provided
        if (listingData.user_id) {
          try {
             const ownerData = await apiClient(`/users/${listingData.user_id}`);
             setOwner(ownerData);
          } catch (ownerErr) {
             console.error("Owner info couldn't be loaded", ownerErr);
          }
        }
        
      } catch (err) {
        if (err.status === 404) {
          setError('404');
        } else {
          setError('ERROR');
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchListingAndOwner();
  }, [id]);

  const handleDelete = async () => {
    const confirmed = window.confirm('Bu elanı silmək istədiyinizə əminsiniz?');
    if (confirmed) {
      try {
        await apiClient(`/listings/${id}`, { method: 'DELETE' });
        navigate('/my-listings');
      } catch (err) {
        alert('Elan silinərkən xəta baş verdi.');
      }
    }
  };

  // Compat handled by CompatibilityView component

  if (loading) {
    return (
      <div className="listing-detail-page">
        <LoadingState variant="spinner" text="Elan yüklənir..." />
      </div>
    );
  }

  if (error === '404') {
    return (
      <div className="listing-detail-page">
        <EmptyState
          icon="🚫"
          title="Elan tapılmadı"
          description="Axtardığınız elan silinmiş və ya ümumiyyətlə mövcud deyil."
          ctaLabel="Elanlara Qayıt"
          onCta={() => navigate('/listings')}
        />
      </div>
    );
  }

  if (error === 'ERROR' || !listing) {
    return (
      <div className="listing-detail-page">
        <ErrorState
          message="Elan yüklənərkən xəta baş verdi. Zəhmət olmasa yenidən cəhd edin."
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  const isOwner = user && user.id === listing.user_id;
  const isStudent = user && user.is_student;

  // Images array-ini tam URL-lərə çevir (backend nisbi yol qaytarır: /static/...)
  const hasImages = listing.images && listing.images.length > 0;
  const images = hasImages
    ? listing.images.map(img => resolveImageUrl(img))
    : [];

  return (
    <div className="listing-detail-page">
      {/* Gallery Section */}
      <div className="listing-gallery">
        <div className="gallery-main">
          {hasImages ? (
            <img
              src={images[currentImageIndex]}
              alt={`Şəkil ${currentImageIndex + 1}`}
              loading="lazy"
              width={800}
              height={480}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <div className="gallery-placeholder">
              <ImageIcon size={56} strokeWidth={1.2} />
              <span>Şəkil əlavə edilməyib</span>
            </div>
          )}
          {images.length > 1 && (
            <>
              <button className="gallery-btn prev" onClick={() => setCurrentImageIndex(curr => (curr === 0 ? images.length - 1 : curr - 1))}>❮</button>
              <button className="gallery-btn next" onClick={() => setCurrentImageIndex(curr => (curr === images.length - 1 ? 0 : curr + 1))}>❯</button>
            </>
          )}
        </div>
        {images.length > 1 && (
          <div className="gallery-thumbnails">
            {images.map((imgUrl, idx) => (
              <img
                key={idx}
                src={imgUrl}
                alt={`Kiçik şəkil ${idx + 1}`}
                loading="lazy"
                width={110}
                height={75}
                className={currentImageIndex === idx ? 'active' : ''}
                onClick={() => setCurrentImageIndex(idx)}
              />
            ))}
          </div>
        )}
      </div>

      <div className="listing-detail-content">
        <div className="listing-main-info">
          <h1>{listing.title}</h1>
          <div className="listing-location">
            {listing.district && <span><MapPin size={18}/> {listing.district}</span>}
            {listing.nearest_university && <span><School size={18}/> {listing.nearest_university} yaxınlığında</span>}
          </div>
          <div className="listing-address">{listing.address}</div>
          
          <div className="listing-price-section">
            <h2 className="price">{formatPrice(listing.price_per_person)} AZN <span className="per-month">/ ay</span></h2>
            <div className="spots-badge">{listing.available_spots} yer boşdur</div>
          </div>
          
          <div className="listing-description">
            <h3>Haqqında</h3>
            <p>{listing.description}</p>
          </div>

          <div className="listing-badges">
             {listing.preferred_gender && listing.preferred_gender !== 'any' && (
               <div className="badge gender"><Users size={16}/> Yalnız {listing.preferred_gender === 'female' ? 'Qadın' : 'Kişi'}</div>
             )}
             {listing.has_wifi && <div className="badge wifi"><Wifi size={16}/> WiFi Var</div>}
             {listing.is_furnished && <div className="badge furnished"><Sofa size={16}/> Əşyalıdır</div>}
             {listing.smoking_allowed !== undefined && (
               <div className="badge default">{listing.smoking_allowed ? 'Siqaretə icazə var' : 'Siqaret çəkilmir'}</div>
             )}
             {listing.alcohol_allowed !== undefined && (
               <div className="badge default">{listing.alcohol_allowed ? 'Spirtli içkiyə icazə var' : 'Spirtli içki qadağandır'}</div>
             )}
             {listing.religion_preference && listing.religion_preference !== 'any' && (
               <div className="badge religion">Din üstünlüyü: {listing.religion_preference}</div>
             )}
          </div>
        </div>

        <div className="listing-sidebar">
          <div className="owner-card">
             <h3>Ev Sahibi</h3>
             <div className="owner-name">
               {owner ? (owner.full_name || owner.email) : 'Yüklənir...'}
             </div>
             {listing.phone_number && (
               <a href={`tel:${listing.phone_number}`} className="contact-link">
                 <Phone size={18}/> Əlaqə: {listing.phone_number}
               </a>
             )}
          </div>

          <div className="listing-actions">
            {isOwner ? (
              <>
                <Button onClick={() => navigate(`/listings/${id}/edit`)} className="btn-edit" style={{width: '100%'}}>
                  <Edit size={18} style={{marginRight: '8px'}}/> Redaktə et
                </Button>
                <Button onClick={handleDelete} style={{background: '#ef4444', color: 'white', width: '100%', marginTop: '0.5rem'}}>
                  <Trash2 size={18} style={{marginRight: '8px'}}/> Sil
                </Button>
              </>
            ) : (
              <>
                <Button onClick={() => navigate(`/messages/${listing.user_id}`)} className="btn-message" style={{width: '100%'}}>
                  <MessageCircle size={18} style={{marginRight: '8px'}}/> Mesaj Göndər
                </Button>
                {user && isStudent && owner && (
                  <Button
                    onClick={() => setShowCompat(true)}
                    className="btn-compat"
                    style={{width: '100%', marginTop: '0.5rem'}}
                  >
                    Uyğunluğu Yoxla
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Compatibility modal — must be inside the root div */}
      {showCompat && owner && (
        <CompatibilityView
          otherUserId={owner.id}
          inline={false}
          onClose={() => setShowCompat(false)}
        />
      )}
    </div>
  );
}

export default ListingDetail;

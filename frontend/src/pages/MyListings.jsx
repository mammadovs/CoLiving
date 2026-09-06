import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';
import Button from '../components/Button/Button';
import LoadingState from '../components/LoadingState/LoadingState';
import EmptyState from '../components/EmptyState/EmptyState';
import ErrorState from '../components/ErrorState/ErrorState';
import { formatPrice, getListingThumbnail } from '../utils/format';
import { Plus, Eye, Edit, Trash2, Image as ImageIcon } from 'lucide-react';
import './MyListings.css';

function MyListings() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  // TODO: backend-ə GET /listings/mine endpoint-i əlavə edilməsi tövsiyə olunur —
  // hazırda client-side filter: bütün elanlar çəkilir, listing.user_id === currentUser.id ilə filtrlənir
  const fetchMyListings = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    setError(false);
    try {
      // Sufficiently large limit to get all listings for client-side filter
      const data = await apiClient(`/listings/?limit=100`);
      const all = Array.isArray(data) ? data : (data.items || []);
      const mine = all.filter(l => l.user_id === user.id);
      setListings(mine);
    } catch (err) {
      setError(true);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchMyListings();
  }, [fetchMyListings]);

  const handleDelete = async (id) => {
    const confirmed = window.confirm('Bu elanı silmək istədiyinizə əminsiniz?');
    if (!confirmed) return;
    try {
      await apiClient(`/listings/${id}`, { method: 'DELETE' });
      setListings(prev => prev.filter(l => l.id !== id));
    } catch (err) {
      alert('Elan silinərkən xəta baş verdi.');
    }
  };

  // ----- RENDER STATES -----

  if (isLoading) {
    return (
      <div className="my-listings-page">
        <div className="my-listings-header" style={{ marginBottom: '1.5rem' }}>
          <div>
            <h1>Elanlarım</h1>
          </div>
        </div>
        <LoadingState variant="skeleton" count={4} skeletonHeight={350} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-listings-page">
        <div className="my-listings-header" style={{ marginBottom: '1.5rem' }}>
          <h1>Elanlarım</h1>
        </div>
        <ErrorState
          message="Elanlarınız yüklənərkən xəta baş verdi."
          onRetry={fetchMyListings}
        />
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="my-listings-page">
        <div className="my-listings-header" style={{ marginBottom: '1.5rem' }}>
          <h1>Elanlarım</h1>
        </div>
        <EmptyState
          icon="🏠"
          title="Hələ elanınız yoxdur"
          description="İlk elanınızı yaradın, potensial ev yoldaşları ilə tanış olun."
          ctaLabel="İlk elanını yarat"
          onCta={() => navigate('/listings/new')}
        />
      </div>
    );
  }

  return (
    <div className="my-listings-page">
      <div className="my-listings-header">
        <div>
          <h1>Elanlarım</h1>
          <p className="header-subtitle">{listings.length} elan tapıldı</p>
        </div>
        <Button onClick={() => navigate('/listings/new')} className="new-btn">
          <Plus size={18} style={{ marginRight: '8px' }} />
          Yeni elan yarat
        </Button>
      </div>

      <div className="my-listings-grid">
        {listings.map(listing => (
          <div key={listing.id} className={`my-listing-card ${!listing.is_active ? 'inactive' : ''}`}>
            <div className="my-listing-thumb">
              {(() => {
                const thumbSrc = getListingThumbnail(listing);
                return thumbSrc ? (
                  <img
                    src={thumbSrc}
                    alt={listing.title}
                    loading="lazy"
                    width={400}
                    height={220}
                    style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextSibling?.removeAttribute('style');
                    }}
                  />
                ) : null;
              })()} 
              {/* Placeholder — şəkil yoxdursa */}
              <div
                className="my-listing-thumb-placeholder"
                style={getListingThumbnail(listing) ? { display: 'none' } : {}}
              >
                <ImageIcon size={32} strokeWidth={1.5} />
                <span>Şəkil yoxdur</span>
              </div>
              <div className="listing-status-badge">
                {listing.is_active
                  ? <span className="badge-active">Aktiv</span>
                  : <span className="badge-inactive">Deaktiv</span>}
              </div>
              <div className="listing-price-badge">{formatPrice(listing.price_per_person)} AZN/ay</div>
            </div>

            <div className="my-listing-body">
              <h2 className="my-listing-title">{listing.title}</h2>
              <div className="my-listing-meta">
                {listing.district && <span>📍 {listing.district}</span>}
                {listing.nearest_university && <span>🎓 {listing.nearest_university}</span>}
                {listing.available_spots && <span>🛏 {listing.available_spots} boş yer</span>}
              </div>
            </div>

            <div className="my-listing-actions">
              <button
                className="action-btn view-btn"
                onClick={() => navigate(`/listings/${listing.id}`)}
                title="Bax"
              >
                <Eye size={18} /> <span>Bax</span>
              </button>
              <button
                className="action-btn edit-btn"
                onClick={() => navigate(`/listings/${listing.id}/edit`)}
                title="Redaktə"
              >
                <Edit size={18} /> <span>Redaktə</span>
              </button>
              <button
                className="action-btn delete-btn"
                onClick={() => handleDelete(listing.id)}
                title="Sil"
              >
                <Trash2 size={18} /> <span>Sil</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MyListings;

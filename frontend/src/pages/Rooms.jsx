import { useState, useEffect, useCallback, useMemo } from 'react';
import { apiClient } from '../api/client';
import Card from '../components/Card/Card';
import Button from '../components/Button/Button';
import LoadingState from '../components/LoadingState/LoadingState';
import EmptyState from '../components/EmptyState/EmptyState';
import ErrorState from '../components/ErrorState/ErrorState';
import './Rooms.css';


const DISTRICTS = ['Nasimi', 'Yasamal', 'Sabail', 'Narimanov', 'Nizami', 'Khatai', 'Binagadi', 'Qaradagh', 'Sabunchu', 'Surakhani', 'Other'];
const UNIVERSITIES = ['ADA University', 'BDU', 'ADNSU', 'ATU', 'Khazar University', 'Other'];

function Rooms() {
  const [filters, setFilters] = useState({
    nearest_university: '',
    district: '',
    min_price: '',
    max_price: '',
    preferred_gender: '',
    smoking_allowed: false,
    alcohol_allowed: false,
    religion_preference: '',
    has_wifi: false,
    is_furnished: false,
    min_available_spots: ''
  });

  const [debouncedFilters, setDebouncedFilters] = useState(filters);
  
  const limit = 10;
  const [skip, setSkip] = useState(0);

  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  // Debounce — 400ms (checkbox/select kliklərində hər dəfəsiniə API çağırmır)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters(filters);
      setSkip(0); // Filtr dəyişdikdə pagination-ı sıfırla
    }, 400);
    return () => clearTimeout(timer);
  }, [filters]);

  // useCallback — fetchListings hər render-də yenidən yaranır
  const fetchListings = useCallback(async () => {
    setIsLoading(true);
    setError(false);
    try {
      const query = new URLSearchParams();
      query.append('skip', skip);
      query.append('limit', limit);

      Object.entries(debouncedFilters).forEach(([key, value]) => {
        if (value !== '' && value !== false && value !== null) {
          query.append(key, value);
        }
      });

      const res = await apiClient(`/listings/?${query.toString()}`);

      // Handle both array and paginated object responses gracefully
      const data = Array.isArray(res) ? res : (res.items || []);

      setListings(data);
      setHasMore(data.length === limit);
    } catch (err) {
      setError(true);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedFilters, skip]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  // useCallback — handler-lər məmo-luşdurulub
  const handleFilterChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  }, []);

  const EMPTY_FILTERS = {
    nearest_university: '',
    district: '',
    min_price: '',
    max_price: '',
    preferred_gender: '',
    smoking_allowed: false,
    alcohol_allowed: false,
    religion_preference: '',
    has_wifi: false,
    is_furnished: false,
    min_available_spots: ''
  };

  const handleResetFilters = useCallback(() => {
    setFilters(EMPTY_FILTERS);
  }, []);

  return (
    <div className="rooms-page">
      <div className="rooms-header">
        <h1>Elan Axtar</h1>
        <p>Tələbə yoldaşları ilə rahat yaşayış yeri tapın.</p>
        {/* Mobile filter toggle */}
        <button
          className="filter-toggle-btn"
          onClick={() => setFilterOpen(prev => !prev)}
          aria-expanded={filterOpen}
        >
          {filterOpen ? '✕ Filtrləri Bağla' : '⚙ Filtrləri Göstər'}
        </button>
      </div>

      <div className="rooms-layout">
        {/* Filter Panel */}
        <aside className={`rooms-filters ${filterOpen ? 'filters-open' : ''}`}>
          <h3>Filtrlər</h3>
          
          <div className="filter-group">
            <label>District</label>
            <select name="district" value={filters.district} onChange={handleFilterChange}>
              <option value="">All Districts</option>
              {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <div className="filter-group">
            <label>University</label>
            <select name="nearest_university" value={filters.nearest_university} onChange={handleFilterChange}>
              <option value="">All Universities</option>
              {UNIVERSITIES.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <div className="filter-group" style={{ flex: 1 }}>
              <label>Min Price</label>
              <input type="number" name="min_price" value={filters.min_price} onChange={handleFilterChange} placeholder="0" />
            </div>
            <div className="filter-group" style={{ flex: 1 }}>
              <label>Max Price</label>
              <input type="number" name="max_price" value={filters.max_price} onChange={handleFilterChange} placeholder="Any" />
            </div>
          </div>

          <div className="filter-group">
            <label>Preferred Gender</label>
            <select name="preferred_gender" value={filters.preferred_gender} onChange={handleFilterChange}>
              <option value="">Any</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Religion Preference</label>
            <select name="religion_preference" value={filters.religion_preference} onChange={handleFilterChange}>
              <option value="">Any</option>
              <option value="muslim">Muslim</option>
              <option value="christian">Christian</option>
              <option value="secular">Secular</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label>Min Available Spots</label>
            <input type="number" name="min_available_spots" value={filters.min_available_spots} onChange={handleFilterChange} min="1" placeholder="1" />
          </div>

          <label className="filter-group-checkbox">
            <input type="checkbox" name="has_wifi" checked={filters.has_wifi} onChange={handleFilterChange} />
            WiFi Included
          </label>

          <label className="filter-group-checkbox">
            <input type="checkbox" name="is_furnished" checked={filters.is_furnished} onChange={handleFilterChange} />
            Furnished
          </label>
          
          <label className="filter-group-checkbox">
            <input type="checkbox" name="smoking_allowed" checked={filters.smoking_allowed} onChange={handleFilterChange} />
            Smoking Allowed
          </label>

          <label className="filter-group-checkbox">
            <input type="checkbox" name="alcohol_allowed" checked={filters.alcohol_allowed} onChange={handleFilterChange} />
            Alcohol Allowed
          </label>

        </aside>

        {/* Listings Grid */}
        <main className="rooms-main">
          {isLoading ? (
            <LoadingState variant="skeleton" count={6} skeletonHeight={360} />
          ) : error ? (
            <ErrorState
              message="Elanlar yüklənərkən xəta baş verdi."
              onRetry={fetchListings}
            />
          ) : listings.length === 0 ? (
            <EmptyState
              icon="🔍"
              title="Filtrinizə uyğun elan tapılmadı"
              description="Filtr şərtlərini dəyişdirərək yenidən cəhd edin."
              ctaLabel="Filtrləri sıfırla"
              onCta={handleResetFilters}
            />
          ) : (
            <>
              <div className="rooms-grid">
                {listings.map(listing => (
                  <Card 
                    key={listing.id}
                    id={listing.id}
                    title={listing.title}
                    price_per_person={listing.price_per_person}
                    district={listing.district}
                    nearest_university={listing.nearest_university}
                    image={listing.images && listing.images.length > 0 ? listing.images[0] : null}
                    has_wifi={listing.has_wifi}
                    is_furnished={listing.is_furnished}
                    preferred_gender={listing.preferred_gender}
                  />
                ))}
              </div>
              
              <div className="pagination-controls">
                <Button 
                  disabled={skip === 0} 
                  onClick={() => setSkip(prev => Math.max(0, prev - limit))}
                >
                  Previous
                </Button>
                <span>Page {Math.floor(skip / limit) + 1}</span>
                <Button 
                  disabled={!hasMore} 
                  onClick={() => setSkip(prev => prev + limit)}
                >
                  Next
                </Button>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default Rooms;
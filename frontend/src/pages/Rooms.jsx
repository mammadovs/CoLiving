import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { SlidersHorizontal, X } from 'lucide-react'
import Input from '../components/Input/Input'
import Card from '../components/Card/Card'
import Button from '../components/Button/Button'
import EmptyState from '../components/EmptyState/EmptyState'
import ErrorState from '../components/ErrorState/ErrorState'
import { listingsAPI } from '../api/listings'
import { resolveImageUrl } from '../utils/resolveImageUrl'
import { DISTRICTS, UNIVERSITIES, GENDERS, RELIGIONS } from '../data/options'
import './Rooms.css'


const DEFAULT_FILTERS = {
  nearest_university: '',
  district: '',
  min_price: '',
  max_price: '',
  preferred_gender: '',
  smoking_allowed: '',
  alcohol_allowed: '',
  religion_preference: '',
  has_wifi: '',
  is_furnished: '',
  min_available_spots: '',
}

/** Card-shaped skeleton shown while loading */
function CardSkeleton() {
  return (
    <div className="card-skeleton" aria-hidden="true">
      <div className="skeleton-image" />
      <div className="skeleton-body">
        <div className="skeleton-line skeleton-line--title" />
        <div className="skeleton-line skeleton-line--meta" />
        <div className="skeleton-line skeleton-line--meta" />
        <div className="skeleton-line skeleton-line--desc" />
        <div className="skeleton-line skeleton-line--desc" />
        <div className="skeleton-line skeleton-line--btn" />
      </div>
    </div>
  )
}

/** Sidebar / panel filter form — shared between desktop sidebar and mobile drawer */
function FilterPanel({ filters, updateFilter, onApply, onClear }) {
  return (
    <form className="filter-form" onSubmit={onApply}>

      <div className="filter-section">
        <span className="filter-section-title">Location</span>
        <label className="filter-field">
          <span>District</span>
          <select className="filter-input" value={filters.district} onChange={(e) => updateFilter('district', e.target.value)}>
            <option value="">Any</option>
            {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </label>
      </div>

      <div className="filter-section">
        <span className="filter-section-title">Study</span>
        <label className="filter-field">
          <span>University</span>
          <select className="filter-input" value={filters.nearest_university} onChange={(e) => updateFilter('nearest_university', e.target.value)}>
            <option value="">Any</option>
            {UNIVERSITIES.map((u) => <option key={u} value={u}>{u}</option>)}
          </select>
        </label>
      </div>

      <div className="filter-section">
        <span className="filter-section-title">Price (AZN)</span>
        <div className="filter-price-row">
          <label className="filter-field">
            <span>Min</span>
            <input type="number" min="0" placeholder="0" className="filter-input" value={filters.min_price}
              onChange={(e) => updateFilter('min_price', e.target.value)} />
          </label>
          <label className="filter-field">
            <span>Max</span>
            <input type="number" min="0" placeholder="Any" className="filter-input" value={filters.max_price}
              onChange={(e) => updateFilter('max_price', e.target.value)} />
          </label>
        </div>
      </div>

      <div className="filter-section">
        <span className="filter-section-title">Roommates</span>
        <label className="filter-field">
          <span>Preferred gender</span>
          <select className="filter-input" value={filters.preferred_gender} onChange={(e) => updateFilter('preferred_gender', e.target.value)}>
            <option value="">Any</option>
            {GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
        </label>
        <label className="filter-field" style={{ marginTop: 10 }}>
          <span>Religion preference</span>
          <select className="filter-input" value={filters.religion_preference} onChange={(e) => updateFilter('religion_preference', e.target.value)}>
            <option value="">Any</option>
            {RELIGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </label>
        <label className="filter-field" style={{ marginTop: 10 }}>
          <span>Min available spots</span>
          <input type="number" min="1" placeholder="1" className="filter-input" value={filters.min_available_spots}
            onChange={(e) => updateFilter('min_available_spots', e.target.value)} />
        </label>
      </div>

      <div className="filter-section">
        <span className="filter-section-title">Amenities</span>
        <div className="filter-checkboxes">
          {[
            ['has_wifi',        'Has WiFi'],
            ['is_furnished',    'Furnished'],
            ['smoking_allowed', 'Smoking allowed'],
            ['alcohol_allowed', 'Alcohol allowed'],
          ].map(([key, label]) => (
            <label key={key} className="filter-checkbox">
              <input
                type="checkbox"
                checked={filters[key] === 'true'}
                onChange={(e) => updateFilter(key, e.target.checked ? 'true' : '')}
              />
              <span>{label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="filter-actions">
        <Button type="button" variant="secondary" onClick={onClear}>Clear all</Button>
        <Button type="submit">Apply</Button>
      </div>

    </form>
  )
}

function Rooms() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [listings,     setListings]     = useState([])
  const [search,       setSearch]       = useState('')
  const [filters,      setFilters]      = useState(() => {
    const initial = { ...DEFAULT_FILTERS }
    searchParams.forEach((val, key) => {
      if (initial.hasOwnProperty(key)) {
        initial[key] = val
      }
    })
    return initial
  })
  const [showMobFilters, setShowMobFilters] = useState(false)
  const [status,       setStatus]       = useState('loading')
  const [errorMessage, setErrorMessage] = useState('')

  const loadListings = useCallback(async (activeFilters) => {
    setStatus('loading')
    setErrorMessage('')
    try {
      const clean = Object.fromEntries(
        Object.entries(activeFilters).filter(([, v]) => v !== '')
      )
      const response = await listingsAPI.getAll(clean)
      const loaded   = Array.isArray(response) ? response : response.items || []
      setListings(loaded)
      setStatus(loaded.length ? 'success' : 'empty')
    } catch (error) {
      setErrorMessage(error.data?.detail || error.message || 'Elanları yükləmək mümkün olmadı.')
      setStatus('error')
    }
  }, [])

  useEffect(() => { loadListings(filters) }, [loadListings, filters])

  const updateFilter = (key, value) =>
    setFilters((cur) => ({ ...cur, [key]: value }))

  const applyFilters = (e) => {
    e.preventDefault()
    setShowMobFilters(false)
    loadListings(filters)
  }

  const clearFilters = () => {
    setFilters(DEFAULT_FILTERS)
    loadListings(DEFAULT_FILTERS)
  }

  const filteredListings = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return listings
    return listings.filter((l) =>
      `${l.title || ''} ${l.address || ''} ${l.description || ''}`.toLowerCase().includes(q)
    )
  }, [listings, search])

  const activeFilterCount = Object.values(filters).filter((v) => v !== '').length

  return (
    <div className="rooms-page">

      {/* ── Page header ──────────────────────────── */}
      <header className="rooms-header">
        <div className="rooms-header-text">
          <span className="rooms-subtitle">COLIVING</span>
          <h1>Find a Room</h1>
          <p>Comfortable student housing across Baku — filtered to your lifestyle.</p>
        </div>

        <div className="rooms-topbar">
          <div className="rooms-search-wrap">
            <Input
              label="Search"
              placeholder="Search by title, location…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Mobile filter toggle */}
          <button
            type="button"
            className="rooms-mob-filter-btn"
            onClick={() => setShowMobFilters((v) => !v)}
            aria-expanded={showMobFilters}
          >
            <SlidersHorizontal size={16} strokeWidth={2} />
            Filters
            {activeFilterCount > 0 && (
              <span className="rooms-filter-badge">{activeFilterCount}</span>
            )}
          </button>
        </div>
      </header>

      {/* ── Mobile filter drawer ─────────────────── */}
      {showMobFilters && (
        <div className="rooms-mob-drawer">
          <div className="rooms-mob-drawer-head">
            <strong>Filters</strong>
            <button
              type="button"
              className="rooms-mob-drawer-close"
              onClick={() => setShowMobFilters(false)}
              aria-label="Close filters"
            >
              <X size={18} />
            </button>
          </div>
          <FilterPanel
            filters={filters}
            updateFilter={updateFilter}
            onApply={applyFilters}
            onClear={clearFilters}
          />
        </div>
      )}

      {/* ── Main layout: sidebar + grid ─────────── */}
      <div className="rooms-body">

        {/* Desktop sticky sidebar */}
        <aside className="rooms-sidebar">
          <div className="rooms-sidebar-inner">
            <div className="rooms-sidebar-head">
              <SlidersHorizontal size={15} strokeWidth={2} />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="rooms-filter-badge">{activeFilterCount}</span>
              )}
            </div>
            <FilterPanel
              filters={filters}
              updateFilter={updateFilter}
              onApply={applyFilters}
              onClear={clearFilters}
            />
          </div>
        </aside>

        {/* Results column */}
        <section className="rooms-results" aria-live="polite">
          <div className="rooms-results-head">
            <h2>
              {status === 'success'
                ? `${filteredListings.length} room${filteredListings.length !== 1 ? 's' : ''} found`
                : 'Available Rooms'}
            </h2>
          </div>

          {/* Skeleton loading */}
          {status === 'loading' && (
            <div className="rooms-grid">
              {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
            </div>
          )}

          {status === 'error' && (
            <ErrorState message={errorMessage} onRetry={() => loadListings(filters)} />
          )}

          {(status === 'empty' || (status === 'success' && !filteredListings.length)) && (
            <EmptyState title="No rooms found" message="Try adjusting your search or filters." />
          )}

          {status === 'success' && filteredListings.length > 0 && (
            <div className="rooms-grid">
              {filteredListings.map((listing) => (
                <Card
                  key={listing.id}
                  id={listing.id}
                  onViewDetails={() => navigate(`/rooms/${listing.id}`)}
                  title={listing.title}
                  location={listing.address}
                  roommates={listing.available_spots}
                  description={listing.description}
                  image={resolveImageUrl(listing.images?.[0]?.image_url)}
                  images={listing.images?.map((img) => resolveImageUrl(img.image_url)).filter(Boolean)}
                  price={listing.price_per_person}
                  rating={listing.rating ?? null}
                  reviewCount={listing.review_count ?? null}
                />
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  )
}

export default Rooms
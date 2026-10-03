import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Input from '../components/Input/Input'
import Card from '../components/Card/Card'
import Button from '../components/Button/Button'
import Spinner from '../components/Spinner/Spinner'
import EmptyState from '../components/EmptyState/EmptyState'
import ErrorState from '../components/ErrorState/ErrorState'
import { listingsAPI } from '../api/listings'
import { getImageUrl } from '../utils/imageUrl'
import './Rooms.css'

const PAGE_SIZE = 12

import { UNIVERSITIES, DISTRICTS, GENDERS, RELIGIONS } from '../constants/options'

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

function Rooms() {
  const navigate = useNavigate()
  const [listings, setListings] = useState([])
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  // appliedFilters is what the effect depends on — decoupled from the filter form
  const [appliedFilters, setAppliedFilters] = useState(DEFAULT_FILTERS)
  const [showFilters, setShowFilters] = useState(false)
  const [status, setStatus] = useState('loading')
  const [errorMessage, setErrorMessage] = useState('')
  const [skip, setSkip] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)

  useEffect(() => { document.title = 'Find a Room - CoLiving' }, [])

  const loadListings = useCallback(async (activeFilters, currentSkip, append = false) => {
    if (!append) setStatus('loading')
    setErrorMessage('')
    try {
      const cleanFilters = Object.fromEntries(
        Object.entries(activeFilters).filter(([, value]) => value !== '')
      )
      const response = await listingsAPI.getAll({ ...cleanFilters, limit: PAGE_SIZE, skip: currentSkip })
      const loaded = Array.isArray(response) ? response : response.items || []

      setHasMore(loaded.length === PAGE_SIZE)

      if (append) {
        setListings((prev) => [...prev, ...loaded])
      } else {
        setListings(loaded)
        setStatus(loaded.length ? 'success' : 'empty')
      }
    } catch (error) {
      setErrorMessage(error.data?.detail || error.message || 'Could not load the listings.')
      if (!append) setStatus('error')
    }
  }, [])

  // Only re-fetch when appliedFilters changes (not on every keystroke)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSkip(0)
    loadListings(appliedFilters, 0, false)
  }, [loadListings, appliedFilters])

  const updateFilter = (key, value) => setFilters((current) => ({ ...current, [key]: value }))

  // Checkboxes apply immediately
  const updateCheckboxFilter = (key, value) => {
    const next = { ...filters, [key]: value }
    setFilters(next)
    setAppliedFilters(next)
  }

  const applyFilters = (event) => {
    event.preventDefault()
    setAppliedFilters({ ...filters })
  }

  const clearFilters = () => {
    setFilters(DEFAULT_FILTERS)
    setAppliedFilters(DEFAULT_FILTERS)
  }

  const handleLoadMore = async () => {
    const nextSkip = skip + PAGE_SIZE
    setSkip(nextSkip)
    setLoadingMore(true)
    try {
      const cleanFilters = Object.fromEntries(
        Object.entries(appliedFilters).filter(([, value]) => value !== '')
      )
      const response = await listingsAPI.getAll({ ...cleanFilters, limit: PAGE_SIZE, skip: nextSkip })
      const loaded = Array.isArray(response) ? response : response.items || []
      setHasMore(loaded.length === PAGE_SIZE)
      setListings((prev) => [...prev, ...loaded])
      if (status !== 'success') setStatus('success')
    } catch (error) {
      setErrorMessage(error.data?.detail || error.message || 'Could not load the listings.')
    } finally {
      setLoadingMore(false)
    }
  }

  const filteredListings = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return listings
    return listings.filter((listing) =>
      `${listing.title || ''} ${listing.address || ''} ${listing.description || ''}`.toLowerCase().includes(query),
    )
  }, [listings, search])

  return (
    <div className="rooms-page">
      <div className="rooms-header-card">
        <span className="rooms-subtitle">COLIVING</span>
        <h1>Find a Room</h1>
        <p>Find a comfortable place to live with other students and ideal roommates.</p>

        <div className="rooms-search-bar">
          <Input
            label="Search"
            placeholder="Search by location, title..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <Button
            type="button"
            variant={showFilters ? 'primary' : 'secondary'}
            onClick={() => setShowFilters((current) => !current)}
          >
            {showFilters ? 'Hide filters' : 'Filters'}
          </Button>
        </div>
      </div>

      {showFilters && (
        <form className="rooms-filters-card animate-fade-in" onSubmit={applyFilters}>
          <div className="filter-grid">
            <label className="filter-field">
              <span>University</span>
              <select value={filters.nearest_university} onChange={(e) => updateFilter('nearest_university', e.target.value)}>
                <option value="">Any</option>
                {UNIVERSITIES.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </label>

            <label className="filter-field">
              <span>District</span>
              <select value={filters.district} onChange={(e) => updateFilter('district', e.target.value)}>
                <option value="">Any</option>
                {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </label>

            <label className="filter-field">
              <span>Min price (AZN)</span>
              <input type="number" min="0" placeholder="0" value={filters.min_price} onChange={(e) => updateFilter('min_price', e.target.value)} />
            </label>

            <label className="filter-field">
              <span>Max price (AZN)</span>
              <input type="number" min="0" placeholder="Any" value={filters.max_price} onChange={(e) => updateFilter('max_price', e.target.value)} />
            </label>

            <label className="filter-field">
              <span>Preferred gender</span>
              <select value={filters.preferred_gender} onChange={(e) => updateFilter('preferred_gender', e.target.value)}>
                <option value="">Any</option>
                {GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </label>

            <label className="filter-field">
              <span>Religion preference</span>
              <select value={filters.religion_preference} onChange={(e) => updateFilter('religion_preference', e.target.value)}>
                <option value="">Any</option>
                {RELIGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </label>

            <label className="filter-field">
              <span>Min available spots</span>
              <input type="number" min="1" placeholder="1" value={filters.min_available_spots} onChange={(e) => updateFilter('min_available_spots', e.target.value)} />
            </label>
          </div>

          <div className="filter-checkboxes">
            <label className="filter-checkbox">
              <input type="checkbox" checked={filters.has_wifi === 'true'} onChange={(e) => updateCheckboxFilter('has_wifi', e.target.checked ? 'true' : '')} />
              <span>Has WiFi</span>
            </label>

            <label className="filter-checkbox">
              <input type="checkbox" checked={filters.is_furnished === 'true'} onChange={(e) => updateCheckboxFilter('is_furnished', e.target.checked ? 'true' : '')} />
              <span>Furnished</span>
            </label>

            <label className="filter-checkbox">
              <input type="checkbox" checked={filters.smoking_allowed === 'true'} onChange={(e) => updateCheckboxFilter('smoking_allowed', e.target.checked ? 'true' : '')} />
              <span>Smoking allowed</span>
            </label>

            <label className="filter-checkbox">
              <input type="checkbox" checked={filters.alcohol_allowed === 'true'} onChange={(e) => updateCheckboxFilter('alcohol_allowed', e.target.checked ? 'true' : '')} />
              <span>Alcohol allowed</span>
            </label>
          </div>

          <div className="filter-actions">
            <Button type="button" variant="secondary" onClick={clearFilters}>Clear filters</Button>
            <Button type="submit">Apply filters</Button>
          </div>
        </form>
      )}

      <div className="rooms-results-section">
        <div className="rooms-results-header">
          <h2>Available Rooms</h2>
          {status === 'success' && (
            <span className="rooms-result-count">
              {filteredListings.length} room{filteredListings.length !== 1 ? 's' : ''} shown
              {hasMore && search && (
                <span className="rooms-search-hint"> · Searching in loaded rooms</span>
              )}
            </span>
          )}
        </div>

        {status === 'loading' && <Spinner />}
        {status === 'error' && <ErrorState message={errorMessage} onRetry={() => loadListings(appliedFilters, 0, false)} />}
        {(status === 'empty' || (status === 'success' && !filteredListings.length)) && (
          <EmptyState title="No matching listings found" message="Try changing your search and try again." />
        )}
        {status === 'success' && filteredListings.length > 0 && (
          <>
            <div className="rooms-list">
              {filteredListings.map((listing) => (
                <Card
                  key={listing.id}
                  onViewDetails={() => navigate(`/rooms/${listing.id}`)}
                  title={listing.title}
                  location={listing.address}
                  roommates={listing.available_spots}
                  description={listing.description}
                  image={getImageUrl(listing.images?.[0]?.image_url)}
                />
              ))}
            </div>

            {hasMore && (
              <div className="rooms-load-more">
                <Button
                  variant="secondary"
                  loading={loadingMore}
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                >
                  Load more
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default Rooms
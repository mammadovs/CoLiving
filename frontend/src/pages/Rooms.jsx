import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Input from '../components/Input/Input'
import Card from '../components/Card/Card'
import Button from '../components/Button/Button'
import Spinner from '../components/Spinner/Spinner'
import EmptyState from '../components/EmptyState/EmptyState'
import ErrorState from '../components/ErrorState/ErrorState'
import { listingsAPI } from '../api/listings'
import './Rooms.css'

const UNIVERSITIES = ['ADA University', 'BDU', 'ADNSU', 'ATU', 'Khazar University', 'Other']
const DISTRICTS = ['Nasimi', 'Yasamal', 'Sabail', 'Narimanov', 'Nizami', 'Khatai', 'Binagadi', 'Qaradagh', 'Sabunchu', 'Surakhani', 'Other']
const GENDERS = ['male', 'female', 'any']
const RELIGIONS = ['muslim', 'christian', 'secular', 'other']

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
  const [showFilters, setShowFilters] = useState(false)
  const [status, setStatus] = useState('loading')
  const [errorMessage, setErrorMessage] = useState('')

  const loadListings = useCallback(async (activeFilters) => {
    setStatus('loading')
    setErrorMessage('')
    try {
      // Strip empty values so we don't send ?district=&max_price= etc.
      const cleanFilters = Object.fromEntries(
        Object.entries(activeFilters).filter(([, value]) => value !== '')
      )
      const response = await listingsAPI.getAll(cleanFilters)
      const loadedListings = Array.isArray(response) ? response : response.items || []
      setListings(loadedListings)
      setStatus(loadedListings.length ? 'success' : 'empty')
    } catch (error) {
      setErrorMessage(error.data?.detail || error.message || 'Elanları yükləmək mümkün olmadı.')
      setStatus('error')
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadListings(filters)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const updateFilter = (key, value) => setFilters((current) => ({ ...current, [key]: value }))

  const applyFilters = (event) => {
    event.preventDefault()
    loadListings(filters)
  }

  const clearFilters = () => {
    setFilters(DEFAULT_FILTERS)
    loadListings(DEFAULT_FILTERS)
  }

  // Free-text search still happens client-side, on top of whatever the backend already filtered
  const filteredListings = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return listings
    return listings.filter((listing) =>
      `${listing.title || ''} ${listing.address || ''} ${listing.description || ''}`.toLowerCase().includes(query),
    )
  }, [listings, search])

  return (
    <div className="rooms-page">
      <div className="rooms-header">
        <h1>Find a Room</h1>

        <p>
          Find a comfortable place to live with other students.
        </p>

        <Input
          label="Search"
          placeholder="Search by location..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <Button type="button" variant="secondary" onClick={() => setShowFilters((current) => !current)}>
          {showFilters ? 'Hide filters' : 'Show filters'}
        </Button>
      </div>

      {showFilters && (
        <form className="rooms-filters" onSubmit={applyFilters}>
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
              <input type="number" min="0" value={filters.min_price} onChange={(e) => updateFilter('min_price', e.target.value)} />
            </label>

            <label className="filter-field">
              <span>Max price (AZN)</span>
              <input type="number" min="0" value={filters.max_price} onChange={(e) => updateFilter('max_price', e.target.value)} />
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
              <input type="number" min="1" value={filters.min_available_spots} onChange={(e) => updateFilter('min_available_spots', e.target.value)} />
            </label>

            <label className="filter-field filter-checkbox">
              <input type="checkbox" checked={filters.has_wifi === 'true'} onChange={(e) => updateFilter('has_wifi', e.target.checked ? 'true' : '')} />
              <span>Has WiFi</span>
            </label>

            <label className="filter-field filter-checkbox">
              <input type="checkbox" checked={filters.is_furnished === 'true'} onChange={(e) => updateFilter('is_furnished', e.target.checked ? 'true' : '')} />
              <span>Furnished</span>
            </label>

            <label className="filter-field filter-checkbox">
              <input type="checkbox" checked={filters.smoking_allowed === 'true'} onChange={(e) => updateFilter('smoking_allowed', e.target.checked ? 'true' : '')} />
              <span>Smoking allowed</span>
            </label>

            <label className="filter-field filter-checkbox">
              <input type="checkbox" checked={filters.alcohol_allowed === 'true'} onChange={(e) => updateFilter('alcohol_allowed', e.target.checked ? 'true' : '')} />
              <span>Alcohol allowed</span>
            </label>
          </div>

          <div className="filter-actions">
            <Button type="button" variant="secondary" onClick={clearFilters}>Clear filters</Button>
            <Button type="submit">Apply filters</Button>
          </div>
        </form>
      )}

      <h2>Available Rooms</h2>

      {status === 'loading' && <Spinner />}
      {status === 'error' && <ErrorState message={errorMessage} onRetry={() => loadListings(filters)} />}
      {(status === 'empty' || (status === 'success' && !filteredListings.length)) && (
        <EmptyState title="Uyğun elan tapılmadı" message="Axtarışınızı dəyişib yenidən yoxlayın." />
      )}
      {status === 'success' && filteredListings.length > 0 && (
        <div className="rooms-list">
          {filteredListings.map((listing) => (
            <Card
              key={listing.id}
              onViewDetails={() => navigate(`/rooms/${listing.id}`)}
              title={listing.title}
              location={listing.address}
              roommates={listing.available_spots}
              description={listing.description}
              image={listing.images?.[0]?.image_url}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default Rooms
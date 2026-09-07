import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Input from '../components/Input/Input'
import Card from '../components/Card/Card'
import Spinner from '../components/Spinner/Spinner'
import EmptyState from '../components/EmptyState/EmptyState'
import ErrorState from '../components/ErrorState/ErrorState'
import { listingsAPI } from '../api/listings'
import './Rooms.css'

function Rooms() {
  const navigate = useNavigate()
  const [listings, setListings] = useState([])
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('loading')
  const [errorMessage, setErrorMessage] = useState('')

  const loadListings = useCallback(async () => {
    setStatus('loading')
    setErrorMessage('')
    try {
      const response = await listingsAPI.getAll()
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
    loadListings()
  }, [loadListings])

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
      </div>

      <h2>Available Rooms</h2>

      {status === 'loading' && <Spinner />}
      {status === 'error' && <ErrorState message={errorMessage} onRetry={loadListings} />}
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
              image={listing.images?.[0]}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default Rooms